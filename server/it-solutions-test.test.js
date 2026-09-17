import test from 'node:test';
import assert from 'node:assert/strict';
import { catalog, publicTask, score } from './catalog.js';

test('IT solutions has one 30-question C#/SQL Server/Windows Forms test', () => {
  const track = catalog.find(item => item.id === 'it-solutions');
  assert.equal(track.tasks.length, 1);
  const task = track.tasks[0];
  assert.equal(task.id, 'test');
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
  const answers = { test: { choices: { 0: task.questions[0].c, 10: task.questions[10].c, 20: task.questions[20].c } } };
  assert.deepEqual(score({ trackId: track.id, tasks: track.tasks }, { answers }), { correct: 3, total: 30, practicePending: false });
});
