import http from 'node:http';
import { randomBytes, createHash, scryptSync, timingSafeEqual } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync, appendFileSync, renameSync, statSync, createReadStream, unlinkSync } from 'node:fs';
import { join, resolve, extname } from 'node:path';
import { catalog, findTrack, publicTask, score, combineSubjectTasks, combineModelingTasks } from './catalog.js';

const uid = () => randomBytes(18).toString('hex');
const digest = token => createHash('sha256').update(token || '').digest('hex');
const fail = (status, message) => { throw Object.assign(new Error(message), { status }); };
const clean = (v, max = 150) => typeof v === 'string' ? v.trim().slice(0, max) : '';
async function body(req, limit = 300_000, raw = false) {
  let size = 0; const chunks = [];
  for await (const chunk of req) { size += chunk.length; if (size > limit) fail(413, 'Слишком большой запрос'); chunks.push(chunk); }
  const buffer = Buffer.concat(chunks);
  if (raw) return buffer;
  try { return JSON.parse(buffer.toString() || '{}'); } catch { fail(400, 'Некорректный JSON'); }
}
export function createApp({ dataDir = resolve('server/data'), teachers, iceServers = [], secureCookies = false, now = Date.now } = {}) {
  if (!teachers?.length) throw new Error('Configure at least one teacher');
  const accounts = teachers.map(t => ({ ...t, hash: scryptSync(t.password, t.login, 64) }));
  mkdirSync(dataDir, { recursive: true });
  mkdirSync(join(dataDir, 'recordings'), { recursive: true });
  mkdirSync(join(dataDir, 'history'), { recursive: true });
  mkdirSync(join(dataDir, 'uploads'), { recursive: true });
  const historyFile = (room, p) => join(dataDir, 'history', `${room.id}-${p.id}.jsonl`);
  const historyFor = (room, p) => [...(p.history || []), ...(existsSync(historyFile(room, p)) ? readFileSync(historyFile(room, p), 'utf8').trim().split('\n').filter(Boolean).map(line => JSON.parse(line)) : [])];
  const dbFile = join(dataDir, 'state.json');
  const db = existsSync(dbFile) ? JSON.parse(readFileSync(dbFile, 'utf8')) : { rooms: [], auth: {} };
  db.candidates = db.candidates || [];
  db.candidateAuth = db.candidateAuth || {};
  db.customTracks = db.customTracks || {};
  const getTrack = trackId => {
    const base = catalog.find(t => t.id === trackId);
    if (!base) return null;
    if (db.customTracks && db.customTracks[trackId] && Array.isArray(db.customTracks[trackId].tasks)) {
      return { ...base, tasks: db.customTracks[trackId].tasks };
    }
    return base;
  };
  const getTracks = teacher => catalog.filter(c => teacher.tracks.includes(c.id)).map(c => getTrack(c.id));
  const streams = new Map(), attempts = new Map();
  const persist = () => { writeFileSync(`${dbFile}.tmp`, JSON.stringify(db), { mode: 0o600 }); renameSync(`${dbFile}.tmp`, dbFile); };
  const cookie = (res, name, token, maxAge = 86400) => res.setHeader('Set-Cookie', `${name}=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${maxAge}${secureCookies ? '; Secure' : ''}`);
  const cookies = req => Object.fromEntries((req.headers.cookie || '').split(';').filter(v => v.includes('=')).map(v => v.trim().split('=')));
  const teacherFor = req => {
    const a = db.auth[digest(cookies(req).profit_teacher)];
    return a && a.expires > now() ? accounts.find(t => t.login === a.login) : null;
  };
  const mustTeacher = req => teacherFor(req) || fail(401, 'Войдите в кабинет преподавателя');
  const candidateFor = req => {
    const a = db.candidateAuth[digest(cookies(req).profit_candidate)];
    return a && a.expires > now() ? db.candidates.find(c => c.id === a.candidateId) : null;
  };
  const mustCandidate = req => candidateFor(req) || fail(401, 'Войдите в профиль кандидата');
  const candidateView = c => { const { passwordHash, ...rest } = c; return rest; };
  const removeFile = file => { try { if (existsSync(file)) unlinkSync(file); } catch { /* The database record is still removed. */ } };
  const own = (req, room) => { const t = mustTeacher(req); if (room.owner !== t.login) fail(403, 'Нет доступа к этой сессии'); return t; };
  const participantFor = (req, room) => room.participants.find(p => p.tokenHash === digest(cookies(req)[`profit_p_${room.id}`])) || fail(401, 'Зарегистрируйтесь по ссылке сессии');
  const event = (p, type, detail = '') => { p.events.push({ id: uid(), type, detail, at: now() }); };
  const online = (room, p) => [...streams.values()].some(s => s.roomId === room.id && s.participantId === p.id);
  const view = (room, participant) => ({
    id: room.id, title: room.title, trackId: room.trackId, trackLabel: room.trackLabel,
    capacity: room.capacity, status: room.status, startedAt: room.startedAt, endsAt: room.endsAt,
    durationMinutes: room.durationMinutes, createdAt: room.createdAt, serverNow: now(),
    tasks: room.tasks.map(publicTask), registered: room.participants.length,
    ...(participant ? { participant: { id: participant.id, name: participant.name, number: participant.number, group: participant.group, answers: participant.answers, submittedAt: participant.submittedAt, revision: participant.revision, score: participant.submittedAt ? score(room, participant) : null } } : {
      participants: room.participants.map(p => ({ id: p.id, name: p.name, number: p.number, group: p.group, online: online(room, p), screen: online(room, p) && p.screen, joinedAt: p.joinedAt, submittedAt: p.submittedAt, updatedAt: p.updatedAt, activeTaskId: p.activeTaskId, logVersion: p.events.length, lastEvent: p.events.at(-1), recordingState: p.recordingState || 'idle', recordingCount: p.recordings.length, lastRecordingAt: p.recordings.at(-1)?.at || null, answered: Object.keys(p.answers).length, eventCount: p.events.filter(e => ['tab_hidden','window_blur','paste','screen_stopped','fullscreen_exit','disconnected','recording_error'].includes(e.type)).length, score: p.submittedAt ? score(room, p) : null, grade: p.grade })),
    }),
  });
  const send = (stream, type, data) => { if (!stream.res.destroyed) stream.res.write(`event: ${type}\ndata: ${JSON.stringify(data)}\n\n`); };
  const broadcast = room => {
    for (const s of streams.values()) if (s.roomId === room.id) {
      const p = s.participantId ? room.participants.find(p => p.id === s.participantId) : null;
      send(s, 'state', view(room, p));
    }
  };
  const finish = room => {
    room.status = 'finished';
    for (const p of room.participants) if (!p.submittedAt) { p.submittedAt = now(); if (p.recordingState !== 'error') p.recordingState = 'stopping'; event(p, 'auto_submitted'); }
    persist(); broadcast(room);
  };
  const expire = room => { if (room.status === 'running' && now() >= room.endsAt) finish(room); };
  const active = (room, p) => {
    expire(room);
    if (room.status !== 'running' || p.submittedAt) fail(409, 'Приём ответов закрыт');
    if (!online(room, p) || !p.screen) fail(409, 'Подключите трансляцию экрана');
  };
  function validateAnswers(room, input) {
    if (!input || Array.isArray(input) || typeof input !== 'object') fail(400, 'Некорректные ответы');
    const answers = {};
    for (const [id, answer] of Object.entries(input)) {
      const task = room.tasks.find(t => t.id === id);
      if (!task || !answer || typeof answer !== 'object') fail(400, 'Неизвестное задание');
      const a = {};
      if (task.questions) {
        a.choices = {};
        for (const [index, choice] of Object.entries(answer.choices || {})) {
          if (!/^\d+$/.test(index) || !task.questions[index] || !Number.isInteger(choice) || choice < 0 || choice >= task.questions[index].o.length) fail(400, 'Некорректный вариант ответа');
          a.choices[index] = choice;
        }
      }
      for (const key of ['code', 'html', 'css', 'text']) if (answer[key] !== undefined) {
        if (!task.practice || typeof answer[key] !== 'string' || answer[key].length > 100_000) fail(400, 'Некорректный текст ответа');
        a[key] = answer[key];
      }
      answers[id] = a;
    }
    return answers;
  }
  const server = http.createServer(async (req, res) => {
    const json = (value, status = 200) => { res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }); res.end(JSON.stringify(value)); };
    try {
      const url = new URL(req.url, 'http://localhost');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Referrer-Policy', 'same-origin');
      res.setHeader('Permissions-Policy', 'camera=(), microphone=()');
      if (req.method !== 'GET' && req.headers.origin) {
        const origin = new URL(req.headers.origin);
        if (origin.host !== req.headers.host) fail(403, 'Запрос с другого сайта запрещён');
      }
      const path = url.pathname;
      if (path === '/api/health') return json({ ok: true });
      if (path === '/api/teacher/login' && req.method === 'POST') {
        const key = req.socket.remoteAddress;
        let rate = attempts.get(key);
        if (!rate || rate.until < now()) { rate = { count: 0, until: now() + 60_000 }; attempts.set(key, rate); }
        if (++rate.count > 10) fail(429, 'Слишком много попыток. Подождите минуту');
        const b = await body(req); const t = accounts.find(t => t.login === b.login);
        const hashed = scryptSync(clean(b.password, 1024), t?.login || 'unknown', 64);
        if (!t || !timingSafeEqual(hashed, t.hash)) fail(401, 'Неверный логин или пароль');
        const token = uid(); db.auth[digest(token)] = { login: t.login, expires: now() + 86400_000 };
        for (const [key, auth] of Object.entries(db.auth)) if (auth.expires < now()) delete db.auth[key];
        persist(); cookie(res, 'profit_teacher', token); return json({ name: t.name, tracks: t.tracks });
      }
      if (path === '/api/teacher/logout' && req.method === 'POST') {
        const hash = digest(cookies(req).profit_teacher); delete db.auth[hash];
        for (const s of streams.values()) if (s.authHash === hash) s.res.end();
        persist(); cookie(res, 'profit_teacher', '', 0); return json({ ok: true });
      }
      if (path === '/api/teacher/me') { const t = mustTeacher(req); return json({ name: t.name, tracks: t.tracks }); }
      if (path === '/api/candidates/upload' && req.method === 'POST') {
        const b = await body(req, 15_000_000);
        if (!b.data || !b.name) fail(400, 'Файл не передан');
        const rawBase64 = b.data.includes(',') ? b.data.split(',')[1] : b.data;
        const buffer = Buffer.from(rawBase64, 'base64');
        if (buffer.length === 0) fail(400, 'Пустой файл');
        if (buffer.length > 10_000_000) fail(413, 'Максимальный размер файла — 10 МБ');
        const originalName = clean(b.name, 120).replace(/[^a-zA-Z0-9._\-\u0400-\u04FF]/g, '_');
        const fileName = `${uid()}_${originalName}`;
        const filePath = join(dataDir, 'uploads', fileName);
        writeFileSync(filePath, buffer, { mode: 0o600 });
        const doc = {
          id: uid(),
          name: clean(b.name, 120),
          size: buffer.length,
          type: clean(b.type, 100) || 'application/octet-stream',
          fileName,
          url: `/api/uploads/${fileName}`,
          uploadedAt: now(),
        };
        return json({ document: doc }, 201);
      }
      if (path.startsWith('/api/uploads/')) {
        const fileName = path.slice('/api/uploads/'.length);
        if (!fileName || fileName.includes('..') || !/^[a-zA-Z0-9._\-\u0400-\u04FF]+$/.test(fileName)) fail(400, 'Некорректное имя файла');
        const filePath = join(dataDir, 'uploads', fileName);
        if (!existsSync(filePath) || !statSync(filePath).isFile()) fail(404, 'Файл не найден');
        const size = statSync(filePath).size;
        const ext = extname(fileName).toLowerCase();
        const mime = {
          '.pdf': 'application/pdf',
          '.png': 'image/png',
          '.jpg': 'image/jpeg',
          '.jpeg': 'image/jpeg',
          '.webp': 'image/webp',
          '.svg': 'image/svg+xml',
          '.zip': 'application/zip',
          '.doc': 'application/msword',
          '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          '.txt': 'text/plain; charset=utf-8',
        };
        res.writeHead(200, {
          'Content-Type': mime[ext] || 'application/octet-stream',
          'Content-Length': size,
          'Content-Disposition': `inline; filename="${encodeURIComponent(fileName.split('_').slice(1).join('_') || fileName)}"`,
          'Cache-Control': 'public, max-age=86400',
        });
        createReadStream(filePath).pipe(res);
        return;
      }
      if (path === '/api/candidates/register' && req.method === 'POST') {
        const b = await body(req);
        const name = clean(b.name, 150), email = clean(b.email, 150).toLowerCase();
        const password = clean(b.password, 200);
        if (!name || name.length < 3) fail(400, 'Укажите корректное ФИО');
        if (!email || !email.includes('@')) fail(400, 'Укажите корректный email');
        if (!password || password.length < 6) fail(400, 'Пароль должен содержать от 6 символов');
        if (db.candidates.some(c => c.email === email)) fail(409, 'Кандидат с таким email уже зарегистрирован');
        const candidate = {
          id: uid(),
          name,
          email,
          phone: clean(b.phone, 50),
          group: clean(b.group, 60),
          passwordHash: scryptSync(password, email, 64).toString('hex'),
          directions: Array.isArray(b.directions) ? b.directions.slice(0, 2) : [],
          motivation: clean(b.motivation, 2000),
          skills: Array.isArray(b.skills) ? b.skills : [],
          experience: clean(b.experience, 2000),
          links: clean(b.links, 1000),
          documents: Array.isArray(b.documents) ? b.documents.slice(0, 15) : [],
          goals: clean(b.goals, 2000),
          timeCommitment: clean(b.timeCommitment, 100),
          createdAt: now(),
          updatedAt: now(),
        };
        db.candidates.unshift(candidate);
        const token = uid();
        db.candidateAuth[digest(token)] = { candidateId: candidate.id, expires: now() + 30 * 86400_000 };
        persist();
        cookie(res, 'profit_candidate', token, 30 * 86400);
        return json({ candidate: candidateView(candidate) }, 201);
      }
      if (path === '/api/candidates/login' && req.method === 'POST') {
        const b = await body(req);
        const email = clean(b.email, 150).toLowerCase(), password = clean(b.password, 200);
        const candidate = db.candidates.find(c => c.email === email);
        if (!candidate) fail(401, 'Неверный email или пароль');
        const hashed = scryptSync(password, email, 64).toString('hex');
        if (hashed !== candidate.passwordHash) fail(401, 'Неверный email или пароль');
        const token = uid();
        db.candidateAuth[digest(token)] = { candidateId: candidate.id, expires: now() + 30 * 86400_000 };
        persist();
        cookie(res, 'profit_candidate', token, 30 * 86400);
        return json({ candidate: candidateView(candidate) });
      }
      if (path === '/api/candidates/logout' && req.method === 'POST') {
        const token = cookies(req).profit_candidate;
        if (token) delete db.candidateAuth[digest(token)];
        persist();
        cookie(res, 'profit_candidate', '', 0);
        return json({ ok: true });
      }
      if (path === '/api/candidates/me') {
        const c = mustCandidate(req);
        if (req.method === 'GET') return json({ candidate: candidateView(c) });
        if (req.method === 'PUT') {
          const b = await body(req);
          if (b.name) c.name = clean(b.name, 150);
          if (b.phone !== undefined) c.phone = clean(b.phone, 50);
          if (b.group) c.group = clean(b.group, 60);
          if (Array.isArray(b.directions)) c.directions = b.directions.slice(0, 2);
          if (b.motivation !== undefined) c.motivation = clean(b.motivation, 2000);
          if (Array.isArray(b.skills)) c.skills = b.skills;
          if (b.experience !== undefined) c.experience = clean(b.experience, 2000);
          if (b.links !== undefined) c.links = clean(b.links, 1000);
          if (Array.isArray(b.documents)) c.documents = b.documents.slice(0, 15);
          if (b.goals !== undefined) c.goals = clean(b.goals, 2000);
          if (b.timeCommitment !== undefined) c.timeCommitment = clean(b.timeCommitment, 100);
          c.updatedAt = now();
          persist();
          return json({ candidate: candidateView(c) });
        }
      }
      if (path === '/api/candidates' && req.method === 'GET') {
        mustTeacher(req);
        return json({ candidates: db.candidates.map(candidateView) });
      }
      const candidateMatch = path.match(/^\/api\/candidates\/([a-f0-9]{36})$/);
      if (candidateMatch && req.method === 'DELETE') {
        mustTeacher(req);
        const candidate = db.candidates.find(c => c.id === candidateMatch[1]);
        if (!candidate) fail(404, 'Кандидат не найден');
        for (const doc of candidate.documents || []) {
          if (typeof doc?.fileName === 'string' && /^[a-zA-Z0-9._\-\u0400-\u04FF]+$/.test(doc.fileName)) removeFile(join(dataDir, 'uploads', doc.fileName));
        }
        db.candidates = db.candidates.filter(c => c.id !== candidate.id);
        for (const [key, auth] of Object.entries(db.candidateAuth)) if (auth.candidateId === candidate.id) delete db.candidateAuth[key];
        persist();
        return json({ ok: true });
      }
      if (path === '/api/catalog') { const t = mustTeacher(req); return json(getTracks(t).map(c => ({ ...c, tasks: c.tasks.map(publicTask) }))); }
      if (path === '/api/teacher/catalog' && req.method === 'GET') {
        const t = mustTeacher(req);
        return json(getTracks(t));
      }
      const teacherCatalogMatch = path.match(/^\/api\/teacher\/catalog\/([a-zA-Z0-9_-]+)(?:\/(reset))?$/);
      if (teacherCatalogMatch) {
        const t = mustTeacher(req);
        const trackId = teacherCatalogMatch[1];
        const isReset = teacherCatalogMatch[2] === 'reset';
        if (!t.tracks.includes(trackId)) fail(403, 'Направление недоступно');
        if (isReset && req.method === 'POST') {
          delete db.customTracks[trackId];
          persist();
          return json({ ok: true, track: getTrack(trackId) });
        }
        if (!isReset && req.method === 'PUT') {
          const b = await body(req, 1_000_000);
          if (!Array.isArray(b.tasks) || b.tasks.length === 0) fail(400, 'Задания не переданы');
          db.customTracks[trackId] = {
            tasks: b.tasks,
            updatedAt: now(),
          };
          persist();
          return json({ ok: true, track: getTrack(trackId) });
        }
      }
      if (path === '/api/rooms') {
        const t = mustTeacher(req);
        if (req.method === 'GET') { db.rooms.forEach(expire); return json(db.rooms.filter(r => r.owner === t.login).map(r => view(r))); }
        if (req.method === 'POST') {
          const b = await body(req); const track = getTrack(b.trackId);
          if (!track || !t.tracks.includes(track.id)) fail(403, 'Направление недоступно');
          if (!Number.isInteger(b.capacity) || b.capacity < 1 || b.capacity > 100) fail(400, 'Укажите от 1 до 100 участников');
          if (!Array.isArray(b.taskIds) || !b.taskIds.length || new Set(b.taskIds).size !== b.taskIds.length || b.taskIds.some(id => !track.tasks.some(task => task.id === id))) fail(400, 'Выберите задания');
          const selectedTasks = structuredClone(track.tasks.filter(task => b.taskIds.includes(task.id)));
          const combineSubjects = track.id === 'subject-disciplines' && (b.combineSubjects === true || b.combineTasks === true);
          const combineModeling = track.id === '3d-modeling' && b.combineTasks === true;
          if ((combineSubjects || combineModeling) && (selectedTasks.length < 2 || selectedTasks.some(task => !Array.isArray(task.questions)))) fail(400, 'Для общего теста выберите минимум два раздела с вопросами');
          const tasks = combineSubjects ? [combineSubjectTasks(selectedTasks)] : combineModeling ? [combineModelingTasks(selectedTasks)] : selectedTasks;
          const room = { id: uid(), owner: t.login, title: clean(b.title) || `${track.label} · Тестирование`, trackId: track.id, trackLabel: track.label, tasks, capacity: b.capacity, status: 'waiting', createdAt: now(), startedAt: null, endsAt: null, durationMinutes: 120, participants: [] };
          db.rooms.unshift(room); persist(); return json(view(room), 201);
        }
      }
      const match = path.match(/^\/api\/rooms\/([a-f0-9]{36})(?:\/(.*))?$/);
      if (match) {
        const room = db.rooms.find(r => r.id === match[1]); if (!room) fail(404, 'Сессия не найдена');
        expire(room); const action = match[2] || '';
        if (!action && req.method === 'DELETE') {
          own(req, room);
          if (room.status === 'running') fail(409, 'Нельзя удалить активную сессию. Сначала завершите тестирование.');
          for (const p of room.participants) {
            for (const stream of [...streams.values()].filter(s => s.roomId === room.id && s.participantId === p.id)) { streams.delete(stream.id); stream.res.end(); }
            for (const recording of p.recordings || []) {
              if (typeof recording.file === 'string' && /^[a-f0-9-]{36}-[a-f0-9-]{36}-[a-f0-9-]{36}\.webm$/.test(recording.file)) removeFile(join(dataDir, 'recordings', recording.file));
            }
            removeFile(historyFile(room, p));
          }
          for (const stream of [...streams.values()].filter(s => s.roomId === room.id)) { streams.delete(stream.id); stream.res.end(); }
          db.rooms = db.rooms.filter(r => r.id !== room.id);
          persist();
          return json({ ok: true });
        }
        if (action === 'public' && req.method === 'GET') return json({ id: room.id, title: room.title, trackLabel: room.trackLabel, status: room.status, capacity: room.capacity, registered: room.participants.length });
        if (action === 'join' && req.method === 'POST') {
          const b = await body(req);
          const existing = room.participants.find(p => p.tokenHash === digest(cookies(req)[`profit_p_${room.id}`]));
          if (existing) return json(view(room, existing));
          if (room.status !== 'waiting') fail(409, 'Регистрация закрыта: тестирование уже началось');
          if (room.participants.length >= room.capacity) fail(409, 'Все места в сессии заняты');
          const name = clean(b.name), number = clean(b.number, 40), group = clean(b.group, 60);
          if (name.length < 5 || !number || !group || b.consent !== true) fail(400, 'Заполните ФИО, номер, группу и согласие');
          if (room.participants.some(p => p.number.toLowerCase() === number.toLowerCase())) fail(409, 'Участник с таким номером уже зарегистрирован. Вернитесь на его компьютер');
          const token = uid();
          const p = { id: uid(), tokenHash: digest(token), name, number, group, joinedAt: now(), updatedAt: null, screen: false, answers: {}, revision: 0, submittedAt: null, events: [], historyCount: 0, recordings: [] };
          event(p, 'joined'); room.participants.push(p); persist(); broadcast(room); cookie(res, `profit_p_${room.id}`, token); return json(view(room, p), 201);
        }
        if (action === 'me') return json(view(room, participantFor(req, room)));
        if (action === 'events' && req.method === 'GET') {
          const isTeacher = url.searchParams.get('role') === 'teacher';
          const t = isTeacher ? own(req, room) : null;
          const p = isTeacher ? null : participantFor(req, room);
          const id = clean(url.searchParams.get('connection'), 60);
          if (!/^[a-zA-Z0-9-]{10,60}$/.test(id)) fail(400, 'Некорректное подключение');
          const previous = [...streams.values()].filter(s => s.id === id || (p && s.participantId === p.id));
          for (const s of previous) { send(s, 'replaced', {}); streams.delete(s.id); s.res.end(); }
          const s = { id, res, roomId: room.id, participantId: p?.id, login: t?.login, authHash: t ? digest(cookies(req).profit_teacher) : null };
          res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache, no-transform', 'Connection': 'keep-alive', 'X-Accel-Buffering': 'no' });
          streams.set(id, s); send(s, 'config', { connectionId: id, iceServers });
          if (p) { p.screen = false; if (p.recordingState === 'recording') p.recordingState = 'interrupted'; event(p, 'connected'); }
          persist(); broadcast(room);
          req.on('close', () => {
            if (streams.get(id) !== s) return;
            streams.delete(id);
            if (p) { p.screen = false; if (p.recordingState === 'recording') p.recordingState = 'interrupted'; event(p, 'disconnected'); persist(); }
            for (const peer of streams.values()) if (peer.roomId === room.id) send(peer, 'signal', { type: 'peer_left', from: id, participantId: p?.id });
            broadcast(room);
          });
          return;
        }
        if (action === 'signal' && req.method === 'POST') {
          const b = await body(req); const from = streams.get(b.from), to = streams.get(b.to);
          if (!from || from.roomId !== room.id) fail(409, 'Подключение потеряно');
          if (from.participantId) { if (participantFor(req, room).id !== from.participantId) fail(403, 'Нет доступа'); } else own(req, room);
          if (!to || to.roomId !== room.id || !!from.participantId === !!to.participantId) fail(404, 'Участник отключился');
          if (!['watch','stop','offer','answer','ice'].includes(b.type)) fail(400, 'Неизвестный сигнал');
          if (['watch','stop','answer'].includes(b.type) && from.participantId) fail(403, 'Недопустимый сигнал');
          if (b.type === 'offer' && !from.participantId) fail(403, 'Недопустимый сигнал');
          send(to, 'signal', { type: b.type, payload: b.payload, from: from.id, participantId: from.participantId }); return json({ ok: true });
        }
        if (action === 'connections') {
          own(req, room); return json([...streams.values()].filter(s => s.roomId === room.id && s.participantId).map(s => ({ id: s.id, participantId: s.participantId })));
        }
        if (action === 'proctor' && req.method === 'POST') {
          const p = participantFor(req, room), b = await body(req);
          const lateRecordingEvent = ['recording_stopped', 'recording_error'].includes(b.type);
          if ((room.status === 'finished' || p.submittedAt) && (!lateRecordingEvent || now() - (p.submittedAt || room.endsAt) > 120_000)) return json({ ok: true });
          const allowed = ['screen_started','screen_stopped','tab_hidden','tab_visible','window_blur','window_focus','fullscreen_enter','fullscreen_exit','paste','task_opened','recording_started','recording_stopped','recording_error'];
          if (!allowed.includes(b.type)) fail(400, 'Неизвестное событие');
          if (b.type === 'screen_started') p.screen = true;
          if (b.type === 'screen_stopped') { p.screen = false; if (p.recordingState !== 'error') p.recordingState = 'interrupted'; }
          if (b.type === 'recording_started') {
            if (room.status !== 'running' || !p.screen) fail(409, 'Сначала подключите экран и дождитесь старта');
            p.recordingState = 'recording';
          }
          if (b.type === 'recording_stopped' && p.recordingState !== 'error') p.recordingState = 'stopped';
          if (b.type === 'recording_error') p.recordingState = 'error';
          let detail = clean(b.detail, 200);
          if (b.type === 'task_opened') {
            const task = room.tasks.find(task => task.id === b.detail);
            if (!task) fail(400, 'Неизвестное задание');
            p.activeTaskId = task.id; detail = task.title;
          }
          // Store metadata, never the clipboard contents.
          event(p, b.type, detail); persist(); broadcast(room); return json({ ok: true });
        }
        if (action === 'answers' && req.method === 'PUT') {
          const p = participantFor(req, room), b = await body(req); active(room, p);
          if (b.revision !== p.revision) fail(409, 'Ответы изменились в другом окне. Обновите страницу');
          const answers = validateAnswers(room, b.answers);
          const changes = Object.entries(answers).filter(([taskId, answer]) => JSON.stringify(answer) !== JSON.stringify(p.answers[taskId])).map(([taskId, answer]) => ({ at: now(), taskId, answer }));
          if (changes.length) { appendFileSync(historyFile(room, p), changes.map(change => JSON.stringify(change)).join('\n') + '\n', { mode: 0o600 }); p.historyCount = (p.historyCount || 0) + changes.length; }
          p.answers = answers; p.revision++; p.updatedAt = now();
          if (changes.length) event(p, 'answers_saved', changes.map(change => room.tasks.find(task => task.id === change.taskId).title).join('; '));
          persist(); broadcast(room); return json({ revision: p.revision, updatedAt: p.updatedAt });
        }
        if (action === 'submit' && req.method === 'POST') {
          const p = participantFor(req, room); if (p.submittedAt) return json(view(room, p));
          active(room, p); p.submittedAt = now(); if (p.recordingState !== 'error') p.recordingState = 'stopping'; event(p, 'submitted'); persist(); broadcast(room); return json(view(room, p));
        }
        if (action === 'recordings' && req.method === 'POST') {
          const p = participantFor(req, room);
          if (!room.startedAt || (room.status === 'finished' && now() - room.endsAt > 120_000) || (p.submittedAt && now() - p.submittedAt > 120_000)) fail(409, 'Запись закрыта');
          const chunkId = url.searchParams.get('chunk');
          if (!/^[a-f0-9-]{36}$/.test(chunkId || '')) fail(400, 'Некорректный фрагмент');
          if (p.recordings.some(r => r.id === chunkId)) return json({ ok: true });
          if (p.recordings.length >= 2500) fail(413, 'Лимит записи');
          const data = await body(req, 12_000_000, true);
          if (data.length < 4 || data.readUInt32BE(0) !== 0x1a45dfa3) fail(400, 'Ожидается запись WebM');
          // A retry can arrive while the first upload is still being read.
          if (p.recordings.some(r => r.id === chunkId)) return json({ ok: true });
          const file = `${room.id}-${p.id}-${chunkId}.webm`;
          writeFileSync(join(dataDir, 'recordings', file), data, { mode: 0o600 });
          p.recordings.push({ id: chunkId, file, at: now(), size: data.length });
          event(p, 'recording_saved', `Фрагмент ${p.recordings.length}, ${data.length} байт`);
          persist(); broadcast(room); return json({ ok: true });
        }
        if (action.startsWith('participants/')) {
          own(req, room); const [, pid, sub, rid] = action.split('/');
          const p = room.participants.find(p => p.id === pid); if (!p) fail(404, 'Участник не найден');
          if (sub === 'recordings') {
            const recording = p.recordings.find(r => r.id === rid); if (!recording) fail(404, 'Запись не найдена');
            const file = join(dataDir, 'recordings', recording.file), size = statSync(file).size;
            if (url.searchParams.get('download') === '1') res.setHeader('Content-Disposition', `attachment; filename="screen-${rid}.webm"`);
            res.writeHead(200, { 'Content-Type': 'video/webm', 'Content-Length': size, 'Cache-Control': 'private, no-store' }); createReadStream(file).pipe(res); return;
          }
          if (sub === 'grade' && req.method === 'POST') {
            if (!p.submittedAt) fail(409, 'Дождитесь сдачи работы');
            const b = await body(req);
            if (!Number.isInteger(b.score) || b.score < 0 || b.score > 100) fail(400, 'Оценка от 0 до 100');
            p.grade = { score: b.score, comment: clean(b.comment, 3000), at: now() }; event(p, 'grade_saved', `${b.score}/100`); persist(); broadcast(room); return json(p.grade);
          }
          if (!sub && req.method === 'GET') {
            const answerReview = room.tasks.filter(task => task.questions).map(task => ({
              id: task.id,
              title: task.title,
              questions: task.questions.map((question, index) => {
                const selectedIndex = p.answers[task.id]?.choices?.[index];
                const section = task.subjectSections?.find(section => index >= section.start && index < section.start + section.count);
                return { question: question.q, options: question.o, selectedIndex: Number.isInteger(selectedIndex) ? selectedIndex : null, correctIndex: question.c, ...(section ? { subject: section.title } : {}) };
              }),
            }));
            return json({ id: p.id, name: p.name, number: p.number, group: p.group, answers: p.answers, answerReview, events: p.events, history: url.searchParams.get('history') === '1' ? historyFor(room, p) : [], historyCount: p.historyCount || 0, recordingState: p.recordingState || 'idle', recordings: p.recordings.map(({ file, ...r }) => r), submittedAt: p.submittedAt, score: score(room, p), grade: p.grade });
          }
        }
        own(req, room);
        if (!action && req.method === 'GET') return json(view(room));
        if (action === 'start' && req.method === 'POST') {
          const b = await body(req);
          if (room.status !== 'waiting') fail(409, 'Сессия уже запущена');
          if (!room.participants.length) fail(409, 'Дождитесь хотя бы одного участника');
          if (room.participants.some(p => !online(room, p) || !p.screen)) fail(409, 'Все зарегистрированные участники должны подключить экран');
          if (!Number.isInteger(b.durationMinutes) || b.durationMinutes < 1 || b.durationMinutes > 480) fail(400, 'Длительность от 1 до 480 минут');
          room.durationMinutes = b.durationMinutes; room.startedAt = now(); room.endsAt = now() + b.durationMinutes * 60_000; room.status = 'running'; room.participants.forEach(p => event(p, 'session_started', `${b.durationMinutes} мин`)); persist(); broadcast(room); return json(view(room));
        }
        if (action === 'finish' && req.method === 'POST') {
          if (room.status !== 'running') fail(409, 'Сессия не запущена');
          room.endsAt = now(); finish(room); return json(view(room));
        }
      }
      if (path.startsWith('/api/')) fail(404, 'Неизвестный запрос');
      if (req.method !== 'GET') fail(405, 'Метод не поддерживается');
      const root = resolve('dist'); let file = resolve(root, `.${decodeURIComponent(path)}`);
      if (!file.startsWith(`${root}/`)) file = join(root, 'index.html');
      if (!existsSync(file) || !statSync(file).isFile()) file = join(root, 'index.html');
      if (!existsSync(file)) fail(404, 'Сначала выполните npm run build или npm run dev');
      const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png' };
      res.writeHead(200, { 'Content-Type': mime[extname(file)] || 'application/octet-stream', 'Cache-Control': extname(file) === '.html' ? 'no-cache' : 'public, max-age=3600' }); createReadStream(file).pipe(res);
    } catch (error) {
      if (res.headersSent) { res.end(); return; }
      if (!error.status) console.error(error);
      json({ error: error.status ? error.message : 'Ошибка сервера. Попробуйте ещё раз' }, error.status || 500);
    }
  });
  const timer = setInterval(() => {
    db.rooms.forEach(expire);
    for (const s of streams.values()) {
      if (s.authHash && (!db.auth[s.authHash] || db.auth[s.authHash].expires <= now())) { s.res.end(); continue; }
      s.res.write(': heartbeat\n\n');
    }
    for (const [key, rate] of attempts) if (rate.until < now()) attempts.delete(key);
  }, 1000);
  timer.unref();
  server.on('close', () => clearInterval(timer));
  server.closeStreams = () => { for (const s of streams.values()) s.res.end(); };
  return server;
}
