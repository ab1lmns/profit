import React, { useState } from "react";
import { X, CheckCircle, ExternalLink, Code2, Eye, Award, MessageSquare } from "lucide-react";
import { ALL_TRACK_TASKS } from "../data/track_tasks.js";

export default function PracticeReviewModal({ student, trackId = "htmlcss", onClose, onSaveGrade }) {
  const trackConfig = ALL_TRACK_TASKS[trackId] || ALL_TRACK_TASKS.htmlcss;
  const levelInfo = trackConfig.levels[2];
  const levelData = (student.results && student.results[`${trackId}_multi`]?.levels?.["level3"]) || {};
  const practiceData = levelData.practice || {};
  const isWeb = trackConfig.language === "html";

  const [activeTab, setActiveTab] = useState(isWeb ? "preview" : "code");
  const [scores, setScores] = useState(
    practiceData.scores || {
      [levelInfo.practice.rubric[0].id]: 5,
      [levelInfo.practice.rubric[1].id]: 5,
      [levelInfo.practice.rubric[2].id]: 4,
    }
  );
  const [feedback, setFeedback] = useState(practiceData.feedback || "");

  const totalScore = Object.values(scores).reduce((a, b) => Number(a) + Number(b), 0);

  const handleScoreChange = (rubricId, val) => {
    setScores((prev) => ({ ...prev, [rubricId]: Number(val) }));
  };

  const handleSave = () => {
    onSaveGrade(student.id, trackId, "level3", {
      reviewStatus: "graded",
      scores,
      totalScore,
      feedback,
      gradedAt: new Date().toISOString()
    });
    onClose();
  };

  const liveDoc = isWeb ? `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          ${practiceData.css || ""}
        </style>
      </head>
      <body>
        ${practiceData.html || "<p>Код не отправлен</p>"}
      </body>
    </html>
  ` : "";

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-5xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[92vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono">
                {trackConfig.trackLabel} · {levelInfo.levelName}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Студент: <strong className="text-slate-800">{student.name}</strong> ({student.grade || "Без группы"})
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 font-heading">
              Проверка практики: {levelInfo.practice.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-sm font-bold"
          >
            ✕
          </button>
        </div>

        {/* Body content */}
        <div className="grid lg:grid-cols-12 gap-6 my-4 flex-1 overflow-y-auto pr-1">
          {/* Left Column: Solution Preview (7 cols) */}
          <div className="lg:col-span-7 flex flex-col h-[480px]">
            <div className="flex items-center justify-between mb-2">
              <div className="flex gap-2">
                {isWeb && (
                  <button
                    onClick={() => setActiveTab("preview")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                      activeTab === "preview"
                        ? "bg-[#FF8A00] text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    <Eye size={13} /> Live Превью
                  </button>
                )}
                <button
                  onClick={() => setActiveTab("code")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                    activeTab === "code"
                      ? "bg-[#FF8A00] text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  <Code2 size={13} /> Исходный код решения
                </button>
              </div>

              {practiceData.externalLink && (
                <a
                  href={practiceData.externalLink}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-bold text-[#FF8A00] hover:underline flex items-center gap-1"
                >
                  Внешняя ссылка <ExternalLink size={12} />
                </a>
              )}
            </div>

            <div className="flex-1 rounded-2xl overflow-hidden border-2 border-slate-200 bg-[#FAF9F6]">
              {isWeb && activeTab === "preview" ? (
                <iframe
                  title="Student Solution"
                  srcDoc={liveDoc}
                  className="w-full h-full border-0"
                  sandbox="allow-scripts"
                />
              ) : (
                <div className="h-full bg-slate-900 text-slate-200 font-mono text-xs overflow-y-auto p-4">
                  {isWeb ? (
                    <div className="space-y-4">
                      <div>
                        <div className="text-amber-400 font-bold mb-1 pb-1 border-b border-slate-800">HTML:</div>
                        <pre className="whitespace-pre-wrap">{practiceData.html || "—"}</pre>
                      </div>
                      <div>
                        <div className="text-emerald-400 font-bold mb-1 pb-1 border-b border-slate-800">CSS:</div>
                        <pre className="whitespace-pre-wrap">{practiceData.css || "—"}</pre>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="text-emerald-400 font-bold mb-2 pb-1 border-b border-slate-800">
                        Код ({trackConfig.trackLabel}):
                      </div>
                      <pre className="whitespace-pre-wrap leading-relaxed">{practiceData.code || "—"}</pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Rubric Grading & Feedback (5 cols) */}
          <div className="lg:col-span-5 bg-slate-50 p-5 rounded-2xl border border-slate-200/80 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
                  Чек-лист оценки куратора
                </span>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                  Итого: {totalScore} / 15 баллов
                </span>
              </div>

              {/* Rubric items */}
              {levelInfo.practice.rubric.map((item) => (
                <div key={item.id} className="bg-white p-3.5 rounded-xl border border-slate-200/80">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-800 font-heading">{item.label}</span>
                    <span className="text-xs font-extrabold text-[#FF8A00] font-mono">
                      {scores[item.id] || 0} / {item.maxScore}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={item.maxScore}
                    value={scores[item.id] || 0}
                    onChange={(e) => handleScoreChange(item.id, e.target.value)}
                    className="w-full accent-[#FF8A00] cursor-pointer"
                  />
                </div>
              ))}

              {/* Feedback text */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center gap-1">
                  <MessageSquare size={13} className="text-[#FF8A00]" />
                  Комментарий и рекомендации ученику:
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Отличная логика решения! Обрати внимание на обработку граничных условий..."
                  className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs outline-none focus:border-[#FF8A00] h-20 resize-none"
                />
              </div>
            </div>

            {/* Save Grade Button */}
            <button
              onClick={handleSave}
              className="w-full py-3 px-4 rounded-xl font-bold text-white text-xs bg-[#22C55E] hover:bg-[#16A34A] transition-all flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 mt-4"
            >
              <CheckCircle size={15} />
              <span>Сохранить оценку</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
