import React, { useState } from "react";
import {
  GraduationCap, LogOut, RefreshCw, BarChart3, Users, ClipboardList,
  Settings, Search, X, CheckCircle2, ChevronRight, Award, UserCheck
} from "lucide-react";
import { TRACKS } from "../data/tracks.js";
import { QUESTION_BANKS } from "../data/questions.js";
import { LevelBadge } from "./ui.jsx";
import { ProfitLogo } from "./BrandElements.jsx";
import { TeacherIllustration } from "./Illustrations.jsx";

function StatCard({ label, value, sub, icon: Icon, color = "#FF8A00" }) {
  return (
    <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">{label}</div>
        {Icon && (
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}15`, color }}>
            <Icon size={16} />
          </div>
        )}
      </div>
      <div className="text-3xl font-extrabold text-slate-900 font-heading">{value}</div>
      {sub && <div className="text-xs text-slate-500 mt-1">{sub}</div>}
    </div>
  );
}

function OverviewTab({ students }) {
  const completedCount = students.filter((s) => Object.keys(s.results || {}).length > 0).length;
  const totalTests = students.reduce((sum, s) => sum + Object.keys(s.results || {}).length, 0);

  return (
    <div>
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <StatCard label="Зарегистрировано" value={students.length} icon={Users} color="#FF8A00" sub="Кандидатов в группу" />
        <StatCard label="Сдали тесты" value={completedCount} icon={UserCheck} color="#22C55E" sub="Хотя бы 1 направление" />
        <StatCard label="Сдано тестов" value={totalTests} icon={Award} color="#3B82F6" sub="Всего попыток" />
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
        <h3 className="text-xl font-extrabold text-slate-900 font-heading mb-1">
          Распределение результатов по трекам
        </h3>
        <p className="text-xs text-slate-400 mb-6">
          Анализ уровней подготовки учащихся спецгруппы
        </p>

        <div className="space-y-6">
          {TRACKS.map((t) => {
            const results = students.map((s) => s.results && s.results[t.id]).filter(Boolean);
            const levels = t.id === "english" ? ["A1", "A2", "B1", "B2", "C1", "C2"] : ["Начальный", "Средний", "Продвинутый"];
            return (
              <div key={t.id} className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/60">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <t.icon size={18} style={{ color: t.accent }} />
                    <span className="text-sm font-bold text-slate-900 font-heading">{t.label}</span>
                  </div>
                  <span className="text-xs font-semibold text-slate-500 font-mono">
                    {results.length} сдали тест
                  </span>
                </div>

                <div className="flex gap-1.5 h-6 rounded-xl overflow-hidden bg-slate-200 p-0.5">
                  {levels.map((lv) => {
                    const count = results.filter((r) => r.level === lv).length;
                    const pct = results.length ? (count / results.length) * 100 : 0;
                    return (
                      <div
                        key={lv}
                        title={`${lv}: ${count} (${Math.round(pct)}%)`}
                        className="h-full rounded-lg transition-all flex items-center justify-center text-[10px] font-bold text-white font-mono"
                        style={{
                          width: `${Math.max(pct, count ? 8 : 0)}%`,
                          background: count ? t.accent : "transparent",
                          opacity: count ? 1 : 0.2,
                        }}
                      >
                        {count > 0 ? `${lv}` : ""}
                      </div>
                    );
                  })}
                  {results.length === 0 && (
                    <div className="w-full flex items-center justify-center text-[10px] text-slate-400 font-medium">
                      Нет данных
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StudentsTab({ students, onOpen }) {
  const [query, setQuery] = useState("");
  const filtered = students.filter((s) => (s.name + s.email + (s.grade || "")).toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
      <div className="flex items-center gap-2 mb-6 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl max-w-sm">
        <Search size={16} className="text-slate-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Поиск по имени, email или группе..."
          className="w-full bg-transparent outline-none text-xs font-medium"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-slate-400 text-xs">
          Ученики не найдены
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
                <th className="pb-3 font-semibold">Имя</th>
                <th className="pb-3 font-semibold">Email</th>
                <th className="pb-3 font-semibold">Группа</th>
                <th className="pb-3 font-semibold">Прогресс</th>
                <th className="pb-3 text-right">Действие</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 font-bold text-slate-900 font-heading">{s.name}</td>
                  <td className="py-3.5 text-slate-600 text-xs">{s.email}</td>
                  <td className="py-3.5 text-slate-600 text-xs">{s.grade || "—"}</td>
                  <td className="py-3.5">
                    <div className="flex gap-1.5">
                      {TRACKS.map((t) => {
                        const r = s.results && s.results[t.id];
                        return (
                          <span
                            key={t.id}
                            title={`${t.label}: ${r ? r.level : 'не сдан'}`}
                            className="w-3 h-3 rounded-full transition-transform hover:scale-125"
                            style={{
                              backgroundColor: r ? t.accent : "#E2E8F0",
                            }}
                          />
                        );
                      })}
                    </div>
                  </td>
                  <td className="py-3.5 text-right">
                    <button
                      onClick={() => onOpen(s)}
                      className="px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-[#FF8A00] font-bold text-xs transition-colors"
                    >
                      Подробнее
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

import PracticeReviewModal from "./PracticeReviewModal.jsx";
import EnglishReviewModal from "./EnglishReviewModal.jsx";
import { ALL_TRACK_TASKS } from "../data/track_tasks.js";

function StudentModal({ student, onClose, onOpenReview }) {
  if (!student) return null;
  const techTrackIds = ["htmlcss", "js", "python", "csharp"];

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs z-50 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl p-6 sm:p-8 bg-white rounded-3xl border border-slate-100 shadow-2xl max-h-[88vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="text-2xl font-extrabold text-slate-900 font-heading">{student.name}</h3>
            <div className="text-xs text-slate-500 mt-0.5">
              {student.email} {student.grade ? ` · Группа: ${student.grade}` : ""}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-sm font-bold"
          >
            ✕
          </button>
        </div>

        <div className="border-t border-slate-100 my-4" />

        {/* 4 Tech Tracks with 3 Levels Each */}
        <div className="space-y-6">
          {techTrackIds.map((tid) => {
            const trackCfg = ALL_TRACK_TASKS[tid];
            const trackData = student.results?.[`${tid}_multi`]?.levels || {};
            const practice = trackData.level3?.practice;
            const isSubmitted = practice?.submitted;
            const isGraded = practice?.reviewStatus === "graded";

            return (
              <div key={tid} className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold text-slate-900 font-heading flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FF8A00]" />
                    {trackCfg.trackLabel} (3 Уровня)
                  </h4>
                  <span className="text-[11px] font-bold text-slate-500 font-mono">
                    2 Теста + Практика
                  </span>
                </div>

                <div className="grid sm:grid-cols-3 gap-2 text-xs">
                  {/* Level 1 */}
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200/60">
                    <div className="text-slate-400 font-mono text-[10px] uppercase">Ур. 1: Тест база</div>
                    <div className="font-bold text-slate-800 mt-0.5">
                      {trackData.level1 ? (
                        <span className="text-emerald-600 font-mono">{trackData.level1.correct}/10 ({trackData.level1.pct}%)</span>
                      ) : (
                        <span className="text-slate-400 font-mono">Не сдан</span>
                      )}
                    </div>
                  </div>

                  {/* Level 2 */}
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200/60">
                    <div className="text-slate-400 font-mono text-[10px] uppercase">Ур. 2: Тест про</div>
                    <div className="font-bold text-slate-800 mt-0.5">
                      {trackData.level2 ? (
                        <span className="text-emerald-600 font-mono">{trackData.level2.correct}/10 ({trackData.level2.pct}%)</span>
                      ) : (
                        <span className="text-slate-400 font-mono">Не сдан</span>
                      )}
                    </div>
                  </div>

                  {/* Level 3: Practice */}
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200/60 flex flex-col justify-between">
                    <div>
                      <div className="text-slate-400 font-mono text-[10px] uppercase">Ур. 3: Практика</div>
                      <div className="font-bold text-slate-800 mt-0.5">
                        {isSubmitted ? (
                          isGraded ? (
                            <span className="text-emerald-600 font-mono">{practice.totalScore}/15 баллов</span>
                          ) : (
                            <span className="text-[#FF8A00] font-mono">На проверке</span>
                          )
                        ) : (
                          <span className="text-slate-400 font-mono">Не сдана</span>
                        )}
                      </div>
                    </div>

                    {isSubmitted && (
                      <button
                        onClick={() => onOpenReview(student, tid)}
                        className={`mt-2 py-1 px-2 rounded-lg font-bold text-[11px] transition-colors w-full ${
                          isGraded
                            ? "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
                            : "bg-[#FF8A00] hover:bg-[#E67A00] text-white shadow-2xs"
                        }`}
                      >
                        {isGraded ? "Изменить оценку" : "Оценить код"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="border-t border-slate-100 my-4" />

        {/* English Track (3 Levels) */}
        {(() => {
          const engData = student.results?.english_multi?.levels || {};
          const speaking = engData.level3?.speaking;
          const isSubmitted = speaking?.submittedAt;
          const isGraded = speaking?.reviewStatus === "graded";

          return (
            <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold text-slate-900 font-heading flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  Английский язык CEFR (3 Уровня)
                </h4>
                <span className="text-[11px] font-bold text-slate-500 font-mono">
                  Тест + Чтение + Аудио
                </span>
              </div>

              <div className="grid sm:grid-cols-3 gap-2 text-xs">
                {/* Level 1: Grammar */}
                <div className="p-2.5 bg-white rounded-xl border border-slate-200/60">
                  <div className="text-slate-400 font-mono text-[10px] uppercase">Ур. 1: Грамматика</div>
                  <div className="font-bold text-slate-800 mt-0.5">
                    {engData.level1 ? (
                      <span className="text-emerald-600 font-mono">{engData.level1.correct}/10 ({engData.level1.pct}%)</span>
                    ) : (
                      <span className="text-slate-400 font-mono">Не сдан</span>
                    )}
                  </div>
                </div>

                {/* Level 2: Reading */}
                <div className="p-2.5 bg-white rounded-xl border border-slate-200/60">
                  <div className="text-slate-400 font-mono text-[10px] uppercase">Ур. 2: Чтение IT</div>
                  <div className="font-bold text-slate-800 mt-0.5">
                    {engData.level2 ? (
                      <span className="text-emerald-600 font-mono">{engData.level2.correct}/5 ({engData.level2.pct}%)</span>
                    ) : (
                      <span className="text-slate-400 font-mono">Не сдан</span>
                    )}
                  </div>
                </div>

                {/* Level 3: Speaking & Listening */}
                <div className="p-2.5 bg-white rounded-xl border border-slate-200/60 flex flex-col justify-between">
                  <div>
                    <div className="text-slate-400 font-mono text-[10px] uppercase">Ур. 3: Говорение</div>
                    <div className="font-bold text-slate-800 mt-0.5">
                      {isSubmitted ? (
                        isGraded ? (
                          <span className="text-emerald-600 font-mono">{speaking.cefrGrade || "B2"} ({speaking.totalScore}/15)</span>
                        ) : (
                          <span className="text-[#FF8A00] font-mono">Есть аудио</span>
                        )
                      ) : (
                        <span className="text-slate-400 font-mono">Не сдано</span>
                      )}
                    </div>
                  </div>

                  {isSubmitted && (
                    <button
                      onClick={() => onOpenReview(student, "english")}
                      className={`mt-2 py-1 px-2 rounded-lg font-bold text-[11px] transition-colors w-full ${
                        isGraded
                          ? "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
                          : "bg-red-500 hover:bg-red-600 text-white shadow-2xs"
                      }`}
                    >
                      {isGraded ? "Изменить CEFR" : "Прослушать речь"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}

function TracksTab() {
  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
      {TRACKS.map((t) => (
        <div key={t.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center">
              <t.icon size={20} style={{ color: t.accent }} />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900 font-heading">{t.label}</div>
              <div className="text-xs text-slate-500">
                {t.id === "htmlcss"
                  ? "3 Уровня (Начальный, Средний, Продвинутый) · Тест + Практический редактор"
                  : `${QUESTION_BANKS[t.id].length} вопросов в банке тестов`}
              </div>
            </div>
          </div>
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-xl font-mono border border-emerald-200">
            Активен
          </span>
        </div>
      ))}
    </div>
  );
}

function SettingsTab({ onReset }) {
  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs max-w-xl">
      <h3 className="text-xl font-extrabold text-slate-900 font-heading mb-2">Настройки системы</h3>
      <p className="text-xs text-slate-500 leading-relaxed mb-6">
        Данные учащихся сохраняются в хранилище приложения. При необходимости вы можете очистить все тестовые данные.
      </p>

      <button
        onClick={onReset}
        className="px-5 py-3 rounded-2xl border-2 border-red-200 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold transition-all flex items-center gap-2"
      >
        <RefreshCw size={14} /> Очистить все результаты учеников
      </button>
    </div>
  );
}

export default function AdminDashboard({ teacherName, students, onLogout, onRefresh, onReset, onGradePractice }) {
  const [tab, setTab] = useState("overview");
  const [openStudent, setOpenStudent] = useState(null);
  const [reviewState, setReviewState] = useState(null); // { student, levelId }

  const tabs = [
    { id: "overview", label: "Обзор", icon: BarChart3 },
    { id: "students", label: "Ученики", icon: Users },
    { id: "tracks", label: "Направления", icon: ClipboardList },
    { id: "settings", label: "Настройки", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-slate-800 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 text-white p-6 shrink-0 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 mb-6">
            <ProfitLogo className="w-10 h-10" />
            <div>
              <div className="text-lg font-extrabold font-heading">ProfIT</div>
              <div className="text-xs text-slate-400">Кабинет куратора</div>
            </div>
          </div>

          <nav className="space-y-1.5">
            {tabs.map((tb) => {
              const active = tab === tb.id;
              return (
                <button
                  key={tb.id}
                  onClick={() => setTab(tb.id)}
                  className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                    active
                      ? "bg-[#FF8A00] text-white shadow-md shadow-orange-600/20"
                      : "text-slate-400 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  <tb.icon size={16} />
                  <span>{tb.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="pt-6 border-t border-slate-800 mt-8">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white py-2 transition-colors"
          >
            <LogOut size={15} /> Выйти из панели
          </button>
        </div>
      </aside>

      {/* Main Panel Content */}
      <main className="flex-1 p-6 sm:p-10 max-w-5xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
              {tabs.find((t) => t.id === tab).label}
            </h1>
          </div>
          <button
            onClick={onRefresh}
            className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-slate-600 shadow-xs transition-all"
          >
            <RefreshCw size={13} /> Обновить
          </button>
        </div>

        {tab === "overview" && <OverviewTab students={students} />}
        {tab === "students" && <StudentsTab students={students} onOpen={setOpenStudent} />}
        {tab === "tracks" && <TracksTab />}
        {tab === "settings" && <SettingsTab onReset={onReset} />}
      </main>

      <StudentModal
        student={openStudent}
        onClose={() => setOpenStudent(null)}
        onOpenReview={(stud, trkId) => {
          setOpenStudent(null);
          setReviewState({ student: stud, trackId: trkId });
        }}
      />

      {reviewState && (
        reviewState.trackId === "english" ? (
          <EnglishReviewModal
            student={reviewState.student}
            onClose={() => setReviewState(null)}
            onSaveGrade={onGradePractice}
          />
        ) : (
          <PracticeReviewModal
            student={reviewState.student}
            trackId={reviewState.trackId}
            onClose={() => setReviewState(null)}
            onSaveGrade={onGradePractice}
          />
        )
      )}
    </div>
  );
}
