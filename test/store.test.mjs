import { test } from 'node:test'
import assert from 'node:assert/strict'
import { sanitizeTopic, kindLabel, parseJournalLines } from '../lib/index.js'

test('sanitizeTopic normalizes to a safe filename slug', () => {
  assert.equal(sanitizeTopic('Fitness / 减脂'), 'fitness')
  assert.equal(sanitizeTopic('  DSH Dev  '), 'dsh-dev')
  assert.equal(sanitizeTopic(''), 'general')
})

test('kindLabel maps each kind to Chinese', () => {
  assert.equal(kindLabel('fact'), '事实')
  assert.equal(kindLabel('decision'), '决策')
  assert.equal(kindLabel('howto'), '做法')
})

test('parseJournalLines extracts facts/decisions/how-tos', () => {
  const body = [
    '- **事实**（fitness）：体重从 89.2 到 88.2kg',
    '- **决策**（dsh-dev）：压缩周期到 8 周',
    '- **做法**（dsh-dev）：挂载新插件两步',
  ].join('\n')
  const lines = parseJournalLines(body)
  assert.equal(lines.length, 3)
  assert.equal(lines[0].kind, 'fact')
  assert.equal(lines[0].topic, 'fitness')
  assert.equal(lines[1].kind, 'decision')
  assert.equal(lines[2].kind, 'howto')
})

test('parseJournalLines ignores non-memory lines', () => {
  assert.equal(parseJournalLines('noise line\n- **事实**（general）：only one').length, 1)
})
