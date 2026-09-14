import React, { useEffect, useRef, useState } from 'react';
import { GraduationCap, ShieldCheck, Clock3, ArrowLeft } from 'lucide-react';
import { timeLabel } from './api';
export const stateNames = { waiting: 'Сбор участников', running: 'Идёт тестирование', finished: 'Завершено' };
export function Logo() { return <a className="exam-logo" href="/"><span><GraduationCap size={24} /></span>Prof<span className="logo-it">IT</span><small>ТЕСТИРОВАНИЕ</small></a>; }
export function Header({ children }) { return <header className="exam-header"><Logo /><div className="header-actions">{children}</div></header>; }
export function Badge({ status, children }) { return <span className={`exam-badge ${status || ''}`}><i />{children || stateNames[status]}</span>; }
export function Notice({ children, kind = 'error' }) { return children ? <div role={kind === 'error' ? 'alert' : 'status'} className={`exam-notice ${kind}`}>{children}</div> : null; }
export function Timer({ room, offset }) {
  const [tick, setTick] = useState(Date.now());
  useEffect(() => { const timer = setInterval(() => setTick(Date.now()), 500); return () => clearInterval(timer); }, []);
  const left = room.endsAt ? (room.endsAt - tick - (offset?.current || 0)) / 1000 : room.durationMinutes * 60;
  return <div className={`exam-timer ${left < 300 && room.status === 'running' ? 'urgent' : ''}`}><Clock3 size={18} />{room.status === 'finished' ? 'Завершено' : timeLabel(left)}</div>;
}
export function Back({ onClick, children = 'Все сессии' }) { return <button className="text-button" onClick={onClick}><ArrowLeft size={17} />{children}</button>; }
export function ProctorNotice() { return <div className="proctor-notice"><ShieldCheck size={22} /><div><strong>Прокторинг экрана</strong><p>Преподаватель видит и записывает экран. Фиксируются переключения вкладок, выход из полного экрана и вставки текста. Камера и микрофон не используются.</p></div></div>; }

export function useDialog(onClose) {
  const element = useRef(null), close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    const previous = document.activeElement;
    const focusable = () => [...element.current.querySelectorAll('button, input, select, textarea, a[href], summary, [tabindex="0"]')].filter(el => !el.disabled && el.getClientRects().length);
    focusable()[0]?.focus();
    function keydown(e) {
      if (e.key === 'Escape') close.current();
      if (e.key !== 'Tab') return;
      const items = focusable(), first = items[0], last = items.at(-1);
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
    }
    const scroll = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', keydown);
    return () => { document.body.style.overflow = scroll; document.removeEventListener('keydown', keydown); previous?.focus(); };
  }, []);
  return element;
}
