import React, { useMemo, useState } from 'react';
import { Search, ListFilter } from 'lucide-react';
import { eventNames, controlEvents, logTime } from './events';
import { dateLabel } from './api';

export default function EventLog({ events = [], compact = false }) {
  const [filter, setFilter] = useState('all'), [query, setQuery] = useState('');
  const visible = useMemo(() => [...events].reverse().filter(event =>
    (filter !== 'control' || controlEvents.has(event.type)) &&
    `${eventNames[event.type] || event.type} ${event.detail}`.toLowerCase().includes(query.toLowerCase()),
  ), [events, filter, query]);
  return <section className={`live-event-log ${compact ? 'compact' : ''}`} aria-label="Журнал событий участника">
    <div className="section-heading"><h3>Журнал событий <span className="count-pill">{events.length}</span></h3><span className="log-live-dot">Обновляется</span></div>
    <div className="log-toolbar"><label><Search size={15} /><input aria-label="Поиск по журналу" placeholder="Поиск события" value={query} onChange={e => setQuery(e.target.value)} /></label><button className={`secondary ${filter === 'control' ? 'selected' : ''}`} aria-pressed={filter === 'control'} onClick={() => setFilter(filter === 'control' ? 'all' : 'control')}><ListFilter size={15} />{filter === 'control' ? 'Только контроль' : 'Все события'}</button></div>
    <div className="log-entries" tabIndex={0} aria-label="События, сначала новые">
      {!visible.length && <p className="muted">{events.length ? 'По этому фильтру событий нет.' : 'Событий пока нет.'}</p>}
      {visible.map(event => <div key={event.id} className={`log-entry ${controlEvents.has(event.type) ? 'control' : ''}`}><time dateTime={new Date(event.at).toISOString()} title={dateLabel(event.at)}>{logTime(event.at)}</time><div><strong>{eventNames[event.type] || event.type}</strong>{event.detail && <p>{event.detail}</p>}</div></div>)}
    </div>
    <span className="log-total">Показано {visible.length} из {events.length} · время до секунды</span>
  </section>;
}
