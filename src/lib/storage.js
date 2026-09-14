// -----------------------------------------------------------------------
// Storage layer — currently backed by localStorage (client-only, per browser).
//
// Everything here is written as async functions on purpose: when the real
// backend (Node/Express + MongoDB, or whatever you choose) is ready, you can
// swap the bodies of these functions for fetch() calls to your API without
// touching any component code. That's the seam to build the backend behind.
// -----------------------------------------------------------------------

const STUDENTS_INDEX_KEY = "specgroup:students:index";
const STUDENT_KEY = (id) => `specgroup:students:${id}`;
const SESSION_KEY = "specgroup:session:studentId";

export async function loadStudents() {
  const idxRaw = localStorage.getItem(STUDENTS_INDEX_KEY);
  const ids = idxRaw ? JSON.parse(idxRaw) : [];
  const list = [];
  for (const id of ids) {
    const raw = localStorage.getItem(STUDENT_KEY(id));
    if (raw) list.push(JSON.parse(raw));
  }
  return list;
}

export async function saveStudent(student) {
  localStorage.setItem(STUDENT_KEY(student.id), JSON.stringify(student));
  const idxRaw = localStorage.getItem(STUDENTS_INDEX_KEY);
  const ids = idxRaw ? JSON.parse(idxRaw) : [];
  if (!ids.includes(student.id)) {
    ids.push(student.id);
    localStorage.setItem(STUDENTS_INDEX_KEY, JSON.stringify(ids));
  }
}

export async function deleteStudent(id) {
  localStorage.removeItem(STUDENT_KEY(id));
  const idxRaw = localStorage.getItem(STUDENTS_INDEX_KEY);
  const ids = idxRaw ? JSON.parse(idxRaw) : [];
  localStorage.setItem(STUDENTS_INDEX_KEY, JSON.stringify(ids.filter((x) => x !== id)));
}

export async function clearAllStudents() {
  const idxRaw = localStorage.getItem(STUDENTS_INDEX_KEY);
  const ids = idxRaw ? JSON.parse(idxRaw) : [];
  ids.forEach((id) => localStorage.removeItem(STUDENT_KEY(id)));
  localStorage.setItem(STUDENTS_INDEX_KEY, JSON.stringify([]));
}

const TEACHER_SESSION_KEY = "specgroup:session:teacherName";

export async function loadSession() {
  return localStorage.getItem(SESSION_KEY);
}

export async function saveSession(id) {
  localStorage.setItem(SESSION_KEY, id);
}

export async function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

export async function loadTeacherSession() {
  return localStorage.getItem(TEACHER_SESSION_KEY);
}

export async function saveTeacherSession(name) {
  localStorage.setItem(TEACHER_SESSION_KEY, name);
}

export async function clearTeacherSession() {
  localStorage.removeItem(TEACHER_SESSION_KEY);
}
