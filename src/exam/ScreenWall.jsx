import React, { useEffect, useRef, useState } from 'react';
import { Monitor, Maximize2, Video, AlertCircle } from 'lucide-react';
import { api } from './api';
import { ScreenWall } from './ScreenWall.js';
import { Badge } from './shared';
import { eventNames, logTime } from './events';

export function useScreenWall(state) {
  const { room, connected, config, signalHandler } = state;
  const [feeds, setFeeds] = useState({}), [error, setError] = useState('');
  const latest = useRef(state), refresh = useRef(null);
  latest.current = state;
  const roster = room?.participants.map(p => `${p.id}:${p.online}:${p.screen}:${!!p.submittedAt}`).join('|');
  useEffect(() => {
    setFeeds({});
    if (!room?.id || !connected) return;
    let alive = true, pending = false;
    const controller = new ScreenWall({
      iceServers: config.iceServers,
      send: (...args) => latest.current.signal(...args),
      update: (id, feed) => { if (alive) setFeeds(current => ({ ...current, [id]: feed })); },
    });
    const handler = message => controller.receive(message);
    signalHandler.current = handler;
    async function sync() {
      if (pending || !alive) return;
      pending = true;
      try {
        const connections = await api(`/rooms/${room.id}/connections`);
        if (!alive) return;
        await controller.sync(latest.current.room.participants, connections);
        if (alive) setError('');
      } catch (e) { if (alive) setError(`Не удалось обновить трансляции: ${e.message}`); }
      finally { pending = false; }
    }
    refresh.current = sync;
    sync(); const timer = setInterval(sync, 3000);
    return () => {
      alive = false; clearInterval(timer); refresh.current = null; controller.close();
      if (signalHandler.current === handler) signalHandler.current = () => {};
    };
  }, [room?.id, connected, config, signalHandler]);
  useEffect(() => { refresh.current?.(); }, [roster]);
  return { feeds, error };
}
export function ScreenVideo({ stream, name, className = '' }) {
  const video = useRef(null);
  useEffect(() => { const el = video.current; el.srcObject = stream || null; return () => { el.srcObject = null; }; }, [stream]);
  return <video ref={video} className={className} aria-label={`Экран: ${name}`} autoPlay muted playsInline />;
}
export function feedLabel(participant, feed) {
  if (participant.submittedAt) return 'Работа сдана';
  if (!participant.online) return 'Нет связи с участником';
  if (!participant.screen) return 'Экран не подключён';
  if (feed?.status === 'connected') return 'Прямой эфир';
  if (feed?.status === 'failed') return 'Повторное подключение к видео';
  if (feed?.status === 'disconnected') return 'Связь с видео потеряна';
  return 'Подключаемся к экрану…';
}
export function recordingLabel(participant, roomStatus) {
  const count = participant.recordingCount || 0;
  if (participant.recordingState === 'error') return `Ошибка записи · сохранено ${count} фрагм.`;
  if (participant.recordingState === 'interrupted' && !participant.submittedAt && roomStatus !== 'finished') return `Запись прервана · ${count} фрагм.`;
  if (participant.submittedAt || roomStatus === 'finished') return count ? `Запись сохранена · ${count} фрагм.` : 'Нет сохранённой записи';
  if (roomStatus === 'waiting') return 'Запись начнётся со стартом';
  if (!participant.online || !participant.screen) return `Запись приостановлена · ${count} фрагм.`;
  return participant.recordingState === 'recording' ? `Идёт запись · ${count} фрагм.` : `Ожидание записи · ${count} фрагм.`;
}
export function ScreenGrid({ room, feeds, onSelect }) {
  return <div className="screen-grid">{room.participants.map(p => {
    const feed = feeds[p.id], live = p.online && p.screen && !p.submittedAt && feed?.status === 'connected';
    return <button className={`screen-tile ${p.eventCount ? 'has-events' : ''}`} key={p.id} onClick={() => onSelect(p.id)} aria-label={`Открыть экран и журнал: ${p.name}`}>
      <div className="tile-video">
        {live && feed.stream ? <ScreenVideo stream={feed.stream} name={p.name} /> : <div className="screen-placeholder"><Monitor size={28} /><span>{feedLabel(p, feed)}</span></div>}
        <span className="tile-number">№ {p.number}</span><span className="tile-expand"><Maximize2 size={15} /></span>
      </div>
      <div className="tile-info"><div className="tile-title"><strong>{p.name}</strong><Badge status={live ? 'online' : p.submittedAt ? 'finished' : 'offline'}>{live ? 'Эфир' : p.submittedAt ? 'Сдано' : 'Ожидание'}</Badge></div><span className="tile-group">{p.group} · {p.activeTaskId ? room.tasks.find(t => t.id === p.activeTaskId)?.title : 'Задание ещё не открыто'}</span><span className={`tile-recording ${p.recordingState === 'error' ? 'error' : ''}`}><Video size={14} />{recordingLabel(p, room.status)}</span><div className="tile-log"><AlertCircle size={14} /><span>{p.eventCount || 0} событий контроля</span></div><span className="tile-last-event">{p.lastEvent ? `${logTime(p.lastEvent.at)} · ${eventNames[p.lastEvent.type] || p.lastEvent.type}` : 'Событий пока нет'}</span></div>
    </button>;
  })}</div>;
}
