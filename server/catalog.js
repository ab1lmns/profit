import { ALL_TRACK_TASKS } from '../src/data/track_tasks.js';
import { ENGLISH_TRACK_TASKS } from '../src/data/english_tasks.js';

// Banks are imported on the server only. Correct answers never enter the browser bundle.
export const catalog = Object.values(ALL_TRACK_TASKS).map(track => ({
  id: track.trackId, label: track.trackLabel, language: track.language,
  tasks: track.levels.map(level => ({
    id: level.levelId, title: level.levelName, description: level.desc,
    type: level.type, questions: level.questions, practice: level.practice,
  })),
}));
catalog.push({ id: 'english', label: 'Английский', language: 'text', tasks: [
  ...ENGLISH_TRACK_TASKS.levels.filter(l => ['test', 'reading'].includes(l.type)).map(l => ({
    id: l.levelId, title: l.levelName, description: l.desc, type: 'test',
    article: l.reading?.article, questions: l.questions || l.reading?.questions,
  })),
  { id: 'writing', title: 'Письменная практика', type: 'writing', description: 'Короткое эссе на английском языке.', practice: {
    title: 'My IT project', brief: 'Write 150–200 words about an IT project you would like to build. Describe its purpose, users, technologies and one challenge you expect.', requirements: ['150–200 words', 'Explain your technology choices', 'Use your own words'],
  } },
] });
export const publicTask = task => JSON.parse(JSON.stringify(task, (key, value) => key === 'c' ? undefined : value));
export const findTrack = id => catalog.find(t => t.id === id);
export function score(room, participant) {
  let correct = 0, total = 0;
  for (const task of room.tasks) for (const [i, q] of (task.questions || []).entries()) {
    total++;
    if (participant.answers[task.id]?.choices?.[i] === q.c) correct++;
  }
  return { correct, total, practicePending: room.tasks.some(t => t.practice) && !participant.grade };
}
