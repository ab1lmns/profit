import React, { useState } from 'react';
import { Download, Play, ChevronLeft, ChevronRight } from 'lucide-react';
import { dateLabel } from './api';
import { logTime } from './events';

export default function Recordings({ roomId, participantId, recordings }) {
  const [chosen, setChosen] = useState(null);
  const index = Math.max(0, recordings.findIndex(r => r.id === chosen)), current = recordings[index];
  const path = r => `/api/rooms/${roomId}/participants/${participantId}/recordings/${r.id}`;
  const bytes = recordings.reduce((sum, r) => sum + r.size, 0);
  if (!current) return <div className="empty-state compact"><Play size={28} /><h3>Запись пока не сохранена</h3><p>Первый фрагмент появится примерно через 20 секунд после старта. Запись идёт независимо от того, открыт ли кабинет преподавателя.</p></div>;
  return <section className="recording-archive"><div className="section-heading"><div><h3>Сохранённая запись экрана</h3><p>{recordings.length} фрагм. · {(bytes / 1024 / 1024).toFixed(1)} МБ на сервере</p></div><a className="secondary" href={`${path(current)}?download=1`} download={`screen-${current.id}.webm`}><Download size={16} />Скачать фрагмент</a></div><video className="recording-player" src={path(current)} controls autoPlay onEnded={() => { if (index + 1 < recordings.length) setChosen(recordings[index + 1].id); }} /><div className="recording-navigation"><button className="secondary" disabled={index === 0} onClick={() => setChosen(recordings[index - 1].id)}><ChevronLeft size={17} />Предыдущий</button><span>Фрагмент {index + 1} из {recordings.length} · сохранён {dateLabel(current.at)}</span><button className="secondary" disabled={index === recordings.length - 1} onClick={() => setChosen(recordings[index + 1].id)}>Следующий<ChevronRight size={17} /></button></div><p className="small">Фрагменты воспроизводятся последовательно. Каждый можно скачать отдельно; они сохраняются и после завершения сессии.</p><div className="recordings-list">{recordings.map((r, i) => <button className={`secondary ${r.id === current.id ? 'selected' : ''}`} key={r.id} onClick={() => setChosen(r.id)} aria-pressed={r.id === current.id}><Play size={14} />{i + 1} · {logTime(r.at)}</button>)}</div></section>;
}
