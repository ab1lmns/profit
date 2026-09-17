import test from 'node:test';
import assert from 'node:assert/strict';
import { catalog, publicTask, score } from './catalog.js';

test('graphic design has one 30-question test ordered in three difficulty blocks', () => {
  const track = catalog.find(item => item.id === 'graphic-design');
  assert.deepEqual(track.tasks.map(task => task.id), ['test']);
  const task = track.tasks[0];
  assert.equal(task.type, 'test');
  assert.equal(task.questions.length, 30);
  assert.equal(new Set(task.questions.map(question => question.q)).size, 30);
  for (const question of task.questions) {
    assert.ok(question.q.length > 10);
    assert.equal(question.o.length, 4);
    assert.equal(new Set(question.o).size, 4);
    assert.ok(Number.isInteger(question.c) && question.c >= 0 && question.c < 4);
  }
  assert.ok(publicTask(task).questions.every(question => question.c === undefined));
  assert.match(task.description, /1–10.*11–20.*21–30/);
  assert.match(task.questions[0].q, /Frame/);
  assert.match(task.questions[10].q, /Auto Layout/);
  assert.match(task.questions[20].q, /длинная надпись/);
  const answers = { test: { choices: { 0: task.questions[0].c, 10: task.questions[10].c, 20: task.questions[20].c } } };
  assert.deepEqual(score({ trackId: track.id, tasks: track.tasks }, { answers }), { correct: 3, total: 30, practicePending: false });
});

test('previous graphic design sessions with separate sections keep their score breakdown', () => {
  const oldTasks = [
    { id: 'figma', title: 'Figma', questions: [{ q: 'Старый вопрос Figma', o: ['Да', 'Нет', '1', '2'], c: 0 }] },
    { id: 'illustrator', title: 'Adobe Illustrator', questions: [{ q: 'Старый вопрос Illustrator', o: ['Да', 'Нет', '1', '2'], c: 0 }] },
  ];
  const result = score({ trackId: 'graphic-design', tasks: oldTasks }, { answers: { figma: { choices: { 0: 0 } } } });
  assert.deepEqual(result.subjects.map(section => [section.title, section.correct]), [['Figma', 1], ['Adobe Illustrator', 0]]);
});
