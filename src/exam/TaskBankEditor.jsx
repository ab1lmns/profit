import React, { useEffect, useState } from 'react';
import {
  CheckCircle2, Plus, Trash2, Save, RotateCcw, AlertCircle,
  HelpCircle, Code2, ChevronDown, ChevronUp, Layers, Check
} from 'lucide-react';
import { DIRECTIONS } from '../data/directions.js';
import { api } from './api';
import { Notice } from './shared';

const inputStyle = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: '10px',
  border: '1.5px solid var(--exam-line)',
  background: 'white',
  color: 'var(--exam-ink)',
  fontSize: '14px',
  lineHeight: '1.5',
  boxSizing: 'border-box',
  outline: 'none',
  transition: 'border-color 0.15s',
};

const textareaStyle = {
  ...inputStyle,
  resize: 'vertical',
  fontFamily: 'inherit',
};

export default function TaskBankEditor({ onCatalogChanged }) {
  const [tracks, setTracks] = useState([]);
  const [activeTrackId, setActiveTrackId] = useState(DIRECTIONS[0]?.id || 'it-solutions');
  const [currentTasks, setCurrentTasks] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [expandedQ, setExpandedQ] = useState({});
  const [activeTaskIndex, setActiveTaskIndex] = useState(0);

  async function loadCatalog() {
    setLoading(true);
    setError('');
    try {
      const data = await api('/teacher/catalog');
      setTracks(data);
      const track = data.find(t => t.id === activeTrackId) || data[0];
      if (track) {
        setActiveTrackId(track.id);
        setCurrentTasks(structuredClone(track.tasks));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCatalog();
  }, []);

  function switchTrack(trackId) {
    setActiveTrackId(trackId);
    setActiveTaskIndex(0);
    setExpandedQ({});
    const track = tracks.find(t => t.id === trackId);
    if (track) {
      setCurrentTasks(structuredClone(track.tasks));
      setMessage('');
      setError('');
    }
  }

  // Question editing helpers
  function updateQuestionText(qIndex, text) {
    setCurrentTasks(tasks => {
      const copy = structuredClone(tasks);
      if (copy[activeTaskIndex]?.questions?.[qIndex]) {
        copy[activeTaskIndex].questions[qIndex].q = text;
      }
      return copy;
    });
  }

  function updateOptionText(qIndex, optIndex, text) {
    setCurrentTasks(tasks => {
      const copy = structuredClone(tasks);
      if (copy[activeTaskIndex]?.questions?.[qIndex]?.o) {
        copy[activeTaskIndex].questions[qIndex].o[optIndex] = text;
      }
      return copy;
    });
  }

  function setCorrectOption(qIndex, optIndex) {
    setCurrentTasks(tasks => {
      const copy = structuredClone(tasks);
      if (copy[activeTaskIndex]?.questions?.[qIndex]) {
        copy[activeTaskIndex].questions[qIndex].c = optIndex;
      }
      return copy;
    });
  }

  function addQuestion() {
    setCurrentTasks(tasks => {
      const copy = structuredClone(tasks);
      if (!copy[activeTaskIndex]) return copy;
      if (!copy[activeTaskIndex].questions) copy[activeTaskIndex].questions = [];
      copy[activeTaskIndex].questions.push({
        q: 'Новый вопрос для тестирования',
        o: ['Вариант A', 'Вариант B', 'Вариант C', 'Вариант D'],
        c: 0,
      });
      // expand newly added question
      setExpandedQ(prev => ({ ...prev, [copy[activeTaskIndex].questions.length - 1]: true }));
      return copy;
    });
  }

  function removeQuestion(qIndex) {
    setCurrentTasks(tasks => {
      const copy = structuredClone(tasks);
      if (copy[activeTaskIndex]?.questions) {
        copy[activeTaskIndex].questions.splice(qIndex, 1);
      }
      return copy;
    });
  }

  // Practice editing helpers
  function updatePracticeField(field, value) {
    setCurrentTasks(tasks => {
      const copy = structuredClone(tasks);
      const practiceIndex = copy.findIndex(task => task.practice);
      if (practiceIndex < 0) return copy;
      copy[practiceIndex].practice[field] = value;
      return copy;
    });
  }

  function updateRequirements(text) {
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    updatePracticeField('requirements', lines);
  }

  async function save() {
    if (!currentTasks) return;
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const res = await api(`/teacher/catalog/${activeTrackId}`, {
        method: 'PUT',
        body: { tasks: currentTasks }
      });
      setMessage('Задания направления успешно сохранены и обновлены!');
      // update local tracks
      setTracks(prev => prev.map(t => t.id === activeTrackId ? { ...t, tasks: res.track.tasks } : t));
      if (onCatalogChanged) onCatalogChanged();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function resetToDefault() {
    if (!confirm('Вернуть стандартные задания и вопросы для этого направления? Все ваши изменения будут сброшены.')) {
      return;
    }
    setResetting(true);
    setError('');
    setMessage('');
    try {
      const res = await api(`/teacher/catalog/${activeTrackId}/reset`, { method: 'POST' });
      setCurrentTasks(structuredClone(res.track.tasks));
      setActiveTaskIndex(0);
      setTracks(prev => prev.map(t => t.id === activeTrackId ? res.track : t));
      setMessage('Задания направления сброшены к стандартным!');
      if (onCatalogChanged) onCatalogChanged();
    } catch (err) {
      setError(err.message);
    } finally {
      setResetting(false);
    }
  }

  if (loading) {
    return <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--exam-muted)' }}>Загрузка банка заданий…</div>;
  }

  const testTask = currentTasks?.[activeTaskIndex];
  const practiceTask = currentTasks?.find(task => task.practice);
  const questionCount = testTask?.questions?.length || 0;

  return (
    <div style={{ display: 'grid', gap: '24px' }}>

      {/* Top track selector & controls */}
      <div style={{ background: 'white', border: '1px solid var(--exam-line)', borderRadius: '16px', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <label style={{ margin: 0, flexDirection: 'row', alignItems: 'center', gap: '10px', fontSize: '14px', fontWeight: 700 }}>
            <span>Направление:</span>
            <select
              value={activeTrackId}
              onChange={e => switchTrack(e.target.value)}
              style={{ minHeight: '44px', padding: '0 38px 0 14px', fontSize: '14px', borderRadius: '10px', width: 'auto', minWidth: '240px' }}
            >
              {DIRECTIONS.map(d => (
                <option key={d.id} value={d.id}>
                  {d.label}
                </option>
              ))}
            </select>
          </label>

          <span style={{ fontSize: '12px', background: 'var(--exam-soft)', color: 'var(--exam-accent-dark)', padding: '5px 12px', borderRadius: '8px', fontWeight: 700 }}>
            {currentTasks?.filter(task => task.questions).length || 0} тестов · {currentTasks?.reduce((count, task) => count + (task.questions?.length || 0), 0) || 0} вопросов{practiceTask ? ' · практика' : ''}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            className="secondary"
            onClick={resetToDefault}
            disabled={resetting || saving}
            title="Восстановить исходные вопросы"
            style={{ fontSize: '13px' }}
          >
            <RotateCcw size={15} /> Сбросить к исходным
          </button>
          <button
            type="button"
            className="primary"
            onClick={save}
            disabled={saving || resetting}
            style={{ fontSize: '13px' }}
          >
            <Save size={16} /> {saving ? 'Сохраняем…' : 'Сохранить изменения'}
          </button>
        </div>
      </div>

      <Notice>{error}</Notice>
      {message && <Notice kind="info">{message}</Notice>}
      {currentTasks?.length > 1 && <label style={{ maxWidth: '340px' }}>Предмет для редактирования
        <select value={activeTaskIndex} onChange={e => { setActiveTaskIndex(Number(e.target.value)); setExpandedQ({}); }}>
          {currentTasks.map((task, index) => <option key={task.id} value={index}>{task.title}</option>)}
        </select>
      </label>}

      {/* Task 1: Test Questions */}
      {testTask && (
        <section style={{ background: 'white', border: '1px solid var(--exam-line)', borderRadius: '16px', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px', paddingBottom: '14px', borderBottom: '1px solid var(--exam-line)' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'var(--exam-soft)', color: 'var(--exam-accent-dark)', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: '13px' }}>
                  01
                </span>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 750 }}>
                  {testTask.title || 'Задание 1 — Тестирование'}
                </h3>
              </div>
              <p style={{ margin: '4px 0 0 38px', fontSize: '13px', color: 'var(--exam-muted)' }}>
                {questionCount} вопросов с выбором варианта ответа. Студент выбирает 1 верный ответ.
              </p>
            </div>

            <button
              type="button"
              className="secondary"
              onClick={addQuestion}
              style={{ fontSize: '13px', padding: '8px 14px' }}
            >
              <Plus size={15} /> Добавить вопрос
            </button>
          </div>

          {/* Questions list */}
          <div style={{ display: 'grid', gap: '14px' }}>
            {testTask.questions?.map((q, qIdx) => {
              const isExpanded = expandedQ[qIdx] !== false; // default open
              return (
                <div
                  key={qIdx}
                  style={{
                    border: '1px solid var(--exam-line)',
                    borderRadius: '12px',
                    padding: '16px 18px',
                    background: '#fbfcfd',
                  }}
                >
                  {/* Question header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
                    <div
                      onClick={() => setExpandedQ(prev => ({ ...prev, [qIdx]: !isExpanded }))}
                      style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', flex: 1, minWidth: 0 }}
                    >
                      <strong style={{ fontSize: '14px', color: 'var(--exam-accent-dark)', flexShrink: 0 }}>
                        #{qIdx + 1}
                      </strong>
                      <span style={{ fontSize: '13px', fontWeight: 650, color: 'var(--exam-ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {q.q || '(Текст вопроса не введен)'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--exam-green)', background: 'var(--exam-green-bg)', padding: '3px 8px', borderRadius: '6px', fontWeight: 700 }}>
                        Верный ответ: {['A', 'B', 'C', 'D'][q.c] || `№${q.c + 1}`}
                      </span>

                      <button
                        type="button"
                        onClick={() => setExpandedQ(prev => ({ ...prev, [qIdx]: !isExpanded }))}
                        style={{ background: 'none', border: 'none', padding: '4px', color: 'var(--exam-muted)', cursor: 'pointer' }}
                        title={isExpanded ? 'Свернуть' : 'Развернуть'}
                      >
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>

                      {questionCount > 1 && (
                        <button
                          type="button"
                          onClick={() => removeQuestion(qIdx)}
                          style={{ background: 'none', border: 'none', padding: '4px', color: '#ef4444', cursor: 'pointer' }}
                          title="Удалить этот вопрос"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Question details (expanded) */}
                  {isExpanded && (
                    <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid #edf2f7', display: 'grid', gap: '12px' }}>
                      <label style={{ margin: 0 }}>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--exam-muted)', marginBottom: '4px', display: 'block' }}>
                          Формулировка вопроса:
                        </span>
                        <input
                          type="text"
                          value={q.q}
                          onChange={e => updateQuestionText(qIdx, e.target.value)}
                          placeholder="Введите текст вопроса..."
                          style={inputStyle}
                        />
                      </label>

                      <div>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--exam-muted)', marginBottom: '6px', display: 'block' }}>
                          Варианты ответов (отметьте правильный кружком слева):
                        </span>

                        <div style={{ display: 'grid', gap: '8px' }}>
                          {q.o?.map((opt, oIdx) => {
                            const isCorrect = q.c === oIdx;
                            return (
                              <div
                                key={oIdx}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '10px',
                                  background: isCorrect ? '#f0fdf4' : 'white',
                                  border: `1.5px solid ${isCorrect ? 'var(--exam-green)' : 'var(--exam-line)'}`,
                                  borderRadius: '10px',
                                  padding: '6px 12px',
                                }}
                              >
                                <label style={{ margin: 0, display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                                  <input
                                    type="radio"
                                    name={`correct_${qIdx}`}
                                    checked={isCorrect}
                                    onChange={() => setCorrectOption(qIdx, oIdx)}
                                    style={{ margin: 0, cursor: 'pointer' }}
                                  />
                                </label>

                                <span style={{ fontSize: '12px', fontWeight: 700, color: isCorrect ? 'var(--exam-green)' : 'var(--exam-muted)', width: '20px' }}>
                                  {['A', 'B', 'C', 'D'][oIdx] || oIdx + 1}.
                                </span>

                                <input
                                  type="text"
                                  value={opt}
                                  onChange={e => updateOptionText(qIdx, oIdx, e.target.value)}
                                  placeholder={`Вариант ${['A', 'B', 'C', 'D'][oIdx]}`}
                                  style={{
                                    border: 'none',
                                    outline: 'none',
                                    width: '100%',
                                    fontSize: '13px',
                                    background: 'transparent',
                                    color: 'var(--exam-ink)',
                                    padding: '4px 0',
                                  }}
                                />

                                {isCorrect && (
                                  <span style={{ fontSize: '11px', color: 'var(--exam-green)', fontWeight: 700, whiteSpace: 'nowrap' }}>
                                    Верный ответ
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Task 2: Practical Task */}
      {practiceTask && (
        <section style={{ background: 'white', border: '1px solid var(--exam-line)', borderRadius: '16px', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px', paddingBottom: '14px', borderBottom: '1px solid var(--exam-line)' }}>
            <span style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'var(--exam-soft)', color: 'var(--exam-accent-dark)', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: '13px' }}>
              02
            </span>
            <div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 750 }}>
                {practiceTask.title || 'Задание 2 — Практическое задание'}
              </h3>
              <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--exam-muted)' }}>
                Практическое испытание. Выполняется студентом во встроенном редакторе платформы.
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gap: '16px' }}>
            <label style={{ margin: 0 }}>
              <span style={{ fontSize: '13px', fontWeight: 650, color: 'var(--exam-ink)', marginBottom: '6px', display: 'block' }}>
                Название практической задачи:
              </span>
              <input
                type="text"
                value={practiceTask.practice?.title || ''}
                onChange={e => updatePracticeField('title', e.target.value)}
                placeholder="Например: Разработка модуля обработки транзакций"
                style={inputStyle}
              />
            </label>

            <label style={{ margin: 0 }}>
              <span style={{ fontSize: '13px', fontWeight: 650, color: 'var(--exam-ink)', marginBottom: '6px', display: 'block' }}>
                ТЗ / Описание задания (Бриф):
              </span>
              <textarea
                value={practiceTask.practice?.brief || ''}
                onChange={e => updatePracticeField('brief', e.target.value)}
                placeholder="Подробно опишите задачу, которую должен решить кандидат..."
                rows={4}
                style={textareaStyle}
              />
            </label>

            <label style={{ margin: 0 }}>
              <span style={{ fontSize: '13px', fontWeight: 650, color: 'var(--exam-ink)', marginBottom: '6px', display: 'block' }}>
                Требования к выполнению (каждое требование с новой строки):
              </span>
              <textarea
                value={(practiceTask.practice?.requirements || []).join('\n')}
                onChange={e => updateRequirements(e.target.value)}
                placeholder="Требование 1&#10;Требование 2&#10;Требование 3"
                rows={4}
                style={textareaStyle}
              />
            </label>
          </div>

          <div style={{ marginTop: '24px', paddingTop: '18px', borderTop: '1px solid var(--exam-line)', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              type="button"
              className="primary"
              onClick={save}
              disabled={saving || resetting}
              style={{ fontSize: '14px', minHeight: '46px', padding: '0 24px' }}
            >
              <Save size={16} /> {saving ? 'Сохраняем…' : 'Сохранить все изменения в банке заданий'}
            </button>
          </div>
        </section>
      )}

    </div>
  );
}
