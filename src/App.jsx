import React, { useEffect, useState } from 'react';
import { api, post } from './exam/api';
import Teacher, { TeacherLogin } from './exam/Teacher';
import Participant from './exam/Participant';
import CandidatePortal from './exam/CandidatePortal';
import LandingPage from './exam/LandingPage';
import { Header, Notice } from './exam/shared';
import './exam/exam.css';
import './exam/landing.css';
import './exam/review.css';

export default function App() {
  const join = location.pathname.match(/^\/join\/([a-f0-9]{36})\/?$/);
  const apply = location.pathname === '/apply';
  const teacherLogin = location.pathname === '/teacher';
  const [teacher, setTeacher] = useState(null), [loading, setLoading] = useState(!join && !apply && teacherLogin), [error, setError] = useState('');

  useEffect(() => {
    if (join || apply || !teacherLogin) return;
    api('/teacher/me').then(setTeacher).catch(e => { if (e.status !== 401) setError('Не удалось связаться с сервером. Запустите npm run dev или npm start.'); }).finally(() => setLoading(false));
  }, [apply, join, teacherLogin]);

  if (join) return <Participant id={join[1]} />;
  if (apply) return <CandidatePortal />;
  if (!teacherLogin) return <LandingPage />;
  if (loading) return <><Header /><main className="exam-main">Загружаем кабинет…</main></>;
  return teacher ? <Teacher teacher={teacher} onLogout={async () => { try { await post('/teacher/logout'); setTeacher(null); history.replaceState(null, '', '/'); } catch(e) { setError(e.message); } }} /> : <TeacherLogin onLogin={t => { setError(''); setTeacher(t); }} />;
}
