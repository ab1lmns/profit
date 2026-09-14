import React from "react";
import { ChevronRight, LogOut, Award, CheckCircle, Sparkles } from "lucide-react";
import { TRACKS } from "../data/tracks.js";
import { LevelBadge } from "./ui.jsx";
import { ProfitLogo, FloatingDecorations } from "./BrandElements.jsx";
import { StudentIllustration } from "./Illustrations.jsx";

export default function StudentDashboard({ student, onStartTrack, onLogout }) {
  const completedCount = Object.keys(student.results || {}).length;

  return (
    <div className="relative min-h-screen bg-[#FAF9F6] text-slate-800 font-sans selection:bg-orange-100 selection:text-orange-900 overflow-x-hidden pb-16">
      <FloatingDecorations />

      {/* Header */}
      <header className="relative z-10 max-w-5xl mx-auto px-6 pt-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ProfitLogo className="w-10 h-10" />
          <div>
            <div className="text-xl font-extrabold text-slate-900 font-heading">
              Prof<span className="text-[#FF8A00]">IT</span>
            </div>
            <div className="text-xs text-slate-400 font-medium">Личный кабинет ученика</div>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl bg-white/80 hover:bg-white text-slate-600 border border-slate-200 shadow-xs transition-all"
        >
          <LogOut size={14} /> Выйти
        </button>
      </header>

      {/* Profile Card & Stats */}
      <main className="relative z-10 max-w-5xl mx-auto px-6 pt-8">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-orange-300/40 shadow-xl shadow-orange-500/5 mb-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-orange-50 border border-orange-200/80 flex items-center justify-center shrink-0">
              <StudentIllustration className="w-14 h-14" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold uppercase tracking-wide font-mono mb-1">
                Кандидат в спецгруппу
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
                {student.name}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                {student.email} {student.grade ? ` · Группа: ${student.grade}` : ""}
              </p>
            </div>
          </div>

          <div className="bg-[#FAF9F6] border border-slate-200 rounded-2xl px-5 py-3 text-center sm:text-right shrink-0">
            <div className="text-xs text-slate-400 font-bold uppercase font-mono">Пройдено тестов</div>
            <div className="text-2xl font-extrabold text-[#FF8A00] font-heading">
              {completedCount} <span className="text-slate-400 text-sm font-normal">/ {TRACKS.length}</span>
            </div>
          </div>
        </div>

        {/* Tracks List */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 font-heading">
                Тестирование по направлениям
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Вы можете проходить тесты в любом порядке и улучшать результаты
              </p>
            </div>
          </div>

          <div className="grid gap-3.5">
            {TRACKS.map((t) => {
              const isMultiTrack = ["htmlcss", "js", "python", "csharp", "english"].includes(t.id);
              const multiData = student.results && student.results[`${t.id}_multi`];
              const completedLevelsCount = multiData?.levels ? Object.keys(multiData.levels).length : 0;
              const res = student.results && student.results[t.id];

              return (
                <div
                  key={t.id}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    (isMultiTrack && completedLevelsCount > 0) || (!isMultiTrack && res)
                      ? "bg-emerald-50/40 border-emerald-200/80"
                      : "bg-[#FAF9F6] border-slate-200/80 hover:border-orange-300"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-center shrink-0">
                      <t.icon size={22} style={{ color: t.accent }} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 font-heading text-base">
                          {t.label}
                        </span>
                        {t.id === "english" ? (
                          <span className="text-[11px] font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                            3 Уровня (Тест + Чтение + Аудио)
                          </span>
                        ) : isMultiTrack ? (
                          <span className="text-[11px] font-bold text-[#FF8A00] bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full">
                            3 Уровня (2 Теста + Практика)
                          </span>
                        ) : null}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {isMultiTrack ? (
                          completedLevelsCount > 0 ? (
                            <span>
                              Пройдено уровней: <strong className="text-slate-800">{completedLevelsCount} из 3</strong>
                            </span>
                          ) : t.id === "english" ? (
                            <span>Ур. 1 (Грамматика) · Ур. 2 (Чтение IT) · Ур. 3 (Аудио & Говорение)</span>
                          ) : (
                            <span>Уровень 1 (Тест) · Уровень 2 (Тест) · Уровень 3 (Практика)</span>
                          )
                        ) : res ? (
                          <span>
                            Результат: <strong className="text-slate-800">{res.correctCount}/{res.total} верно ({res.pct}%)</strong> · {new Date(res.completedAt).toLocaleDateString("ru-RU")}
                          </span>
                        ) : (
                          <span>Ожидает прохождения</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <button
                      onClick={() => onStartTrack(t.id)}
                      className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 ${
                        (isMultiTrack && completedLevelsCount > 0) || (!isMultiTrack && res)
                          ? "bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 shadow-2xs"
                          : "bg-[#22C55E] hover:bg-[#16A34A] text-white shadow-xs"
                      }`}
                    >
                      {completedLevelsCount > 0 ? "Продолжить" : "Открыть задания"} <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
