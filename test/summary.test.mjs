import { test } from 'node:test'
import assert from 'node:assert/strict'
import { extractJson, extractContentText } from '../lib/index.js'

test('extractJson takes the first complete nested object', () => {
  const r = extractJson('prefix {"facts":[{"text":"a","topic":"b"}],"decisions":[],"howtos":[]} tail')
  assert.ok(r)
  assert.equal(r.facts.length, 1)
  assert.equal(r.facts[0].text, 'a')
})

test('extractJson handles a duplicated JSON reply (model quirk)', () => {
  const r = extractJson('{"facts":[],"decisions":[],"howtos":[]}{"facts":[],"decisions":[],"howtos":[]}')
  assert.ok(r)
  assert.equal(r.facts.length, 0)
})

test('extractJson ignores a code fence', () => {
  const r = extractJson('```json\n{"facts":[{"text":"x","topic":"y"}]}\n```')
  assert.ok(r)
  assert.equal(r.facts.length, 1)
})

test('extractJson returns null for non-JSON', () => {
  assert.equal(extractJson('nothing here'), null)
})

test('extractContentText joins text blocks and drops others', () => {
  assert.equal(
    extractContentText([{ type: 'text', text: 'hi' }, { type: 'image', src: 'x' }, { type: 'text', text: ' there' }]),
    'hi there',
  )
})
