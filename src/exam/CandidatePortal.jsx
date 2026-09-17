import React, { useEffect, useState, useRef } from 'react';
import {
  CheckCircle2, LogIn, LogOut, Save, UserPlus, Sparkles, Plus, X,
  ArrowLeft, ExternalLink, BookOpen, Award, Compass, Send,
  Check, Mail, User, Link2, Phone, GraduationCap, UploadCloud,
  FileText, Paperclip, Trash2, FileCheck
} from 'lucide-react';
import { DIRECTIONS } from '../data/directions.js';
import { api, post } from './api';
import { Header, Notice } from './shared';

const PRESET_SKILLS = [
  'HTML / CSS', 'JavaScript', 'Python', 'C#', 'SQL',
  '1С:Предприятие', 'Figma', 'Photoshop', 'Illustrator',
  'Blender', '3ds Max', 'Компас-3D', 'AutoCAD', 'Git',
  'Excel / Анализ', 'English (B2/C1)'
];

const SKILL_LEVELS = [
  { id: 'Базовый', label: 'Базовый', color: '#64748b', bg: '#f1f5f9' },
  { id: 'Уверенный', label: 'Уверенный', color: '#0284c7', bg: '#e0f2fe' },
  { id: 'Продвинутый', label: 'Продвинутый', color: '#16a34a', bg: '#dcfce7' },
];

function formatBytes(bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return bytes + ' Б';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' КБ';
  return (bytes / (1024 * 1024)).toFixed(1) + ' МБ';
}

const inputStyle = {
  width: '100%',
  padding: '14px 16px',
  borderRadius: '12px',
  border: '1.5px solid var(--exam-line)',
  background: 'white',
  color: 'var(--exam-ink)',
  fontSize: '14px',
  lineHeight: '1.6',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
  outline: 'none',
  transition: 'border-color 0.15s, box-shadow 0.15s',
};

const textareaStyle = {
  ...inputStyle,
  resize: 'vertical',
  minHeight: '90px',
};

const emptyProfile = {
  name: '',
  email: '',
  phone: '',
  password: '',
  group: '',
  directions: [],
  motivation: '',
  skills: [
    { name: 'HTML / CSS', level: 'Уверенный' },
    { name: 'Figma', level: 'Базовый' },
  ],
  experience: '',
  links: '',
  documents: [],
  goals: '',
};

const toForm = candidate => ({
  ...candidate,
  password: '',
  skills: Array.isArray(candidate.skills) ? candidate.skills : [],
  documents: Array.isArray(candidate.documents) ? candidate.documents : [],
});

export default function CandidatePortal() {
  const [mode, setMode] = useState('loading');
  const [form, setForm] = useState(emptyProfile);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState('');
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [customSkillName, setCustomSkillName] = useState('');
  const [customSkillLevel, setCustomSkillLevel] = useState('Базовый');
  const fileInputRef = useRef(null);

  useEffect(() => {
    api('/candidates/me')
      .then(({ candidate }) => {
        setForm(toForm(candidate));
        setMode('profile');
      })
      .catch(error => {
        if (error.status === 401) setMode('register');
        else {
          setError(error.message);
          setMode('register');
        }
      });
  }, []);

  const set = key => event => setForm(current => ({ ...current, [key]: event.target.value }));

  const toggleDirection = id => {
    setForm(current => {
      const exists = current.directions.includes(id);
      if (exists) {
        return { ...current, directions: current.directions.filter(v => v !== id) };
      }
      if (current.directions.length >= 2) {
        return current;
      }
      return { ...current, directions: [...current.directions, id] };
    });
  };

  const addSkill = (name, level = 'Базовый') => {
    if (!name.trim()) return;
    if (form.skills.some(s => s.name.toLowerCase() === name.trim().toLowerCase())) return;
    setForm(current => ({
      ...current,
      skills: [...current.skills, { name: name.trim(), level }]
    }));
    setCustomSkillName('');
  };

  const removeSkill = index => {
    setForm(current => ({
      ...current,
      skills: current.skills.filter((_, i) => i !== index)
    }));
  };

  const changeSkillLevel = (index, level) => {
    setForm(current => ({
      ...current,
      skills: current.skills.map((s, i) => i === index ? { ...s, level } : s)
    }));
  };

  async function handleFileUpload(event) {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    setUploading(true);
    setError('');
    try {
      for (const file of files) {
        if (file.size > 10 * 1024 * 1024) {
          throw new Error(`Файл "${file.name}" превышает допустимый размер (10 МБ)`);
        }
        const base64 = await new Promise((res, rej) => {
          const reader = new FileReader();
          reader.onload = () => res(reader.result);
          reader.onerror = () => rej(new Error('Не удалось прочитать файл'));
          reader.readAsDataURL(file);
        });
        const { document } = await post('/candidates/upload', {
          name: file.name,
          type: file.type,
          data: base64,
        });
        if (document) {
          setForm(current => ({
            ...current,
            documents: [...(current.documents || []), document]
          }));
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  const removeDocument = id => {
    setForm(current => ({
      ...current,
      documents: (current.documents || []).filter(d => d.id !== id && d.fileName !== id)
    }));
  };

  async function submit(event) {
    event.preventDefault();
    setError('');
    setSaved('');
    setBusy(true);
    try {
      if (mode === 'login') {
        const { candidate } = await post('/candidates/login', { email: form.email, password: form.password });
        setForm(toForm(candidate));
        setMode('profile');
      } else if (mode === 'register') {
        if (!form.directions.length) throw new Error('Пожалуйста, выберите хотя бы одно направление');
        const { candidate } = await post('/candidates/register', form);
        setForm(toForm(candidate));
        setMode('profile');
      } else {
        if (!form.directions.length) throw new Error('Пожалуйста, выберите хотя бы одно направление');
        const { candidate } = await api('/candidates/me', { method: 'PUT', body: form });
        setForm(toForm(candidate));
        setSaved('Профиль успешно сохранён! Данные обновлены в приёмной комиссии.');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    try {
      await post('/candidates/logout');
      setForm(emptyProfile);
      setMode('login');
    } catch (error) {
      setError(error.message);
    }
  }

  if (mode === 'loading') {
    return (
      <>
        <Header />
        <main className="exam-main" style={{ textAlign: 'center', padding: '100px 20px' }}>
          <p style={{ fontSize: '16px', color: 'var(--exam-muted)' }}>Загружаем профиль кандидата…</p>
        </main>
      </>
    );
  }

  const profile = mode === 'profile';

  return (
    <>
      <Header>
        <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
          <a href="/" className="text-button" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ArrowLeft size={16} /> Кабинет учителя
          </a>
          {profile && (
            <button className="text-button" onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <LogOut size={16} /> Выйти
            </button>
          )}
        </div>
      </Header>

      <main style={{ maxWidth: '1240px', margin: '0 auto', padding: '36px 20px 80px' }}>

        {/* Main Grid Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: profile ? '1fr' : 'minmax(300px, 1fr) minmax(400px, 1.35fr)', gap: '44px', alignItems: 'start' }}>

          {/* Left information column (for registration / login) */}
          {!profile && (
            <section style={{ position: 'sticky', top: '24px' }}>
              <span className="eyebrow" style={{ color: 'var(--exam-accent-dark)', fontWeight: 800, letterSpacing: '1.5px' }}>
                PROFIT / ПРИЁМНАЯ КАМПАНИЯ
              </span>
              <h1 style={{ fontSize: '36px', lineHeight: '1.25', margin: '14px 0 18px', fontWeight: 800, color: 'var(--exam-ink)' }}>
                {mode === 'login' ? 'Вход в личный кабинет кандидата' : 'Анкета и отбор в спецгруппу'}
              </h1>
              <p style={{ fontSize: '15px', lineHeight: '1.8', color: 'var(--exam-muted)', marginBottom: '30px' }}>
                Заполните анкету, выберите до 2 приоритетных направлений и укажите свои навыки.
                После рассмотрения кураторы свяжутся с вами и пригласят на тестирование.
              </p>

              {/* 3 Step Process Box */}
              <div style={{ background: 'white', border: '1px solid var(--exam-line)', borderRadius: '18px', padding: '24px', display: 'grid', gap: '18px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                  <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'var(--exam-soft)', color: 'var(--exam-accent-dark)', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: '13px', flexShrink: 0 }}>
                    01
                  </div>
                  <div>
                    <strong style={{ display: 'block', fontSize: '14px', color: 'var(--exam-ink)', marginBottom: '2px' }}>Анкета и навыки</strong>
                    <span style={{ fontSize: '12px', color: 'var(--exam-muted)', lineHeight: '1.6' }}>Контакты, направления (до 2), теги навыков, опыт и мотивация.</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                  <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'var(--exam-soft)', color: 'var(--exam-accent-dark)', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: '13px', flexShrink: 0 }}>
                    02
                  </div>
                  <div>
                    <strong style={{ display: 'block', fontSize: '14px', color: 'var(--exam-ink)', marginBottom: '2px' }}>Очное тестирование</strong>
                    <span style={{ fontSize: '12px', color: 'var(--exam-muted)', lineHeight: '1.6' }}>Синхронный тест в аудитории по ссылке от преподавателя.</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                  <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'var(--exam-soft)', color: 'var(--exam-accent-dark)', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: '13px', flexShrink: 0 }}>
                    03
                  </div>
                  <div>
                    <strong style={{ display: 'block', fontSize: '14px', color: 'var(--exam-ink)', marginBottom: '2px' }}>Зачисление и проекты</strong>
                    <span style={{ fontSize: '12px', color: 'var(--exam-muted)', lineHeight: '1.6' }}>Формирование проектных команд и старт практической работы.</span>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Right Card / Form */}
          <div style={{ background: 'white', border: '1px solid var(--exam-line)', borderRadius: '22px', padding: '36px', boxShadow: '0 10px 40px rgba(18, 38, 63, 0.04)', maxWidth: profile ? '860px' : '100%', margin: profile ? '0 auto' : '0' }}>

            {/* Header of Form */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '26px', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '46px', height: '46px', borderRadius: '13px', background: profile ? 'var(--exam-green-bg)' : 'var(--exam-soft)', color: profile ? 'var(--exam-green)' : 'var(--exam-accent-dark)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  {profile ? <CheckCircle2 size={24} /> : mode === 'login' ? <LogIn size={24} /> : <UserPlus size={24} />}
                </div>
                <div>
                  <h2 style={{ fontSize: '22px', margin: 0, fontWeight: 800, color: 'var(--exam-ink)' }}>
                    {profile ? form.name : mode === 'login' ? 'Вход кандидата' : 'Анкета кандидата'}
                  </h2>
                  <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--exam-muted)' }}>
                    {profile ? `Учебная группа: ${form.group || '—'} · ${form.email}` : 'Заполните информацию для приёмной комиссии'}
                  </p>
                </div>
              </div>

              {!profile && (
                <button
                  type="button"
                  className="secondary"
                  style={{ minHeight: '38px', padding: '6px 14px', fontSize: '12px' }}
                  onClick={() => { setError(''); setMode(mode === 'login' ? 'register' : 'login'); }}
                >
                  {mode === 'login' ? 'Создать анкету' : 'Уже есть профиль?'}
                </button>
              )}
            </div>

            <Notice>{error}</Notice>
            {profile && <Notice kind="info">{saved}</Notice>}

            <form onSubmit={submit}>

              {/* LOGIN MODE */}
              {!profile && mode === 'login' && (
                <div style={{ display: 'grid', gap: '18px' }}>
                  <label style={{ margin: 0 }}>
                    <span style={{ fontSize: '13px', fontWeight: 650, color: 'var(--exam-ink)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                      <Mail size={14} color="var(--exam-accent-dark)" /> Email
                    </span>
                    <input
                      type="email"
                      value={form.email}
                      onChange={set('email')}
                      autoComplete="email"
                      placeholder="student@example.kz"
                      required
                      style={inputStyle}
                    />
                  </label>

                  <label style={{ margin: 0 }}>
                    <span style={{ fontSize: '13px', fontWeight: 650, color: 'var(--exam-ink)', marginBottom: '6px', display: 'block' }}>Пароль</span>
                    <input
                      type="password"
                      value={form.password}
                      onChange={set('password')}
                      autoComplete="current-password"
                      placeholder="Введите пароль"
                      required
                      style={inputStyle}
                    />
                  </label>
                </div>
              )}

              {/* REGISTRATION & PROFILE EDIT MODE */}
              {(profile || mode === 'register') && (
                <div style={{ display: 'grid', gap: '28px' }}>

                  {/* Block 1: Personal Info */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', paddingBottom: '8px', borderBottom: '1px solid var(--exam-line)' }}>
                      <User size={18} color="var(--exam-accent-dark)" />
                      <strong style={{ fontSize: '15px', color: 'var(--exam-ink)' }}>1. Основные данные</strong>
                    </div>

                    <div className="form-grid" style={{ marginBottom: '14px' }}>
                      <label style={{ margin: 0 }}>
                        <span style={{ fontSize: '13px', fontWeight: 650, color: 'var(--exam-ink)', marginBottom: '6px', display: 'block' }}>ФИО</span>
                        <input
                          value={form.name}
                          onChange={set('name')}
                          autoComplete="name"
                          placeholder="Иванов Иван Иванович"
                          required
                          style={inputStyle}
                        />
                      </label>

                      <label style={{ margin: 0 }}>
                        <span style={{ fontSize: '13px', fontWeight: 650, color: 'var(--exam-ink)', marginBottom: '6px', display: 'block' }}>Учебная группа / класс</span>
                        <input
                          value={form.group}
                          onChange={set('group')}
                          placeholder="ИС-24, ВТ-22, 11 «А»"
                          required
                          style={inputStyle}
                        />
                      </label>
                    </div>

                    <div className="form-grid" style={{ marginBottom: !profile ? '14px' : '0' }}>
                      <label style={{ margin: 0 }}>
                        <span style={{ fontSize: '13px', fontWeight: 650, color: 'var(--exam-ink)', marginBottom: '6px', display: 'block' }}>Email</span>
                        <input
                          type="email"
                          value={form.email}
                          onChange={set('email')}
                          disabled={profile}
                          autoComplete="email"
                          placeholder="ivanov@example.kz"
                          required
                          style={inputStyle}
                        />
                      </label>

                      <label style={{ margin: 0 }}>
                        <span style={{ fontSize: '13px', fontWeight: 650, color: 'var(--exam-ink)', marginBottom: '6px', display: 'block' }}>Телефон / WhatsApp</span>
                        <input
                          type="tel"
                          value={form.phone || ''}
                          onChange={set('phone')}
                          placeholder="+7 (777) 000-00-00"
                          required
                          style={inputStyle}
                        />
                      </label>
                    </div>

                    {!profile && (
                      <label style={{ margin: 0, marginTop: '14px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 650, color: 'var(--exam-ink)', marginBottom: '6px', display: 'block' }}>Пароль для входа</span>
                        <input
                          type="password"
                          value={form.password}
                          onChange={set('password')}
                          autoComplete="new-password"
                          minLength={6}
                          placeholder="Минимум 6 символов"
                          required
                          style={inputStyle}
                        />
                      </label>
                    )}
                  </div>

                  {/* Block 2: Direction Picker */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', paddingBottom: '8px', borderBottom: '1px solid var(--exam-line)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Compass size={18} color="var(--exam-accent-dark)" />
                        <strong style={{ fontSize: '15px', color: 'var(--exam-ink)' }}>2. Выбор направлений</strong>
                      </div>
                      <span style={{ fontSize: '12px', fontWeight: 700, padding: '3px 8px', borderRadius: '6px', background: form.directions.length >= 2 ? 'var(--exam-soft)' : '#f1f5f9', color: form.directions.length >= 2 ? 'var(--exam-accent-dark)' : 'var(--exam-muted)' }}>
                        Выбрано: {form.directions.length} из 2
                      </span>
                    </div>

                    <p style={{ fontSize: '12px', color: 'var(--exam-muted)', margin: '0 0 14px' }}>
                      Отметьте 1 или 2 приоритетных направления, в которых хотите обучаться:
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '10px' }}>
                      {DIRECTIONS.map(direction => {
                        const active = form.directions.includes(direction.id);
                        const disabled = !active && form.directions.length >= 2;
                        return (
                          <div
                            key={direction.id}
                            onClick={() => !disabled && toggleDirection(direction.id)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px',
                              padding: '12px 14px',
                              borderRadius: '12px',
                              border: `1.5px solid ${active ? 'var(--exam-accent-dark)' : 'var(--exam-line)'}`,
                              background: active ? 'var(--exam-soft)' : disabled ? '#f9fafb' : 'white',
                              cursor: disabled ? 'not-allowed' : 'pointer',
                              opacity: disabled ? 0.45 : 1,
                              transition: 'all 0.15s ease',
                              userSelect: 'none',
                            }}
                          >
                            <div style={{ width: '20px', height: '20px', borderRadius: '6px', border: `1.5px solid ${active ? 'var(--exam-accent-dark)' : '#cbd5e1'}`, background: active ? 'var(--exam-accent-dark)' : 'white', display: 'grid', placeItems: 'center', flexShrink: 0, color: 'white' }}>
                              {active && <Check size={14} strokeWidth={3} />}
                            </div>
                            <span style={{ fontSize: '13px', fontWeight: active ? 750 : 550, color: active ? 'var(--exam-accent-dark)' : 'var(--exam-ink)' }}>
                              {direction.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Block 3: Motivation */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', paddingBottom: '8px', borderBottom: '1px solid var(--exam-line)' }}>
                      <Sparkles size={18} color="var(--exam-accent-dark)" />
                      <strong style={{ fontSize: '15px', color: 'var(--exam-ink)' }}>3. «Почему хочу попасть в это направление?»</strong>
                    </div>

                    <label style={{ margin: 0 }}>
                      <span style={{ fontSize: '12px', color: 'var(--exam-muted)', marginBottom: '8px', display: 'block', fontWeight: 400 }}>
                        Опишите вашу мотивацию, интерес к выбранному направлению и цели на период спецгруппы.
                      </span>
                      <textarea
                        value={form.motivation}
                        onChange={set('motivation')}
                        placeholder="Например: Мне интересна разработка веб-сервисов и автоматизация на 1С. Хочу решать реальные кейсы, научиться работать в команде разработчиков..."
                        rows={3}
                        required
                        style={textareaStyle}
                      />
                    </label>
                  </div>

                  {/* Block 4: Skills with Tags & Level */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', paddingBottom: '8px', borderBottom: '1px solid var(--exam-line)' }}>
                      <Award size={18} color="var(--exam-accent-dark)" />
                      <strong style={{ fontSize: '15px', color: 'var(--exam-ink)' }}>4. Навыки и уровень владения</strong>
                    </div>

                    <p style={{ fontSize: '12px', color: 'var(--exam-muted)', margin: '0 0 14px' }}>
                      Укажите ваши технические и дизайнерские навыки (например, Figma / HTML / Blender / 1С / Python):
                    </p>

                    {/* Skill List items */}
                    <div style={{ display: 'grid', gap: '8px', marginBottom: '16px' }}>
                      {form.skills.map((skill, index) => (
                        <div
                          key={index}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            background: '#f8fafc',
                            border: '1px solid var(--exam-line)',
                            borderRadius: '12px',
                            padding: '10px 14px',
                            gap: '12px',
                            flexWrap: 'wrap',
                          }}
                        >
                          <strong style={{ fontSize: '13px', color: 'var(--exam-ink)', flex: '1 1 140px' }}>
                            {skill.name}
                          </strong>

                          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                            {SKILL_LEVELS.map(lvl => {
                              const active = skill.level === lvl.id;
                              return (
                                <button
                                  type="button"
                                  key={lvl.id}
                                  onClick={() => changeSkillLevel(index, lvl.id)}
                                  style={{
                                    padding: '5px 9px',
                                    borderRadius: '7px',
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    border: `1px solid ${active ? lvl.color : '#e2e8f0'}`,
                                    background: active ? lvl.bg : 'white',
                                    color: active ? lvl.color : '#64748b',
                                    cursor: 'pointer',
                                    transition: 'all 0.15s',
                                  }}
                                >
                                  {lvl.label}
                                </button>
                              );
                            })}

                            <button
                              type="button"
                              onClick={() => removeSkill(index)}
                              style={{
                                background: 'none',
                                border: 'none',
                                padding: '4px',
                                color: '#94a3b8',
                                cursor: 'pointer',
                                display: 'grid',
                                placeItems: 'center',
                                marginLeft: '6px',
                              }}
                              title="Удалить навык"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Add Custom Skill Row */}
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '14px' }}>
                      <input
                        type="text"
                        value={customSkillName}
                        onChange={e => setCustomSkillName(e.target.value)}
                        placeholder="Добавить свой навык (Docker, Blender, SQL, C#...)"
                        style={{ ...inputStyle, flex: '1 1 220px', padding: '10px 14px' }}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addSkill(customSkillName, customSkillLevel);
                          }
                        }}
                      />
                      <select
                        value={customSkillLevel}
                        onChange={e => setCustomSkillLevel(e.target.value)}
                        style={{ ...inputStyle, width: '130px', padding: '10px 12px' }}
                      >
                        {SKILL_LEVELS.map(l => <option key={l.id} value={l.id}>{l.label}</option>)}
                      </select>
                      <button
                        type="button"
                        className="secondary"
                        onClick={() => addSkill(customSkillName, customSkillLevel)}
                        style={{ minHeight: '42px', padding: '0 16px', fontSize: '13px', borderRadius: '12px' }}
                      >
                        <Plus size={15} /> Добавить
                      </button>
                    </div>

                    {/* Preset Chips */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', color: 'var(--exam-muted)', marginRight: '4px' }}>Быстрый выбор:</span>
                      {PRESET_SKILLS.filter(s => !form.skills.some(x => x.name.toLowerCase() === s.toLowerCase())).map(preset => (
                        <button
                          type="button"
                          key={preset}
                          onClick={() => addSkill(preset, 'Базовый')}
                          style={{
                            padding: '5px 11px',
                            borderRadius: '16px',
                            background: '#f8fafc',
                            border: '1px solid var(--exam-line)',
                            fontSize: '11px',
                            fontWeight: 600,
                            color: 'var(--exam-ink)',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <Plus size={11} color="var(--exam-accent-dark)" /> {preset}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Block 5: Experience */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', paddingBottom: '8px', borderBottom: '1px solid var(--exam-line)' }}>
                      <BookOpen size={18} color="var(--exam-accent-dark)" />
                      <strong style={{ fontSize: '15px', color: 'var(--exam-ink)' }}>5. Опыт: курсы, проекты, олимпиады, кружки</strong>
                    </div>

                    <label style={{ margin: 0 }}>
                      <span style={{ fontSize: '12px', color: 'var(--exam-muted)', marginBottom: '8px', display: 'block', fontWeight: 400 }}>
                        Расскажите, что уже пробовали делать (пет-проекты, хакатоны, сертификаты, кружки).
                      </span>
                      <textarea
                        value={form.experience}
                        onChange={set('experience')}
                        placeholder="Например: Прошел онлайн-курс по основам 3D моделирования, собрал пет-проект на JavaScript, участвовал в чемпионате WorldSkills..."
                        rows={3}
                        style={textareaStyle}
                      />
                    </label>
                  </div>

                  {/* Block 6: Links and Documents */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', paddingBottom: '8px', borderBottom: '1px solid var(--exam-line)' }}>
                      <Paperclip size={18} color="var(--exam-accent-dark)" />
                      <strong style={{ fontSize: '15px', color: 'var(--exam-ink)' }}>6. Ссылки и документы (сертификаты, дипломы, работы)</strong>
                    </div>

                    <label style={{ margin: '0 0 16px', display: 'block' }}>
                      <span style={{ fontSize: '12px', color: 'var(--exam-muted)', marginBottom: '8px', display: 'block', fontWeight: 400 }}>
                        Ссылки на GitHub, Figma, Behance, Google Drive или Яндекс.Диск:
                      </span>
                      <input
                        type="text"
                        value={form.links}
                        onChange={set('links')}
                        placeholder="https://github.com/... , https://www.figma.com/..."
                        style={inputStyle}
                      />
                    </label>

                    {/* Document Upload Area */}
                    <div>
                      <span style={{ fontSize: '12px', color: 'var(--exam-muted)', marginBottom: '8px', display: 'block', fontWeight: 400 }}>
                        Загрузка документов (сертификаты олимпиад, курсов, примеры работ):
                      </span>

                      <input
                        type="file"
                        ref={fileInputRef}
                        multiple
                        accept=".pdf,.png,.jpg,.jpeg,.webp,.svg,.zip,.doc,.docx,.txt"
                        onChange={handleFileUpload}
                        style={{ display: 'none' }}
                      />

                      {/* Drop / Click Box */}
                      <div
                        onClick={() => !uploading && fileInputRef.current?.click()}
                        style={{
                          border: '2px dashed #cbd5e1',
                          borderRadius: '12px',
                          padding: '20px 16px',
                          textAlign: 'center',
                          background: '#f8fafc',
                          cursor: uploading ? 'wait' : 'pointer',
                          transition: 'border-color 0.15s, background-color 0.15s',
                          marginBottom: form.documents && form.documents.length > 0 ? '12px' : '0',
                        }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--exam-accent-dark)'}
                        onMouseLeave={e => e.currentTarget.style.borderColor = '#cbd5e1'}
                      >
                        <UploadCloud size={28} color="var(--exam-accent-dark)" style={{ margin: '0 auto 8px', display: 'block' }} />
                        <strong style={{ fontSize: '13px', color: 'var(--exam-ink)', display: 'block' }}>
                          {uploading ? 'Загрузка документов…' : 'Нажмите для выбора файлов'}
                        </strong>
                        <span style={{ fontSize: '11px', color: 'var(--exam-muted)' }}>
                          PDF, PNG, JPG, ZIP, DOCX (до 10 МБ на файл)
                        </span>
                      </div>

                      {/* Uploaded Documents List */}
                      {form.documents && form.documents.length > 0 && (
                        <div style={{ display: 'grid', gap: '8px', marginTop: '10px' }}>
                          {form.documents.map((doc, idx) => (
                            <div
                              key={doc.id || idx}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                background: 'white',
                                border: '1px solid var(--exam-line)',
                                borderRadius: '10px',
                                padding: '8px 12px',
                                gap: '10px',
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                                <FileText size={18} color="var(--exam-accent-dark)" style={{ flexShrink: 0 }} />
                                <div style={{ minWidth: 0 }}>
                                  <a
                                    href={doc.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    style={{
                                      fontSize: '13px',
                                      fontWeight: 600,
                                      color: 'var(--exam-ink)',
                                      textDecoration: 'none',
                                      display: 'inline-block',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap',
                                      maxWidth: '320px',
                                    }}
                                    title={doc.name}
                                  >
                                    {doc.name}
                                  </a>
                                  {doc.size && (
                                    <span style={{ fontSize: '11px', color: 'var(--exam-muted)', marginLeft: '8px' }}>
                                      {formatBytes(doc.size)}
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <a
                                  href={doc.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-button"
                                  style={{
                                    fontSize: '11px',
                                    padding: '4px 8px',
                                    textDecoration: 'none',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    color: 'var(--exam-accent-dark)',
                                  }}
                                >
                                  <ExternalLink size={12} /> Открыть
                                </a>
                                <button
                                  type="button"
                                  onClick={() => removeDocument(doc.id || doc.fileName)}
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    padding: '4px',
                                    color: '#94a3b8',
                                    cursor: 'pointer',
                                    display: 'grid',
                                    placeItems: 'center',
                                  }}
                                  title="Удалить документ"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Block 7: Goals */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', paddingBottom: '8px', borderBottom: '1px solid var(--exam-line)' }}>
                      <Sparkles size={18} color="var(--exam-accent-dark)" />
                      <strong style={{ fontSize: '15px', color: 'var(--exam-ink)' }}>7. Что хотите изучить в спецгруппе</strong>
                    </div>

                    <label style={{ margin: 0 }}>
                      <span style={{ fontSize: '12px', color: 'var(--exam-muted)', marginBottom: '8px', display: 'block', fontWeight: 400 }}>
                        Какие темы, инструменты и технологии хотите освоить в первую очередь.
                      </span>
                      <textarea
                        value={form.goals || ''}
                        onChange={set('goals')}
                        placeholder="Например: Хочу освоить работу с базами данных, компонентный подход во фронтенде и научиться создавать чистую 3D топологию..."
                        rows={3}
                        style={textareaStyle}
                      />
                    </label>
                  </div>

                </div>
              )}

              {/* Submit CTA */}
              <div style={{ marginTop: '32px', paddingTop: '22px', borderTop: '1px solid var(--exam-line)' }}>
                <button
                  type="submit"
                  className="primary full"
                  disabled={busy}
                  style={{ minHeight: '52px', fontSize: '15px', fontWeight: 750, borderRadius: '12px' }}
                >
                  {profile ? (
                    <><Save size={18} /> {busy ? 'Сохраняем…' : 'Сохранить изменения в анкете'}</>
                  ) : mode === 'login' ? (
                    <><LogIn size={18} /> {busy ? 'Проверяем…' : 'Войти в личный кабинет'}</>
                  ) : (
                    <><Send size={18} /> {busy ? 'Отправляем…' : 'Подать заявку в спецгруппу'}</>
                  )}
                </button>
              </div>

              {!profile && (
                <p style={{ textAlign: 'center', marginTop: '14px', fontSize: '12px', color: 'var(--exam-muted)', margin: '14px 0 0' }}>
                  После отправки заявки вы сможете возвращаться и редактировать данные по своему email и паролю.
                </p>
              )}
            </form>

          </div>

        </div>
      </main>
    </>
  );
}
