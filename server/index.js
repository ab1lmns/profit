import { randomBytes } from 'node:crypto';
import { createApp } from './app.js';
const tracks = ['htmlcss', 'js', 'python', 'csharp', 'english'];
let teachers;
if (process.env.TEACHERS_JSON) teachers = JSON.parse(process.env.TEACHERS_JSON);
else {
  const password = process.env.TEACHER_PASSWORD || randomBytes(9).toString('base64url');
  teachers = [{ login: 'teacher', name: 'Преподаватель', password, tracks }];
  if (!process.env.TEACHER_PASSWORD) console.log(`Временный вход: teacher / ${password}\nЗадайте TEACHER_PASSWORD в .env для постоянного пароля.`);
}
if (teachers.some(t => !t.login || !t.password || !t.name || !Array.isArray(t.tracks) || !t.tracks.length || t.tracks.some(id => !tracks.includes(id))) || new Set(teachers.map(t => t.login)).size !== teachers.length) throw new Error('Invalid TEACHERS_JSON');
const server = createApp({ teachers, dataDir: process.env.DATA_DIR, iceServers: JSON.parse(process.env.ICE_SERVERS_JSON || '[]'), secureCookies: process.env.SECURE_COOKIES === 'true' });
server.on('error', error => { console.error(error.code === 'EADDRINUSE' ? 'Порт API занят. Остановите прежний процесс сервера или задайте другой API_PORT.' : error.message); process.exit(1); });
server.listen(Number(process.env.API_PORT || 3001), process.env.HOST || '0.0.0.0', () => console.log(`ProfIT API: http://localhost:${process.env.API_PORT || 3001}`));
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => { server.closeStreams(); server.close(() => process.exit(0)); });
