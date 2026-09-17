import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, Monitor, LockKeyhole, CheckCircle2, Send, Maximize, Code2, FileText, ShieldCheck } from 'lucide-react';
import { api, post, randomId } from './api';
import { useRoom } from './useRoom';
import { createPeer } from './Proctor';
import { Header, Badge, Notice, Timer, ProctorNotice } from './shared';

export default function Participant({ id }) {
  const [info, setInfo] = useState(null), [joined, setJoined] = useState(false), [loading, setLoading] = useState(true), [error, setError] = useState(''), [busy, setBusy] = useState(false);
  useEffect(() => {
    let alive = true;
    Promise.all([api(`/rooms/${id}/public`), api(`/rooms/${id}/me`).catch(e => { if (e.status !== 401) throw e; return null; })]).then(([info, me]) => { if (alive) { setInfo(info); setJoined(!!me); } }).catch(e => alive && setError(e.message)).finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [id]);
  async function join(e) { e.preventDefault(); setBusy(true); setError(''); const f = new FormData(e.currentTarget); try { await post(`/rooms/${id}/join`, { name: f.get('name'), number: f.get('number'), group: f.get('group'), consent: f.get('consent') === 'on' }); setJoined(true); } catch(e) { setError(e.message); } finally { setBusy(false); } }
  if (joined) return <Workspace id={id} />;
  return <><Header><span className="header-note">Вход участника</span></Header><main className="join-layout"><section><span className="eyebrow">ВАШЕ РАБОЧЕЕ МЕСТО</span><h1>{info?.title || 'Тестирование ProfIT'}</h1><p className="join-description">Заполните данные и подключите экран. Задания откроются для выполнения, когда преподаватель даст общий старт.</p>{info && <Badge status={info.status} />}<div className="join-steps"><div><span>01</span><p><strong>Представьтесь</strong>ФИО, номер и учебная группа</p></div><div><span>02</span><p><strong>Подключите экран</strong>Выберите весь экран в окне браузера</p></div><div><span>03</span><p><strong>Дождитесь старта</strong>Таймер запустится у всех одновременно</p></div></div><ProctorNotice /></section><form className="login-card" onSubmit={join}><h2>Регистрация участника</h2><p>{info?.trackLabel || 'Загрузка сессии…'}</p><Notice>{error}</Notice>{loading ? <p>Проверяем ссылку…</p> : info?.status === 'waiting' && info.registered < info.capacity ? <><label>ФИО<input name="name" required minLength={5} maxLength={150} autoComplete="name" placeholder="Иванов Иван Иванович" /></label><div className="form-grid"><label>Номер участника<input name="number" required maxLength={40} placeholder="Например, 12" /></label><label>Группа<input name="group" required maxLength={60} placeholder="ИС-24-1" /></label></div><label className="consent"><input name="consent" type="checkbox" required /><span>Согласен на трансляцию и запись экрана, сохранение ответов и событий тестирования для проверки преподавателем.</span></label><button className="primary full" disabled={busy}>{busy ? 'Регистрируем…' : 'Занять рабочее место'}<ArrowRight size={18} /></button></> : <Notice kind="info">{info ? info.status !== 'waiting' ? 'Регистрация закрыта. Если вы уже зарегистрированы, откройте ссылку в том же браузере на своём компьютере.' : 'Все места заняты. Обратитесь к преподавателю.' : 'Не удалось открыть сессию. Проверьте ссылку.'}</Notice>}</form></main></>;
}
function Workspace({ id }) {
  const state = useRoom(id, 'participant'), { room, connected, config, signal, signalHandler, offset } = state;
  const [answers, setAnswers] = useState({}), [taskId, setTaskId] = useState(null), [stream, setStream] = useState(null), [error, setError] = useState(''), [saveStatus, setSaveStatus] = useState('Все изменения сохранены'), [recordStatus, setRecordStatus] = useState(''), [busy, setBusy] = useState(false), [clock, setClock] = useState(Date.now());
  const peers = useRef(new Map()), currentStream = useRef(null), latest = useRef({}), revision = useRef(0), initialized = useRef(false), dirty = useRef(false), saving = useRef(null), alive = useRef(true), roomRef = useRef(null), saveTimer = useRef(null), draftKey = useRef('');
  roomRef.current = room;
  const finished = !!room?.participant.submittedAt || room?.status === 'finished';
  const canWork = room?.status === 'running' && !finished && !!stream && connected && clock + offset.current < room.endsAt;
  const report = (type, detail = '') => post(`/rooms/${id}/proctor`, { type, detail }).catch(() => {});
  useEffect(() => { const t = setInterval(() => setClock(Date.now()), 500); return () => clearInterval(t); }, []);
  useEffect(() => {
    if (!room || initialized.current) return;
    initialized.current = true; revision.current = room.participant.revision;
    draftKey.current = `profit:draft:${id}:${room.participant.id}`;
    let initial = room.participant.answers;
    try { const draft = JSON.parse(localStorage.getItem(draftKey.current)); if (!finished && draft && draft.answers && typeof draft.answers === 'object') { initial = draft.answers; dirty.current = true; setSaveStatus('Восстановлен черновик. Подключите экран для сохранения'); } } catch { /* Server copy remains available. */ }
    latest.current = initial; setAnswers(initial); setTaskId(room.tasks[0].id);
  }, [room]);
  async function flush() {
    if (saving.current) { await saving.current; if (dirty.current) return flush(); return; }
    if (!dirty.current) return;
    // SSE may have confirmed a save whose HTTP response was lost during reconnect.
    revision.current = Math.max(revision.current, roomRef.current?.participant.revision || 0);
    const snapshot = latest.current;
    saving.current = (async () => {
      setSaveStatus('Сохраняем…');
      try {
        const result = await api(`/rooms/${id}/answers`, { method: 'PUT', body: { answers: snapshot, revision: revision.current } });
        revision.current = result.revision;
        if (latest.current === snapshot) { dirty.current = false; localStorage.removeItem(draftKey.current); }
        else localStorage.setItem(draftKey.current, JSON.stringify({ answers: latest.current, revision: revision.current }));
        setSaveStatus(dirty.current ? 'Есть несохранённые изменения' : 'Все изменения сохранены');
      } catch(e) { setSaveStatus(`Не сохранено: ${e.message}`); throw e; }
    })();
    try { await saving.current; } finally { saving.current = null; }
    if (dirty.current) return flush();
  }
  useEffect(() => { if (!canWork) return; const timer = setInterval(() => { if (dirty.current) flush().catch(() => {}); }, 2000); return () => clearInterval(timer); }, [canWork]);
  function change(task, value) {
    latest.current = { ...latest.current, [task]: value }; dirty.current = true; setAnswers(latest.current); setSaveStatus('Есть несохранённые изменения');
    try { localStorage.setItem(draftKey.current, JSON.stringify({ answers: latest.current, revision: revision.current })); } catch { setSaveStatus('Черновик в памяти. Не закрывайте страницу до сохранения'); }
    clearTimeout(saveTimer.current); saveTimer.current = setTimeout(() => flush().catch(() => {}), 450);
  }
  useEffect(() => {
    const before = e => { if (dirty.current || (roomRef.current?.status === 'running' && !roomRef.current?.participant.submittedAt)) { e.preventDefault(); e.returnValue = ''; } };
    window.addEventListener('beforeunload', before); return () => window.removeEventListener('beforeunload', before);
  }, []);
  useEffect(() => {
    alive.current = true;
    return () => { alive.current = false; clearTimeout(saveTimer.current); currentStream.current?.getTracks().forEach(t => t.stop()); peers.current.forEach(p => p.close()); };
  }, []);
  async function offer(viewer) {
    if (!currentStream.current) return;
    peers.current.get(viewer)?.close();
    const peer = createPeer(config.iceServers, (type, payload) => signal(viewer, type, payload)); peers.current.set(viewer, peer);
    currentStream.current.getTracks().forEach(track => peer.pc.addTrack(track, currentStream.current));
    await peer.pc.setLocalDescription(await peer.pc.createOffer()); await signal(viewer, 'offer', peer.pc.localDescription.toJSON());
  }
  signalHandler.current = async message => {
    try {
      if (message.type === 'watch') await offer(message.from);
      else if (['stop', 'peer_left'].includes(message.type)) { peers.current.get(message.from)?.close(); peers.current.delete(message.from); }
      else if (['answer', 'ice'].includes(message.type)) await peers.current.get(message.from)?.receive(message.type, message.payload);
    } catch(e) { setError(`Трансляция: ${e.message}`); }
  };
  useEffect(() => { if (connected && currentStream.current) report('screen_started'); }, [connected]);
  useEffect(() => {
    if (state.error.includes('другом окне')) { currentStream.current?.getTracks().forEach(t => t.stop()); currentStream.current = null; setStream(null); peers.current.forEach(p => p.close()); peers.current.clear(); }
  }, [state.error]);
  async function share() {
    setError('');
    try {
      if (!navigator.mediaDevices?.getDisplayMedia) throw new Error('Для трансляции откройте сайт по HTTPS в настольном Chrome или Edge. На этом компьютере также доступен localhost.');
      const capture = await navigator.mediaDevices.getDisplayMedia({ video: { displaySurface: 'monitor', frameRate: { ideal: 8, max: 12 }, width: { ideal: 1280 } }, audio: false });
      const track = capture.getVideoTracks()[0];
      if (track.getSettings().displaySurface && track.getSettings().displaySurface !== 'monitor') { capture.getTracks().forEach(t => t.stop()); throw new Error('Выберите «Весь экран», чтобы преподаватель видел всё рабочее место.'); }
      currentStream.current?.getTracks().forEach(t => t.stop()); currentStream.current = capture; setStream(capture);
      track.onended = () => { currentStream.current = null; setStream(null); peers.current.forEach(p => p.close()); peers.current.clear(); report('screen_stopped'); };
      await post(`/rooms/${id}/proctor`, { type: 'screen_started' });
    } catch(e) { setError(e.name === 'NotAllowedError' ? 'Доступ к экрану не предоставлен. Нажмите кнопку ещё раз и разрешите демонстрацию.' : e.message); }
  }
  useEffect(() => {
    if (room?.status !== 'running' || finished) return;
    const visibility = () => report(document.hidden ? 'tab_hidden' : 'tab_visible');
    const blur = () => report('window_blur');
    const focus = () => report('window_focus');
    const fullscreen = () => report(document.fullscreenElement ? 'fullscreen_enter' : 'fullscreen_exit');
    const paste = e => report('paste', `${e.clipboardData?.getData('text').length || 0} символов`);
    document.addEventListener('visibilitychange', visibility); window.addEventListener('blur', blur); window.addEventListener('focus', focus); document.addEventListener('fullscreenchange', fullscreen); document.addEventListener('paste', paste);
    return () => { document.removeEventListener('visibilitychange', visibility); window.removeEventListener('blur', blur); window.removeEventListener('focus', focus); document.removeEventListener('fullscreenchange', fullscreen); document.removeEventListener('paste', paste); };
  }, [room?.status, finished]);
  useEffect(() => { if (taskId && !finished) report('task_opened', taskId); }, [taskId, finished]);
  useEffect(() => {
    if (!stream || room?.status !== 'running' || finished) return;
    if (!window.MediaRecorder || !MediaRecorder.isTypeSupported('video/webm')) { setRecordStatus('Браузер не поддерживает запись WebM'); report('recording_error', 'WebM unsupported'); return; }
    let stopped = false, recorder, timer, uploadChain = Promise.resolve(), announced = false;
    async function upload(blob, chunk) {
      for (let attempt = 0; attempt < 4; attempt++) {
        try { await api(`/rooms/${id}/recordings?chunk=${chunk}`, { method: 'POST', body: blob }); if (alive.current) setRecordStatus('Запись экрана сохраняется'); return; }
        catch(e) { if (attempt === 3) { if (alive.current) setRecordStatus('Фрагмент записи не сохранён. Сообщите преподавателю'); report('recording_error', e.message); return; } await new Promise(resolve => setTimeout(resolve, 2000)); }
      }
    }
    function record() {
      if (stopped || !stream.active) return;
      try {
        recorder = new MediaRecorder(stream, { mimeType: 'video/webm', videoBitsPerSecond: 500_000 });
        const chunks = [];
        recorder.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };
        recorder.onerror = () => { setRecordStatus('Ошибка записи экрана'); report('recording_error', 'MediaRecorder error'); };
        recorder.onstop = () => { const blob = new Blob(chunks, { type: 'video/webm' }); if (blob.size) { const chunk = randomId(); uploadChain = uploadChain.then(() => upload(blob, chunk)); } if (!stopped) record(); };
        recorder.start(); if (!announced) { announced = true; report('recording_started'); } setRecordStatus('Идёт запись экрана'); timer = setTimeout(() => { if (recorder.state !== 'inactive') recorder.stop(); }, 20_000);
      } catch(e) { setRecordStatus('Не удалось начать запись'); report('recording_error', e.message); }
    }
    record();
    return () => { stopped = true; clearTimeout(timer); if (recorder?.state !== 'inactive') recorder?.stop(); if (announced) report('recording_stopped'); };
  }, [stream, room?.status, finished]);
  useEffect(() => { if (finished) { currentStream.current?.getTracks().forEach(t => t.stop()); currentStream.current = null; setStream(null); peers.current.forEach(p => p.close()); peers.current.clear(); if (!dirty.current) localStorage.removeItem(draftKey.current); } }, [finished]);
  async function submit() {
    if (!confirm('Сдать работу? После отправки изменить ответы нельзя.')) return;
    setBusy(true); setError('');
    try { await flush(); state.setRoom(await post(`/rooms/${id}/submit`)); } catch(e) { setError(e.message); } finally { setBusy(false); }
  }
  if (!room) return <><Header /><main className="exam-main"><Notice>{state.error}</Notice><p>Подключаемся к сессии…</p></main></>;
  const task = room.tasks.find(t => t.id === taskId) || room.tasks[0];
  return <><Header><span className="header-note">{room.participant.name} · {room.participant.group}</span><Badge status={connected ? 'online' : 'offline'}>{connected ? 'На связи' : 'Нет связи'}</Badge></Header><main className="exam-main workspace"><div className="page-heading"><div><Badge status={room.status} /><h1>{room.title}</h1><p>Участник № {room.participant.number}</p></div><Timer room={room} offset={offset} /></div><Notice>{error || state.error}</Notice>{!connected && <Notice>Связь с сервером потеряна. Идёт переподключение. Таймер продолжает идти.</Notice>}{finished ? <section className="completion panel"><CheckCircle2 size={54} /><h2>Работа сдана</h2><p>Преподаватель получил сохранённые ответы.<br />Спасибо за участие в тестировании.</p>{room.participant.score?.englishLevel && <EnglishResult score={room.participant.score} />}{room.participant.score?.subjects && <SubjectResult score={room.participant.score} />}{dirty.current && <Notice>Последние изменения не успели сохраниться до окончания времени. Локальный черновик сохранён в этом браузере; сообщите преподавателю.</Notice>}<p className="small">{recordStatus}</p></section> : <><div className={`workspace-banner ${room.status === 'waiting' ? 'waiting' : !stream ? 'paused' : ''}`}><div className="banner-title">{room.status === 'waiting' ? <LockKeyhole size={24} /> : <Monitor size={24} />}<div><strong>{room.status === 'waiting' ? 'Всё готовится к общему старту' : !stream ? 'Подключите экран, чтобы продолжить' : 'Вы выполняете тестирование'}</strong><p>{room.status === 'waiting' ? 'Можно прочитать задания. Ввод ответов включится после старта преподавателя.' : !stream ? 'Во время остановки трансляции задания заблокированы. Таймер продолжает идти.' : `${saveStatus} · ${recordStatus}`}</p></div></div><div className="banner-actions">{!stream ? <button className="primary" onClick={share}><Monitor size={17} />Подключить весь экран</button> : <Badge status="online">Экран подключён</Badge>}<button className="secondary" onClick={() => document.documentElement.requestFullscreen().catch(e => setError(e.message))}><Maximize size={16} />Полный экран</button></div></div><div className="workspace-layout"><aside className="task-sidebar"><span className="eyebrow">ЗАДАНИЯ СЕССИИ</span>{room.tasks.map((t, i) => <button key={t.id} onClick={() => setTaskId(t.id)} className={task.id === t.id ? 'active' : ''}><span>{String(i + 1).padStart(2, '0')}</span><span><strong>{t.title}</strong><small>{t.questions ? `${t.questions.length} вопросов` : 'Практика'}</small></span>{answers[t.id] && <CheckCircle2 size={15} />}</button>)}<div className="save-indicator" role="status"><ShieldCheck size={17} />{saveStatus}</div><button className="primary full" onClick={submit} disabled={!canWork || busy}><Send size={17} />{busy ? 'Отправляем…' : 'Сдать работу'}</button></aside><section className="panel task-workspace"><div className="task-heading"><span className="icon-tile">{task.questions ? <FileText size={23} /> : <Code2 size={23} />}</span><div><h2>{task.title}</h2><p>{task.description}</p></div></div>{!canWork && <Notice kind="info">{room.status === 'waiting' ? 'Выполнение откроется после общего старта.' : clock + offset.current >= room.endsAt ? 'Время истекло. Ожидаем подтверждение сдачи.' : 'Для ввода ответов требуется связь с сервером и трансляция экрана.'}</Notice>}<TaskEditor key={task.id} task={task} trackId={room.trackId} answer={answers[task.id] || {}} disabled={!canWork || busy} onChange={value => change(task.id, value)} /></section></div></>}</main></>;
}
function EnglishResult({ score }) {
  return <div className="english-result" role="status"><span className="eyebrow">РЕЗУЛЬТАТ ТЕСТА ПО АНГЛИЙСКОМУ</span><h3>Ориентировочный уровень: {score.englishLevel}</h3><p>Правильных ответов: {score.correct} из {score.total}.</p><p>A1–A2: {score.englishBlocks.a1a2}/10 · B1: {score.englishBlocks.b1}/10 · B2: {score.englishBlocks.b2}/10</p><small>Шкала: 0–3 базовых — ниже A1, 4–6 — A1, от 7 — A2; для B1 также нужно 6/10 во втором блоке, для B2 — 6/10 в третьем. Это предварительная оценка, а не официальный сертификат CEFR.</small></div>;
}
function SubjectResult({ score }) {
  return <div className="english-result" role="status"><span className="eyebrow">{score.subjectLabel || 'РЕЗУЛЬТАТ ПО ПРЕДМЕТАМ'}</span><h3>{score.correct} из {score.total} правильных ответов</h3>{score.subjects.map(subject => <p key={subject.id}>{subject.title}: <strong>{subject.correct} / {subject.total}</strong></p>)}</div>;
}
function TaskEditor({ task, trackId, answer, disabled, onChange }) {
  const [preview, setPreview] = useState(null);
  const code = answer.code ?? task.practice?.defaultCode ?? '';
  function runJS() {
    // A sandboxed iframe owns the worker; neither can access the platform origin.
    setPreview({ kind: 'js', code, nonce: randomId() });
  }
  return <>{task.article && <article className="reading-article">{task.article}</article>}{task.questions?.map((q, i) => <fieldset disabled={disabled} className="question" key={i}><legend><span>{String(i + 1).padStart(2, '0')}</span>{q.q}</legend><div>{q.o.map((option, j) => <label key={j} className={answer.choices?.[i] === j ? 'chosen' : ''}><input type="radio" name={`${task.id}-${i}`} checked={answer.choices?.[i] === j} onChange={() => onChange({ ...answer, choices: { ...answer.choices, [i]: j } })} /><span>{option}</span></label>)}</div></fieldset>)}{task.practice && <><h3>{task.practice.title}</h3><p className="practice-brief">{task.practice.brief}</p><ul className="requirements">{task.practice.requirements?.map(r => <li key={r}>{r}</li>)}</ul>{task.type === 'practice_web' ? <><div className="code-editors"><label>HTML<textarea spellCheck={false} className="code-editor" value={answer.html ?? task.practice.defaultHtml ?? ''} disabled={disabled} onChange={e => onChange({ ...answer, html: e.target.value, css: answer.css ?? task.practice.defaultCss ?? '' })} /></label><label>CSS<textarea spellCheck={false} className="code-editor" value={answer.css ?? task.practice.defaultCss ?? ''} disabled={disabled} onChange={e => onChange({ ...answer, css: e.target.value, html: answer.html ?? task.practice.defaultHtml ?? '' })} /></label></div><button className="secondary" disabled={disabled} onClick={() => setPreview({ kind: 'html', html: answer.html ?? task.practice.defaultHtml ?? '', css: answer.css ?? task.practice.defaultCss ?? '' })}>Обновить предпросмотр</button>{preview?.kind === 'html' && <iframe title="Предпросмотр HTML и CSS" className="html-preview" sandbox="" srcDoc={`<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src data:;"><style>${preview.css}</style>${preview.html}`} />}</> : <><label>{task.type === 'writing' ? 'Ваш текст' : 'Редактор кода'}<textarea spellCheck={false} className={task.type === 'writing' ? 'writing-editor' : 'code-editor'} value={task.type === 'writing' ? answer.text || '' : code} disabled={disabled} onChange={e => onChange({ ...answer, [task.type === 'writing' ? 'text' : 'code']: e.target.value })} /></label>{trackId === 'js' && <><button className="secondary" disabled={disabled} onClick={runJS}>Запустить JavaScript</button>{preview?.kind === 'js' && <JSRunner key={preview.nonce} code={preview.code} />}</>}{['python', 'csharp'].includes(trackId) && <p className="small">Напишите решение здесь. Код проверит преподаватель; запуск {trackId === 'python' ? 'Python' : 'C#'} в этой версии не подключён.</p>}</>}</>}</>;
}
function JSRunner({ code }) {
  const frame = useRef(null), [result, setResult] = useState('Выполняем…');
  useEffect(() => { const receive = e => { if (e.source === frame.current?.contentWindow && typeof e.data?.output === 'string') setResult(e.data.output.slice(0, 20_000)); }; window.addEventListener('message', receive); return () => window.removeEventListener('message', receive); }, []);
  const workerSource = `let lines=[];const console={log:(...args)=>{if(lines.length<100) lines.push(args.map(v=>typeof v==='string'?v:JSON.stringify(v)).join(' '))}};try{\n${code}\npostMessage(lines.join('\\n')||'Выполнено без вывода')}catch(e){postMessage(e.message)}`;
  const html = `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline' blob:; worker-src blob:; connect-src 'none';"><script>const w=new Worker(URL.createObjectURL(new Blob([${JSON.stringify(workerSource).replaceAll('<', '\\u003c')}],{type:'text/javascript'})));const t=setTimeout(()=>{w.terminate();parent.postMessage({output:'Превышено время выполнения (3 секунды)'},'*')},3000);w.onmessage=e=>{clearTimeout(t);w.terminate();parent.postMessage({output:String(e.data)},'*')};w.onerror=e=>{clearTimeout(t);w.terminate();parent.postMessage({output:e.message},'*')};</script>`;
  return <><iframe ref={frame} title="Изолированный запуск JavaScript" sandbox="allow-scripts" srcDoc={html} className="runner-frame" /><pre className="code-output">{result}</pre></>;
}
