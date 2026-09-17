import test from 'node:test';
import assert from 'node:assert/strict';
import { catalog, combineModelingTasks, publicTask, score } from './catalog.js';

test('3D modeling offers separate Blender and Unity tests with 15 questions each', () => {
  const track = catalog.find(item => item.id === '3d-modeling');
  assert.deepEqual(track.tasks.map(task => task.id), ['blender', 'unity']);
  for (const task of track.tasks) {
    assert.equal(task.type, 'test');
    assert.equal(task.questions.length, 15);
    assert.equal(new Set(task.questions.map(question => question.q)).size, 15);
    for (const question of task.questions) {
      assert.ok(question.q.length > 10);
      assert.equal(question.o.length, 4);
      assert.equal(new Set(question.o).size, 4);
      assert.ok(Number.isInteger(question.c) && question.c >= 0 && question.c < 4);
    }
    assert.ok(publicTask(task).questions.every(question => question.c === undefined));
  }
  assert.equal(score({ trackId: track.id, tasks: [track.tasks[0]] }, { answers: {} }).total, 15);
  const combined = combineModelingTasks(track.tasks);
  assert.equal(combined.questions.length, 30);
  assert.deepEqual(combined.subjectSections.map(section => section.start), [0, 15]);
  const answers = { [combined.id]: { choices: { 0: track.tasks[0].questions[0].c, 15: track.tasks[1].questions[0].c } } };
  const result = score({ trackId: track.id, tasks: [combined] }, { answers });
  assert.equal(result.correct, 2);
  assert.equal(result.total, 30);
  assert.deepEqual(result.subjects.map(section => [section.title, section.correct, section.total]), [['Blender', 1, 15], ['Unity', 1, 15]]);
});
