import React, { useState, useEffect } from "react";
import { C } from "./data/tracks.js";
import {
  loadStudents,
  saveStudent,
  loadSession,
  saveSession,
  clearSession,
  clearAllStudents,
  loadTeacherSession,
  saveTeacherSession,
  clearTeacherSession,
} from "./lib/storage.js";

import Landing from "./components/Landing.jsx";
import StudentAuth from "./components/StudentAuth.jsx";
import StudentDashboard from "./components/StudentDashboard.jsx";
import { TestRunner, TestResult } from "./components/TestRunner.jsx";
import MultiLevelTrackRunner from "./components/MultiLevelTrackRunner.jsx";
import EnglishTrackRunner from "./components/EnglishTrackRunner.jsx";
import AdminLogin from "./components/AdminLogin.jsx";
import AdminDashboard from "./components/AdminDashboard.jsx";

export default function App() {
  const [view, setView] = useState("landing");
  const [students, setStudents] = useState([]);
  const [student, setStudent] = useState(null);
  const [teacherName, setTeacherName] = useState("");
  const [activeTrack, setActiveTrack] = useState(null);
  const [lastResult, setLastResult] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshStudents = async () => {
    const list = await loadStudents();
    setStudents(list);
    return list;
  };

  useEffect(() => {
    (async () => {
      const list = await refreshStudents();

      // Check student session
      const sid = await loadSession();
      if (sid) {
        const found = list.find((s) => s.id === sid);
        if (found) {
          setStudent(found);
          setView("studentDashboard");
          setLoading(false);
          return;
        }
      }

      // Check teacher session
      const tName = await loadTeacherSession();
      if (tName) {
        setTeacherName(tName);
        setView("admin");
      }

      setLoading(false);
    })();
  }, []);

  const handleStudentLogin = async (s, isNew) => {
    if (isNew) await saveStudent(s);
    await saveSession(s.id);
    setStudent(s);
    await refreshStudents();
    setView("studentDashboard");
  };

  const handleStudentLogout = async () => {
    await clearSession();
    setStudent(null);
    setView("landing");
  };

  const handleFinishTest = async (result) => {
    const updated = {
      ...student,
      results: { ...student.results, [activeTrack]: { ...result, completedAt: new Date().toISOString() } },
    };
    setStudent(updated);
    await saveStudent(updated);
    await refreshStudents();
    setLastResult(result);
    setView("testResult");
  };

  const handleSaveMultiTrack = async (trackId, multiData) => {
    const updated = {
      ...student,
      results: {
        ...student.results,
        [`${trackId}_multi`]: multiData,
        [trackId]: {
          level: "В процессе / Сдан",
          correctCount: Object.keys(multiData.levels || {}).length,
          total: 3,
          pct: 100,
          completedAt: new Date().toISOString()
        }
      }
    };
    setStudent(updated);
    await saveStudent(updated);
    await refreshStudents();
  };

  const handleGradeStudentPractice = async (studentId, trackId, levelId, gradeData) => {
    const targetStudent = students.find((s) => s.id === studentId);
    if (!targetStudent) return;

    const currentMulti = targetStudent.results?.[`${trackId}_multi`] || { levels: {} };
    const currentLevel = currentMulti.levels[levelId] || {};

    const updatedStudent = {
      ...targetStudent,
      results: {
        ...targetStudent.results,
        [`${trackId}_multi`]: {
          ...currentMulti,
          levels: {
            ...currentMulti.levels,
            [levelId]: {
              ...currentLevel,
              practice: {
                ...(currentLevel.practice || {}),
                ...gradeData
              }
            }
          }
        }
      }
    };

    await saveStudent(updatedStudent);
    if (student && student.id === studentId) {
      setStudent(updatedStudent);
    }
    await refreshStudents();
  };

  const handleReset = async () => {
    if (!confirm("Удалить все демо-данные учеников?")) return;
    await clearAllStudents();
    await refreshStudents();
  };

  if (loading) {
    return <div style={{ background: C.paper, minHeight: "100vh" }} />;
  }

  return (
    <>
      {view === "landing" && <Landing goStudent={() => setView("studentAuth")} goAdmin={() => setView("adminLogin")} />}

      {view === "studentAuth" && (
        <StudentAuth onBack={() => setView("landing")} onLogin={handleStudentLogin} students={students} />
      )}

      {view === "studentDashboard" && student && (
        <StudentDashboard
          student={student}
          onStartTrack={(id) => {
            setActiveTrack(id);
            if (id === "english") {
              setView("english_track");
            } else if (["htmlcss", "js", "python", "csharp"].includes(id)) {
              setView("multi_track");
            } else {
              setView("test");
            }
          }}
          onLogout={handleStudentLogout}
        />
      )}

      {view === "english_track" && student && (
        <EnglishTrackRunner
          student={student}
          onSaveResult={(multiData) => handleSaveMultiTrack("english", multiData)}
          onBack={() => setView("studentDashboard")}
        />
      )}

      {view === "multi_track" && student && activeTrack && (
        <MultiLevelTrackRunner
          trackId={activeTrack}
          student={student}
          onSaveResult={(multiData) => handleSaveMultiTrack(activeTrack, multiData)}
          onBack={() => setView("studentDashboard")}
        />
      )}

      {view === "test" && (
        <TestRunner trackId={activeTrack} onFinish={handleFinishTest} onCancel={() => setView("studentDashboard")} />
      )}

      {view === "testResult" && lastResult && (
        <TestResult trackId={activeTrack} result={lastResult} onBack={() => setView("studentDashboard")} />
      )}

      {view === "adminLogin" && (
        <AdminLogin
          onBack={() => setView("landing")}
          onLogin={async (name) => {
            const tName = name || "Преподаватель спецгруппы";
            await saveTeacherSession(tName);
            setTeacherName(tName);
            setView("admin");
          }}
        />
      )}

      {view === "admin" && (
        <AdminDashboard
          teacherName={teacherName}
          students={students}
          onLogout={async () => {
            await clearTeacherSession();
            setTeacherName("");
            setView("landing");
          }}
          onRefresh={refreshStudents}
          onReset={handleReset}
          onGradePractice={handleGradeStudentPractice}
        />
      )}
    </>
  );
}
