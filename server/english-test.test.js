import test from 'node:test';
import assert from 'node:assert/strict';
import { catalog, publicTask, score } from './catalog.js';

const english = catalog.find(track => track.id === 'english');
const room = { trackId: 'english', tasks: english.tasks };
const resultFor = indexes => score(room, {
  answers: { test: { choices: Object.fromEntries(indexes.map(index => [index, english.tasks[0].questions[index].c])) } },
});

test('English test has 30 private answer keys and reports level by block', () => {
  const questions = english.tasks[0].questions;
  assert.equal(english.tasks.length, 1);
  assert.equal(questions.length, 30);
  assert.ok(questions.every(question => question.o.length === 4 && question.c >= 0 && question.c < 4));
  assert.ok(publicTask(english.tasks[0]).questions.every(question => question.c === undefined));

  assert.equal(resultFor([]).englishLevel, 'Ниже A1');
  assert.equal(resultFor([0, 1, 2, 3, 4]).englishLevel, 'A1');
  assert.equal(resultFor([0, 1, 2, 3, 4, 5, 6]).englishLevel, 'A2');
  assert.equal(resultFor([0, 1, 2, 3, 4, 5, 6, 10, 11, 12, 13, 14, 15]).englishLevel, 'B1');
  const b2 = resultFor([0, 1, 2, 3, 4, 5, 6, 10, 11, 12, 13, 14, 15, 20, 21, 22, 23, 24, 25]);
  assert.equal(b2.englishLevel, 'B2');
  assert.deepEqual(b2.englishBlocks, { a1a2: 7, b1: 6, b2: 6 });
});
