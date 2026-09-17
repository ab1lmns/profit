import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createApp } from './app.js';

const teachers = [
  { login: 'alice', password: 'password-a', name: 'Alice', tracks: ['it-solutions', 'web-technologies'] },
  { login: 'bob', password: 'password-b', name: 'Bob', tracks: ['3d-modeling'] },
];
async function fixture(t, accounts = teachers) {
  const dataDir = mkdtempSync(join(tmpdir(), 'profit-test-')); let time = Date.now();
  const server = createApp({ dataDir, teachers: accounts, now: () => time });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  const clients = [];
  function client() {
    const jar = {}, aborts = [];
    const c = {
      base,
      async request(path, method = 'GET', body, expected = 200, headers = {}) {
        const response = await fetch(c.base + '/api' + path, { method, headers: { cookie: Object.entries(jar).map(([k,v])=>`${k}=${v}`).join('; '), 'content-type': 'application/json', ...headers }, body: body === undefined ? undefined : JSON.stringify(body) });
        for (const cookie of response.headers.getSetCookie()) { const [key, value] = cookie.split(';')[0].split('='); jar[key] = value; }
        const data = await response.json(); assert.equal(response.status, expected, JSON.stringify(data)); return data;
      },
      async stream(id, role = 'participant') {
        const abort = new AbortController(); aborts.push(abort);
        const connection = crypto.randomUUID();
        const res = await fetch(`${base}/api/rooms/${id}/events?role=${role}&connection=${connection}`, { signal: abort.signal, headers: { cookie: Object.entries(jar).map(([k,v])=>`${k}=${v}`).join('; ') } });
        assert.equal(res.status, 200);
        const reader = res.body.getReader(); const first = new TextDecoder().decode((await reader.read()).value);
        assert.match(first, /event: config/);
        return { connection, first, reader };
      },
      async upload(path, data, expected = 200) {
        const res = await fetch(c.base + '/api' + path, { method: 'POST', headers: { cookie: Object.entries(jar).map(([k,v])=>`${k}=${v}`).join('; '), 'content-type': 'video/webm' }, body: data });
        const result = await res.json(); assert.equal(res.status, expected, JSON.stringify(result)); return result;
      },
      async download(path, expected = 200) {
        const res = await fetch(c.base + '/api' + path, { headers: { cookie: Object.entries(jar).map(([k,v])=>`${k}=${v}`).join('; ') } });
        assert.equal(res.status, expected); return Buffer.from(await res.arrayBuffer());
      },
      close() { aborts.forEach(a => a.abort()); },
    };
    clients.push(c); return c;
  }
  t.after(async () => { clients.forEach(c => c.close()); server.closeStreams(); server.closeAllConnections(); await new Promise(r => server.close(r)); rmSync(dataDir, { recursive: true, force: true }); });
  const teacher = client(); await teacher.request('/teacher/login', 'POST', { login: 'alice', password: 'password-a' });
  return { server, dataDir, teacher, client, advance: ms => { time += ms; } };
}
const create = (teacher, capacity = 2) => teacher.request('/rooms', 'POST', { trackId: 'it-solutions', capacity, taskIds: ['test'] }, 201);
const joinRoom = (c, r, number = '1', status = 201) => c.request(`/rooms/${r.id}/join`, 'POST', { name: 'Тестовый Участник', number, group: 'ИС-24', consent: true }, status);

test('teacher authentication, direction restrictions and room ownership', async t => {
  const { teacher, client } = await fixture(t); const outsider = client();
  await outsider.request('/catalog', 'GET', undefined, 401);
  await outsider.request('/teacher/login', 'POST', { login: 'alice', password: 'wrong' }, 401);
  const tracks = await teacher.request('/catalog'); assert.deepEqual(tracks.map(t => t.id), ['it-solutions','web-technologies']);
  assert.equal(JSON.stringify(tracks).includes('"c":'), false);
  await teacher.request('/rooms', 'POST', { trackId: '3d-modeling', capacity: 1, taskIds: ['test'] }, 403);
  const room = await create(teacher); await outsider.request('/teacher/login', 'POST', { login: 'bob', password: 'password-b' });
  await outsider.request(`/rooms/${room.id}`, 'GET', undefined, 403);
  await teacher.request('/rooms', 'POST', { trackId: 'it-solutions', capacity: 0, taskIds: ['test'] }, 400);
  await teacher.request('/rooms', 'POST', { trackId: 'it-solutions', capacity: 1, taskIds: ['fake'] }, 400);
  await teacher.request('/teacher/logout', 'POST', {}, 403, { origin: 'https://untrusted.example' });
  await teacher.request('/teacher/logout', 'POST'); await teacher.request('/rooms', 'GET', undefined, 401);
});

test('teacher can remove completed sessions and candidate profiles, but not a running session', async t => {
  const { teacher, client } = await fixture(t);
  const room = await create(teacher, 1);
  await teacher.request(`/rooms/${room.id}`, 'DELETE');
  await teacher.request(`/rooms/${room.id}`, 'GET', undefined, 404);

  const running = await create(teacher, 1), participant = client();
  await joinRoom(participant, running);
  await participant.stream(running.id);
  await participant.request(`/rooms/${running.id}/proctor`, 'POST', { type: 'screen_started' });
  await teacher.request(`/rooms/${running.id}/start`, 'POST', { durationMinutes: 10 });
  await teacher.request(`/rooms/${running.id}`, 'DELETE', undefined, 409);

  const candidate = client();
  const registered = await candidate.request('/candidates/register', 'POST', { name: 'Кандидат Тестовый', email: 'candidate@example.test', password: 'password', directions: ['it-solutions'] }, 201);
  await teacher.request(`/candidates/${registered.candidate.id}`, 'DELETE');
  const list = await teacher.request('/candidates');
  assert.equal(list.candidates.length, 0);
  await candidate.request('/candidates/me', 'GET', undefined, 401);
});

test('English result appears only after submission for the participant and teacher', async t => {
  const englishTeachers = [{ ...teachers[0], tracks: [...teachers[0].tracks, 'english'] }, teachers[1]];
  const { teacher, client } = await fixture(t, englishTeachers);
  const room = await teacher.request('/rooms', 'POST', { trackId: 'english', capacity: 1, taskIds: ['test'] }, 201);
  const participant = client();
  const joined = await joinRoom(participant, room);
  assert.equal(joined.tasks[0].questions.length, 30);
  assert.equal(joined.participant.score, null);
  await participant.stream(room.id);
  await participant.request(`/rooms/${room.id}/proctor`, 'POST', { type: 'screen_started' });
  await teacher.request(`/rooms/${room.id}/start`, 'POST', { durationMinutes: 10 });
  const choices = {};
  const correctKeys = (await teacher.request('/teacher/catalog')).find(track => track.id === 'english').tasks[0].questions;
  for (let index = 0; index < 7; index++) choices[index] = correctKeys[index].c;
  for (let index = 10; index < 16; index++) choices[index] = correctKeys[index].c;
  await participant.request(`/rooms/${room.id}/answers`, 'PUT', { revision: 0, answers: { test: { choices } } });
  const pending = await participant.request(`/rooms/${room.id}/me`);
  assert.equal(pending.participant.score, null);
  const submitted = await participant.request(`/rooms/${room.id}/submit`, 'POST');
  assert.equal(submitted.participant.score.englishLevel, 'B1');
  assert.equal(submitted.participant.score.correct, 13);
  const teacherDetail = await teacher.request(`/rooms/${room.id}/participants/${joined.participant.id}`);
  assert.equal(teacherDetail.score.englishLevel, 'B1');
});

test('teacher selects subject tests and receives results for each selected subject', async t => {
  const subjectTeachers = [{ ...teachers[0], tracks: [...teachers[0].tracks, 'subject-disciplines'] }, teachers[1]];
  const { teacher, client } = await fixture(t, subjectTeachers);
  const taskIds = ['subject-mathematics', 'subject-informatics'];
  const room = await teacher.request('/rooms', 'POST', { trackId: 'subject-disciplines', capacity: 1, taskIds }, 201);
  assert.deepEqual(room.tasks.map(task => task.id), taskIds);
  assert.equal(room.tasks.every(task => task.questions.length === 10), true);
  const participant = client(), joined = await joinRoom(participant, room);
  assert.equal(joined.tasks.length, 2);
  await participant.stream(room.id);
  await participant.request(`/rooms/${room.id}/proctor`, 'POST', { type: 'screen_started' });
  await teacher.request(`/rooms/${room.id}/start`, 'POST', { durationMinutes: 10 });
  const keys = (await teacher.request('/teacher/catalog')).find(track => track.id === 'subject-disciplines').tasks;
  const answers = Object.fromEntries(taskIds.map(id => [id, { choices: { 0: keys.find(task => task.id === id).questions[0].c } }]));
  await participant.request(`/rooms/${room.id}/answers`, 'PUT', { revision: 0, answers });
  const submitted = await participant.request(`/rooms/${room.id}/submit`, 'POST');
  assert.equal(submitted.participant.score.correct, 2);
  assert.equal(submitted.participant.score.total, 20);
  assert.deepEqual(submitted.participant.score.subjects.map(subject => subject.correct), [1, 1]);
  const detail = await teacher.request(`/rooms/${room.id}/participants/${joined.participant.id}`);
  assert.equal(detail.answerReview.length, 2);
  assert.equal(detail.score.subjects.length, 2);

  await teacher.request('/rooms', 'POST', { trackId: 'subject-disciplines', capacity: 1, taskIds: [taskIds[0]], combineSubjects: true }, 400);
  const combined = await teacher.request('/rooms', 'POST', { trackId: 'subject-disciplines', capacity: 1, taskIds, combineSubjects: true }, 201);
  assert.equal(combined.tasks.length, 1);
  assert.equal(combined.tasks[0].questions.length, 20);
  assert.deepEqual(combined.tasks[0].subjectSections.map(section => section.start), [0, 10]);
  assert.equal(combined.tasks[0].questions[0].c, undefined);
  const combinedParticipant = client();
  await joinRoom(combinedParticipant, combined);
  await combinedParticipant.stream(combined.id);
  await combinedParticipant.request(`/rooms/${combined.id}/proctor`, 'POST', { type: 'screen_started' });
  await teacher.request(`/rooms/${combined.id}/start`, 'POST', { durationMinutes: 10 });
  await combinedParticipant.request(`/rooms/${combined.id}/answers`, 'PUT', { revision: 0, answers: { 'combined-subject-test': { choices: { 0: keys.find(task => task.id === taskIds[0]).questions[0].c, 10: keys.find(task => task.id === taskIds[1]).questions[0].c } } } });
  const combinedResult = await combinedParticipant.request(`/rooms/${combined.id}/submit`, 'POST');
  assert.equal(combinedResult.participant.score.correct, 2);
  assert.equal(combinedResult.participant.score.total, 20);
  assert.deepEqual(combinedResult.participant.score.subjects.map(subject => subject.correct), [1, 1]);
});

test('teacher can run Blender or Unity separately and combine them into one 3D test', async t => {
  const modelingTeachers = [{ ...teachers[0], tracks: [...teachers[0].tracks, '3d-modeling'] }, teachers[1]];
  const { teacher, client } = await fixture(t, modelingTeachers);
  const blender = await teacher.request('/rooms', 'POST', { trackId: '3d-modeling', capacity: 1, taskIds: ['blender'] }, 201);
  assert.deepEqual(blender.tasks.map(task => task.id), ['blender']);
  assert.equal(blender.tasks[0].questions.length, 15);
  const unity = await teacher.request('/rooms', 'POST', { trackId: '3d-modeling', capacity: 1, taskIds: ['unity'] }, 201);
  assert.deepEqual(unity.tasks.map(task => task.id), ['unity']);
  assert.equal(unity.tasks[0].questions.length, 15);
  await teacher.request('/rooms', 'POST', { trackId: '3d-modeling', capacity: 1, taskIds: ['blender'], combineTasks: true }, 400);
  const combined = await teacher.request('/rooms', 'POST', { trackId: '3d-modeling', capacity: 1, taskIds: ['blender', 'unity'], combineTasks: true }, 201);
  assert.deepEqual(combined.tasks.map(task => task.id), ['combined-3d-test']);
  assert.equal(combined.tasks[0].questions.length, 30);
  assert.deepEqual(combined.tasks[0].subjectSections.map(section => section.start), [0, 15]);
  assert.ok(combined.tasks[0].questions.every(question => question.c === undefined));
  const participant = client();
  await joinRoom(participant, combined);
  await participant.stream(combined.id);
  await participant.request(`/rooms/${combined.id}/proctor`, 'POST', { type: 'screen_started' });
  await teacher.request(`/rooms/${combined.id}/start`, 'POST', { durationMinutes: 10 });
  const keys = (await teacher.request('/teacher/catalog')).find(track => track.id === '3d-modeling').tasks;
  await participant.request(`/rooms/${combined.id}/answers`, 'PUT', { revision: 0, answers: { 'combined-3d-test': { choices: { 0: keys[0].questions[0].c, 15: keys[1].questions[0].c } } } });
  const submitted = await participant.request(`/rooms/${combined.id}/submit`, 'POST');
  assert.equal(submitted.participant.score.correct, 2);
  assert.equal(submitted.participant.score.total, 30);
  assert.deepEqual(submitted.participant.score.subjects.map(section => section.correct), [1, 1]);
});

test('graphic design runs as one 30-question test with protected answers', async t => {
  const designTeachers = [{ ...teachers[0], tracks: [...teachers[0].tracks, 'graphic-design'] }, teachers[1]];
  const { teacher, client } = await fixture(t, designTeachers);
  await teacher.request('/rooms', 'POST', { trackId: 'graphic-design', capacity: 1, taskIds: ['figma'] }, 400);
  const room = await teacher.request('/rooms', 'POST', { trackId: 'graphic-design', capacity: 1, taskIds: ['test'] }, 201);
  assert.deepEqual(room.tasks.map(task => task.id), ['test']);
  assert.equal(room.tasks[0].questions.length, 30);
  assert.ok(room.tasks[0].questions.every(question => question.c === undefined));
  const participant = client();
  await joinRoom(participant, room);
  await participant.stream(room.id);
  await participant.request(`/rooms/${room.id}/proctor`, 'POST', { type: 'screen_started' });
  await teacher.request(`/rooms/${room.id}/start`, 'POST', { durationMinutes: 10 });
  const key = (await teacher.request('/teacher/catalog')).find(track => track.id === 'graphic-design').tasks[0];
  await participant.request(`/rooms/${room.id}/answers`, 'PUT', { revision: 0, answers: { test: { choices: { 0: key.questions[0].c, 10: key.questions[10].c, 20: key.questions[20].c } } } });
  const submitted = await participant.request(`/rooms/${room.id}/submit`, 'POST');
  assert.equal(submitted.participant.score.correct, 3);
  assert.equal(submitted.participant.score.total, 30);
  assert.equal(submitted.participant.score.subjects, undefined);
});

test('shared link registration, duplicate numbers, capacity and identity isolation', async t => {
  const { teacher, client } = await fixture(t), room = await create(teacher, 2);
  const a = client(), b = client(), stranger = client();
  const registered = await joinRoom(a, room); assert.equal(registered.participant.name, 'Тестовый Участник');
  assert.equal(registered.participants, undefined); assert.equal(JSON.stringify(registered.tasks).includes('"c":'), false);
  await joinRoom(a, room, '1', 200); await joinRoom(b, room, '1', 409); await joinRoom(b, room, '2'); await joinRoom(stranger, room, '3', 409);
  const publicRoom = await stranger.request(`/rooms/${room.id}/public`); assert.equal(publicRoom.tasks, undefined); assert.equal(publicRoom.participants, undefined);
  await stranger.request(`/rooms/${room.id}/me`, 'GET', undefined, 401);
  await b.request(`/rooms/${room.id}/participants/${registered.participant.id}`, 'GET', undefined, 401);
  const state = await teacher.request(`/rooms/${room.id}`); assert.equal(state.registered, 2);
});

test('server enforces common start, screen readiness, answers, submission and deadline', async t => {
  const { teacher, client, advance } = await fixture(t), room = await create(teacher);
  const a = client(), b = client(); await joinRoom(a, room); await joinRoom(b, room, '2');
  const save = { answers: { test: { choices: { 0: 0 } } }, revision: 0 };
  await a.request(`/rooms/${room.id}/answers`, 'PUT', save, 409);
  await teacher.request(`/rooms/${room.id}/start`, 'POST', { durationMinutes: 2 }, 409);
  await a.stream(room.id); await b.stream(room.id);
  await a.request(`/rooms/${room.id}/proctor`, 'POST', { type: 'screen_started' });
  await b.request(`/rooms/${room.id}/proctor`, 'POST', { type: 'screen_started' });
  const started = await teacher.request(`/rooms/${room.id}/start`, 'POST', { durationMinutes: 2 }); assert.equal(started.endsAt - started.startedAt, 120000);
  await teacher.request(`/rooms/${room.id}/start`, 'POST', { durationMinutes: 2 }, 409);
  await joinRoom(client(), room, '3', 409);
  const saved = await a.request(`/rooms/${room.id}/answers`, 'PUT', save); assert.equal(saved.revision, 1);
  await a.request(`/rooms/${room.id}/answers`, 'PUT', save, 409);
  await a.request(`/rooms/${room.id}/answers`, 'PUT', { answers: { fake: {} }, revision: 1 }, 400);
  await a.request(`/rooms/${room.id}/answers`, 'PUT', { answers: { test: { choices: { 0: 99 } } }, revision: 1 }, 400);
  await a.request(`/rooms/${room.id}/proctor`, 'POST', { type: 'screen_stopped' });
  await a.request(`/rooms/${room.id}/answers`, 'PUT', { ...save, revision: 1 }, 409);
  await a.request(`/rooms/${room.id}/proctor`, 'POST', { type: 'screen_started' });
  const submitted = await a.request(`/rooms/${room.id}/submit`, 'POST'); assert.ok(submitted.participant.submittedAt);
  assert.equal(submitted.participant.score.correct, 1);
  await a.request(`/rooms/${room.id}/submit`, 'POST');
  await a.request(`/rooms/${room.id}/answers`, 'PUT', { ...save, revision: 1 }, 409);
  const details = await teacher.request(`/rooms/${room.id}/participants/${submitted.participant.id}?history=1`);
  assert.equal(details.score.correct, 1); assert.equal(details.history.length, 1); assert.ok(details.events.some(e => e.type === 'screen_stopped'));
  assert.equal(details.answerReview[0].questions[0].selectedIndex, 0);
  assert.equal(details.answerReview[0].questions[0].correctIndex, 0);
  await teacher.request(`/rooms/${room.id}/participants/${submitted.participant.id}/grade`, 'POST', { score: 85, comment: 'Хорошая работа' });
  advance(120001);
  await b.request(`/rooms/${room.id}/answers`, 'PUT', save, 409);
  const final = await b.request(`/rooms/${room.id}/me`); assert.equal(final.status, 'finished'); assert.ok(final.participant.submittedAt);
});

test('authenticated signaling works only between teacher and participant in same room', async t => {
  const { teacher, client } = await fixture(t), room = await create(teacher), otherRoom = await create(teacher);
  const a = client(), b = client(); await joinRoom(a, room); await joinRoom(b, otherRoom);
  const viewer = await teacher.stream(room.id, 'teacher'), candidate = await a.stream(room.id), other = await b.stream(otherRoom.id);
  await teacher.request(`/rooms/${room.id}/signal`, 'POST', { from: viewer.connection, to: candidate.connection, type: 'watch' });
  await a.request(`/rooms/${room.id}/signal`, 'POST', { from: candidate.connection, to: viewer.connection, type: 'offer', payload: { type: 'offer', sdp: 'test' } });
  await a.request(`/rooms/${room.id}/signal`, 'POST', { from: viewer.connection, to: candidate.connection, type: 'watch' }, 401);
  await a.request(`/rooms/${room.id}/signal`, 'POST', { from: candidate.connection, to: viewer.connection, type: 'watch' }, 403);
  await teacher.request(`/rooms/${room.id}/signal`, 'POST', { from: viewer.connection, to: other.connection, type: 'watch' }, 404);
});

test('room state, teacher sessions and participant answers survive server restart', async t => {
  const { server, dataDir, teacher, client } = await fixture(t), room = await create(teacher);
  const student = client(); const joined = await joinRoom(student, room);
  await student.stream(room.id); await student.request(`/rooms/${room.id}/proctor`, 'POST', { type: 'screen_started' });
  await teacher.request(`/rooms/${room.id}/start`, 'POST', { durationMinutes: 120 });
  await student.request(`/rooms/${room.id}/answers`, 'PUT', { answers: { test: { choices: { 0: 0 } } }, revision: 0 });
  const chunk = crypto.randomUUID(), bytes = Buffer.from([0x1a, 0x45, 0xdf, 0xa3, 0]);
  await student.upload(`/rooms/${room.id}/recordings?chunk=${chunk}`, bytes);
  server.closeStreams();
  const restarted = createApp({ dataDir, teachers });
  await new Promise(r => restarted.listen(0, '127.0.0.1', r));
  t.after(() => new Promise(r => restarted.close(r)));
  const raw = JSON.parse((await import('node:fs')).readFileSync(join(dataDir, 'state.json'), 'utf8'));
  assert.equal(raw.rooms[0].participants[0].answers.test.choices[0], 0);
  assert.ok(raw.rooms[0].participants[0].tokenHash); assert.equal(raw.rooms[0].participants[0].token, undefined);
  assert.ok(Object.keys(raw.auth).length); assert.equal(raw.rooms[0].participants[0].id, joined.participant.id);
  student.base = teacher.base = `http://127.0.0.1:${restarted.address().port}`;
  const restored = await student.request(`/rooms/${room.id}/me`);
  assert.equal(restored.participant.answers.test.choices[0], 0);
  assert.equal(restored.participant.revision, 1);
  const teacherState = await teacher.request(`/rooms/${room.id}`);
  assert.equal(teacherState.participants[0].screen, false);
  assert.equal(teacherState.participants[0].online, false);
  assert.equal(teacherState.participants[0].recordingCount, 1);
  const saved = await teacher.request(`/rooms/${room.id}/participants/${joined.participant.id}`);
  assert.ok(saved.events.some(e => e.type === 'recording_saved'));
  assert.deepEqual(await teacher.download(`/rooms/${room.id}/participants/${joined.participant.id}/recordings/${chunk}?download=1`), bytes);
});


test('screen recordings are idempotent, stored and readable only by the session teacher', async t => {
  const { teacher, client } = await fixture(t), room = await create(teacher);
  const a = client(), stranger = client(); const joined = await joinRoom(a, room);
  await a.stream(room.id); await a.request(`/rooms/${room.id}/proctor`, 'POST', { type: 'screen_started' });
  const chunk = crypto.randomUUID(), path = `/rooms/${room.id}/recordings?chunk=${chunk}`;
  const bytes = Buffer.from([0x1a, 0x45, 0xdf, 0xa3, 0, 0, 0, 0]); // Storage fixture, not a media-playback test.
  await a.upload(path, bytes, 409);
  await teacher.request(`/rooms/${room.id}/start`, 'POST', { durationMinutes: 1 });
  await a.upload(path, bytes); await a.upload(path, bytes);
  await a.upload(`/rooms/${room.id}/recordings?chunk=${crypto.randomUUID()}`, Buffer.from('invalid'), 400);
  const details = await teacher.request(`/rooms/${room.id}/participants/${joined.participant.id}`);
  assert.equal(details.recordings.length, 1);
  const download = `/rooms/${room.id}/participants/${joined.participant.id}/recordings/${chunk}`;
  assert.deepEqual(await teacher.download(download), bytes);
  await stranger.download(download, 401); await a.download(download, 401);
});

test('reopening participant connection resets screen readiness and replaces the previous connection', async t => {
  const { teacher, client } = await fixture(t), room = await create(teacher);
  const a = client(); await joinRoom(a, room); const first = await a.stream(room.id);
  await a.request(`/rooms/${room.id}/proctor`, 'POST', { type: 'screen_started' });
  const next = await a.stream(room.id);
  const connections = await teacher.request(`/rooms/${room.id}/connections`);
  assert.equal(connections.length, 1); assert.equal(connections[0].id, next.connection); assert.notEqual(next.connection, first.connection);
  const status = await teacher.request(`/rooms/${room.id}`); assert.equal(status.participants[0].screen, false);
  await teacher.request(`/rooms/${room.id}/start`, 'POST', { durationMinutes: 120 }, 409);
});

test('teacher can monitor multiple participants and sees complete activity and recording metadata', async t => {
  const { teacher, client } = await fixture(t), room = await create(teacher);
  const a = client(), b = client(); const joinedA = await joinRoom(a, room), joinedB = await joinRoom(b, room, '2');
  const viewer = await teacher.stream(room.id, 'teacher'), streamA = await a.stream(room.id), streamB = await b.stream(room.id);
  for (const connection of [streamA, streamB]) await teacher.request(`/rooms/${room.id}/signal`, 'POST', { from: viewer.connection, to: connection.connection, type: 'watch' });
  for (const c of [a, b]) await c.request(`/rooms/${room.id}/proctor`, 'POST', { type: 'screen_started' });
  await teacher.request(`/rooms/${room.id}/start`, 'POST', { durationMinutes: 120 });
  await a.request(`/rooms/${room.id}/proctor`, 'POST', { type: 'recording_started' });
  await a.request(`/rooms/${room.id}/proctor`, 'POST', { type: 'task_opened', detail: 'not-a-task' }, 400);
  await a.request(`/rooms/${room.id}/proctor`, 'POST', { type: 'task_opened', detail: 'test' });
  for (const type of ['tab_hidden','tab_visible','window_blur','window_focus','fullscreen_enter','fullscreen_exit','paste']) await a.request(`/rooms/${room.id}/proctor`, 'POST', { type, detail: type === 'paste' ? '25 символов' : '' });
  await a.request(`/rooms/${room.id}/answers`, 'PUT', { answers: { test: { choices: { 0: 0 } } }, revision: 0 });
  const chunk = crypto.randomUUID();
  await a.upload(`/rooms/${room.id}/recordings?chunk=${chunk}`, Buffer.from([0x1a, 0x45, 0xdf, 0xa3, 0]));
  const overview = await teacher.request(`/rooms/${room.id}`), participant = overview.participants.find(p => p.id === joinedA.participant.id);
  assert.equal(participant.recordingState, 'recording'); assert.equal(participant.recordingCount, 1); assert.ok(participant.lastRecordingAt);
  assert.equal(participant.activeTaskId, 'test'); assert.equal(participant.lastEvent.type, 'recording_saved');
  const detail = await teacher.request(`/rooms/${room.id}/participants/${participant.id}?history=1`);
  assert.equal(participant.logVersion, detail.events.length);
  for (const type of ['session_started','task_opened','answers_saved','recording_started','recording_saved','tab_visible','window_focus','fullscreen_enter']) assert.ok(detail.events.some(e => e.type === type), type);
  assert.equal(detail.history[0].answer.choices[0], 0);
  const ownState = await b.request(`/rooms/${room.id}/me`); assert.equal(ownState.participants, undefined);
  await b.request(`/rooms/${room.id}/participants/${participant.id}`, 'GET', undefined, 401);
  await a.request(`/rooms/${room.id}/submit`, 'POST');
  // Final recorder callbacks are allowed after submit and remain visible to the teacher.
  await a.request(`/rooms/${room.id}/proctor`, 'POST', { type: 'recording_stopped' });
  await a.request(`/rooms/${room.id}/proctor`, 'POST', { type: 'recording_error', detail: 'Последний фрагмент не загружен' });
  const final = await teacher.request(`/rooms/${room.id}`);
  assert.equal(final.participants.find(p => p.id === participant.id).recordingState, 'error');
  assert.equal(final.participants.find(p => p.id === joinedB.participant.id).recordingCount, 0);
});
