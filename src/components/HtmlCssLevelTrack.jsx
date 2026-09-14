import React, { useState, useEffect } from "react";
import {
  ArrowLeft, CheckCircle2, Circle, Code2, Eye, Sparkles,
  Send, Award, CheckCircle, ExternalLink, HelpCircle, Layers, ArrowRight
} from "lucide-react";
import { HTMLCSS_LEVELS } from "../data/htmlcss_tasks.js";
import { FloatingDecorations } from "./BrandElements.jsx";

export default function HtmlCssLevelTrack({ student, onSaveResult, onBack }) {
  const [selectedLevelId, setSelectedLevelId] = useState("level1");
  const [stage, setStage] = useState("menu"); // 'menu' | 'test' | 'practice' | 'summary'

  const currentLevel = HTMLCSS_LEVELS.find((l) => l.levelId === selectedLevelId) || HTMLCSS_LEVELS[0];

  const existingTrackData = (student.results && student.results.htmlcss_multi) || {
    levels: {}
  };

  // Test state (for level 1 and level 2)
  const [qi, setQi] = useState(0);
  const [testAnswers, setTestAnswers] = useState({});
  const [testPicked, setTestPicked] = useState(null);

  // Practice state (for level 3)
  const [codeMode, setCodeMode] = useState("editor");
  const [htmlCode, setHtmlCode] = useState(HTMLCSS_LEVELS[2].practice.defaultHtml);
  const [cssCode, setCssCode] = useState(HTMLCSS_LEVELS[2].practice.defaultCss);
  const [externalLink, setExternalLink] = useState("");
  const [liveSrcDoc, setLiveSrcDoc] = useState("");
  const [activeTab, setActiveTab] = useState("html");

  useEffect(() => {
    const existing = existingTrackData.levels["level3"];
    if (existing && existing.practice) {
      setHtmlCode(existing.practice.html || HTMLCSS_LEVELS[2].practice.defaultHtml);
      setCssCode(existing.practice.css || HTMLCSS_LEVELS[2].practice.defaultCss);
      setExternalLink(existing.practice.externalLink || "");
    }
  }, []);

  // Update live preview for level 3
  useEffect(() => {
    const combined = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            ${cssCode}
          </style>
        </head>
        <body>
          ${htmlCode}
        </body>
      </html>
    `;
    setLiveSrcDoc(combined);
  }, [htmlCode, cssCode]);

  // Start Level Action
  const handleStartLevel = (lvlId) => {
    setSelectedLevelId(lvlId);
    const target = HTMLCSS_LEVELS.find((l) => l.levelId === lvlId);
    if (target.type === "test") {
      setQi(0);
      setTestAnswers({});
      setTestPicked(null);
      setStage("test");
    } else {
      setStage("practice");
    }
  };

  // Next question in Test
  const handleNextTestQuestion = () => {
    if (testPicked === null) return;
    const updated = { ...testAnswers, [qi]: testPicked };
    setTestAnswers(updated);

    if (qi === currentLevel.questions.length - 1) {
      let correct = 0;
      currentLevel.questions.forEach((q, i) => {
        if (updated[i] === q.c) correct++;
      });
      const pct = Math.round((correct / currentLevel.questions.length) * 100);

      const newLevels = {
        ...existingTrackData.levels,
        [selectedLevelId]: {
          correct,
          total: currentLevel.questions.length,
          pct,
          completedAt: new Date().toISOString()
        }
      };

      onSaveResult({
        ...existingTrackData,
        levels: newLevels,
        completedAt: new Date().toISOString()
      });

      setStage("summary");
    } else {
      setQi(qi + 1);
      setTestPicked(null);
    }
  };

  // Submit Practice (Level 3)
  const handleSubmitPractice = () => {
    const newLevels = {
      ...existingTrackData.levels,
      level3: {
        practice: {
          submitted: true,
          mode: codeMode,
          html: htmlCode,
          css: cssCode,
          externalLink: externalLink,
          submittedAt: new Date().toISOString(),
          reviewStatus: existingTrackData.levels?.level3?.practice?.reviewStatus || "pending",
          scores: existingTrackData.levels?.level3?.practice?.scores || {},
          totalScore: existingTrackData.levels?.level3?.practice?.totalScore || 0,
          feedback: existingTrackData.levels?.level3?.practice?.feedback || ""
        },
        completedAt: new Date().toISOString()
      }
    };

    onSaveResult({
      ...existingTrackData,
      levels: newLevels,
      completedAt: new Date().toISOString()
    });

    setStage("summary");
  };

  return (
    <div className="relative min-h-screen bg-[#FAF9F6] text-slate-800 font-sans selection:bg-orange-100 selection:text-orange-900 overflow-x-hidden pb-16">
      <FloatingDecorations />

      {/* Header */}
      <header className="relative z-10 max-w-6xl mx-auto px-6 pt-6 flex items-center justify-between">
        <button
          onClick={stage === "menu" ? onBack : () => setStage("menu")}
          className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl bg-white/80 hover:bg-white text-slate-600 border border-slate-200 shadow-xs transition-all"
        >
          <ArrowLeft size={14} /> {stage === "menu" ? "В личный кабинет" : "К списку уровней"}
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-orange-100 text-[#FF8A00] font-mono">
            HTML / CSS (3 Уровня)
          </span>
        </div>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-6 pt-8">
        {/* STAGE 1: Level Menu */}
        {stage === "menu" && (
          <div>
            <div className="text-center max-w-2xl mx-auto mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-[#FF8A00] text-xs font-bold font-mono mb-3">
                <Layers size={14} /> 2 Теста (по 10 вопросов) + 1 Практическое задание
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-heading">
                Аттестация по направлению HTML / CSS
              </h1>
              <p className="text-sm text-slate-500 mt-2">
                Пройдите базовый тест, тест повышенной сложности и закрепите результат практической версткой.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {HTMLCSS_LEVELS.map((lvl, index) => {
                const lvlData = existingTrackData.levels[lvl.levelId];
                const isTest = lvl.type === "test";
                const isPassed = isTest ? lvlData?.pct !== undefined : lvlData?.practice?.submitted;
                const isGraded = !isTest && lvlData?.practice?.reviewStatus === "graded";

                return (
                  <div
                    key={lvl.levelId}
                    className="bg-white rounded-3xl p-6 border-2 border-orange-300/40 shadow-lg shadow-orange-500/5 flex flex-col justify-between hover:shadow-xl transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="font-mono text-xs font-bold text-slate-400">
                          УРОВЕНЬ {index + 1}
                        </span>
                        <span
                          className="px-3 py-0.5 rounded-full text-xs font-bold font-mono"
                          style={{
                            backgroundColor: `${lvl.badgeColor}15`,
                            color: lvl.badgeColor,
                            border: `1px solid ${lvl.badgeColor}30`,
                          }}
                        >
                          {lvl.badge}
                        </span>
                      </div>

                      <h3 className="text-xl font-bold text-slate-900 font-heading mb-2">
                        {lvl.levelName}
                      </h3>
                      <p className="text-xs text-slate-500 leading-relaxed mb-6">
                        {lvl.desc}
                      </p>

                      <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200/60 mb-6 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600 font-medium">Статус:</span>
                          {isTest ? (
                            isPassed ? (
                              <span className="font-bold text-emerald-600">
                                Сдано: {lvlData.correct}/10 ({lvlData.pct}%)
                              </span>
                            ) : (
                              <span className="text-slate-400 font-mono">10 вопросов</span>
                            )
                          ) : isPassed ? (
                            isGraded ? (
                              <span className="font-bold text-emerald-600">
                                Оценка: {lvlData.practice.totalScore}/15 баллов
                              </span>
                            ) : (
                              <span className="font-bold text-[#FF8A00]">На проверке у куратора</span>
                            )
                          ) : (
                            <span className="text-slate-400 font-mono">Ожидает решения</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleStartLevel(lvl.levelId)}
                      className="w-full py-3.5 px-4 rounded-2xl font-bold text-white text-sm bg-[#22C55E] hover:bg-[#16A34A] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20"
                    >
                      <span>{isPassed ? "Пройти повторно" : "Начать"}</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STAGE 2: Test Runner (Level 1 & Level 2) */}
        {stage === "test" && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-3xl p-8 border-2 border-orange-300/40 shadow-xl shadow-orange-500/5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-[#FF8A00] font-mono">
                  {currentLevel.levelName}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  Вопрос {qi + 1} из {currentLevel.questions.length}
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 rounded-full bg-slate-100 mb-8 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300 ease-out"
                  style={{
                    width: `${((qi + 1) / currentLevel.questions.length) * 100}%`,
                    background: "linear-gradient(90deg, #FF8A00 0%, #22C55E 100%)",
                  }}
                />
              </div>

              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-heading mb-6 leading-snug">
                {currentLevel.questions[qi].q}
              </h2>

              <div className="space-y-3 mb-8">
                {currentLevel.questions[qi].o.map((opt, idx) => {
                  const isSelected = testPicked === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => setTestPicked(idx)}
                      className={`w-full text-left p-4 rounded-2xl flex items-center gap-3.5 transition-all text-sm font-medium ${
                        isSelected
                          ? "bg-orange-50/70 border-2 border-[#FF8A00] text-slate-900 shadow-xs"
                          : "bg-[#FAF9F6] border border-slate-200 hover:border-slate-300 text-slate-700"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border transition-all ${
                          isSelected
                            ? "border-[#FF8A00] bg-[#FF8A00] text-white"
                            : "border-slate-300 bg-white"
                        }`}
                      >
                        {isSelected ? <CheckCircle2 size={14} /> : <Circle size={10} className="text-transparent" />}
                      </div>
                      <span className="flex-1">{opt}</span>
                    </button>
                  );
                })}
              </div>

              <button
                onClick={handleNextTestQuestion}
                disabled={testPicked === null}
                className="w-full py-3.5 px-6 rounded-2xl font-bold text-white text-sm bg-[#22C55E] hover:bg-[#16A34A] active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20"
              >
                <span>{qi === currentLevel.questions.length - 1 ? "Завершить тестирование" : "Следующий вопрос"}</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* STAGE 3: Practice Live Editor (Level 3) */}
        {stage === "practice" && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border-2 border-orange-300/40 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono">
                    Уровень 3: Практическое задание
                  </span>
                </div>
                <h2 className="text-xl font-extrabold text-slate-900 font-heading">
                  {HTMLCSS_LEVELS[2].practice.title}
                </h2>
                <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
                  {HTMLCSS_LEVELS[2].practice.brief}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCodeMode(codeMode === "editor" ? "link" : "editor")}
                  className="text-xs font-bold px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                >
                  {codeMode === "editor" ? "Отправить ссылку (CodePen)" : "Встроенный редактор"}
                </button>
              </div>
            </div>

            <div className="bg-orange-50/60 rounded-2xl p-4 border border-orange-200/70 text-xs">
              <div className="font-bold text-orange-900 mb-2 flex items-center gap-1.5">
                <CheckCircle size={14} className="text-[#FF8A00]" /> Чек-лист требований к верстке:
              </div>
              <ul className="grid sm:grid-cols-2 gap-1.5 text-slate-700">
                {HTMLCSS_LEVELS[2].practice.requirements.map((req, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-[#FF8A00] font-bold">•</span>
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            {codeMode === "editor" ? (
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="bg-slate-900 rounded-3xl p-5 shadow-xl flex flex-col h-[520px]">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setActiveTab("html")}
                        className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                          activeTab === "html"
                            ? "bg-[#FF8A00] text-white"
                            : "text-slate-400 hover:text-white bg-slate-800"
                        }`}
                      >
                        HTML
                      </button>
                      <button
                        onClick={() => setActiveTab("css")}
                        className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                          activeTab === "css"
                            ? "bg-[#FF8A00] text-white"
                            : "text-slate-400 hover:text-white bg-slate-800"
                        }`}
                      >
                        CSS
                      </button>
                    </div>

                    <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                      <Code2 size={13} className="text-emerald-400" /> Живой предпросмотр
                    </span>
                  </div>

                  <div className="flex-1 relative">
                    {activeTab === "html" ? (
                      <textarea
                        value={htmlCode}
                        onChange={(e) => setHtmlCode(e.target.value)}
                        className="w-full h-full bg-slate-950 text-slate-100 font-mono text-xs p-4 rounded-2xl outline-none resize-none border border-slate-800 focus:border-[#FF8A00]"
                        placeholder="<!-- Пишите HTML здесь -->"
                        spellCheck="false"
                      />
                    ) : (
                      <textarea
                        value={cssCode}
                        onChange={(e) => setCssCode(e.target.value)}
                        className="w-full h-full bg-slate-950 text-slate-100 font-mono text-xs p-4 rounded-2xl outline-none resize-none border border-slate-800 focus:border-[#FF8A00]"
                        placeholder="/* Пишите CSS стили здесь */"
                        spellCheck="false"
                      />
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-3xl p-5 border-2 border-slate-200 shadow-xl flex flex-col h-[520px]">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-red-400" />
                      <span className="w-3 h-3 rounded-full bg-amber-400" />
                      <span className="w-3 h-3 rounded-full bg-emerald-400" />
                      <span className="text-xs font-bold text-slate-600 font-mono ml-2 flex items-center gap-1">
                        <Eye size={13} className="text-[#FF8A00]" /> Интерактивный результат
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 rounded-2xl overflow-hidden border border-slate-200 bg-[#FAFAFA]">
                    <iframe
                      title="Live Preview"
                      srcDoc={liveSrcDoc}
                      className="w-full h-full border-0"
                      sandbox="allow-scripts"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-8 border-2 border-orange-300/40 shadow-xl max-w-xl mx-auto">
                <h3 className="text-lg font-bold text-slate-900 font-heading mb-2">
                  Отправка ссылки на решение
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  Вставьте публичную ссылку на CodePen, JSFiddle или GitHub репозиторий с версткой:
                </p>
                <input
                  value={externalLink}
                  onChange={(e) => setExternalLink(e.target.value)}
                  placeholder="https://codepen.io/your-username/pen/..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#FF8A00] text-sm mb-4"
                />
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => setStage("menu")}
                className="px-6 py-3 rounded-2xl text-xs font-bold bg-slate-200 hover:bg-slate-300 text-slate-700 transition-colors"
              >
                Сохранить черновик
              </button>
              <button
                onClick={handleSubmitPractice}
                className="py-3.5 px-8 rounded-2xl font-bold text-white text-sm bg-[#22C55E] hover:bg-[#16A34A] active:scale-[0.98] transition-all flex items-center gap-2 shadow-lg shadow-emerald-600/20"
              >
                <Send size={16} />
                <span>Отправить практическую работу</span>
              </button>
            </div>
          </div>
        )}

        {/* STAGE 4: Summary Modal */}
        {stage === "summary" && (
          <div className="max-w-md mx-auto text-center">
            <div className="bg-white rounded-3xl p-8 border-2 border-orange-300/40 shadow-xl shadow-orange-500/5">
              <div className="w-16 h-16 mx-auto mb-4 bg-emerald-100 text-[#16A34A] rounded-2xl flex items-center justify-center">
                <CheckCircle size={32} />
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900 font-heading mb-2">
                Уровень завершен!
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed mb-6">
                Результат сохранен в вашем профиле и отображается в кабинете преподавателя.
              </p>

              <button
                onClick={() => setStage("menu")}
                className="w-full py-3.5 px-6 rounded-2xl font-bold text-white text-sm bg-[#22C55E] hover:bg-[#16A34A] active:scale-[0.98] transition-all shadow-md shadow-emerald-600/20"
              >
                Вернуться к списку уровней
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
