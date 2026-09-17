import test from 'node:test';
import assert from 'node:assert/strict';
import { catalog, publicTask, score, combineSubjectTasks } from './catalog.js';

test('subject catalog contains seven separate ten-question tests with private answer keys', () => {
  const tasks = catalog.find(track => track.id === 'subject-disciplines').tasks;
  assert.equal(tasks.length, 7);
  assert.equal(new Set(tasks.map(task => task.id)).size, 7);
  for (const task of tasks) {
    assert.equal(task.questions.length, 10, task.title);
    assert.ok(task.questions.every(question => question.o.length === 4 && Number.isInteger(question.c) && question.c >= 0 && question.c < 4), task.title);
    assert.ok(publicTask(task).questions.every(question => question.c === undefined), task.title);
  }
  const selected = [tasks[0], tasks[3]];
  const participant = { answers: { [selected[0].id]: { choices: { 0: selected[0].questions[0].c } } } };
  const result = score({ trackId: 'subject-disciplines', tasks: selected }, participant);
  assert.equal(result.correct, 1);
  assert.equal(result.total, 20);
  assert.deepEqual(result.subjects.map(subject => [subject.title, subject.correct, subject.total]), [['Математика', 1, 10], ['Химия', 0, 10]]);
  const combined = combineSubjectTasks(selected);
  const combinedScore = score({ trackId: 'subject-disciplines', tasks: [combined] }, {
    answers: { [combined.id]: { choices: { 0: selected[0].questions[0].c, 10: selected[1].questions[0].c } } },
  });
  assert.deepEqual(combinedScore.subjects.map(subject => [subject.title, subject.correct, subject.total]), [['Математика', 1, 10], ['Химия', 1, 10]]);
});
