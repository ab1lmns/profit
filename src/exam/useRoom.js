import { useEffect, useRef, useState } from 'react';
import { api, post, randomId } from './api';
export function useRoom(id, role) {
  const [room, setRoom] = useState(null), [connected, setConnected] = useState(false), [error, setError] = useState('');
  const [config, setConfig] = useState({ iceServers: [] }), [connectionId] = useState(() => randomId());
  const signalHandler = useRef(() => {}), offset = useRef(0);
  useEffect(() => {
    let alive = true;
    api(`/rooms/${id}${role === 'teacher' ? '' : '/me'}`).then(data => { if (alive) { offset.current = data.serverNow - Date.now(); setRoom(data); } }).catch(e => alive && setError(e.message));
    const source = new EventSource(`/api/rooms/${id}/events?role=${role}&connection=${connectionId}`);
    source.addEventListener('state', e => { const data = JSON.parse(e.data); offset.current = data.serverNow - Date.now(); setRoom(data); setError(''); setConnected(true); });
    source.addEventListener('config', e => setConfig(JSON.parse(e.data)));
    source.addEventListener('signal', e => signalHandler.current(JSON.parse(e.data)));
    source.addEventListener('replaced', () => { source.close(); setConnected(false); setError('Сессия открыта в другом окне. Продолжите там или обновите эту страницу.'); });
    source.onerror = () => { setConnected(false); };
    return () => { alive = false; source.close(); };
  }, [id, role, connectionId]);
  const signal = (to, type, payload) => post(`/rooms/${id}/signal`, { from: connectionId, to, type, payload });
  return { room, setRoom, connected, error, config, signalHandler, signal, offset };
}
