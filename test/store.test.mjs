import { test } from 'node:test'
import assert from 'node:assert/strict'
import { MemoryStore, sanitizeTopic, kindLabel, parseJournalLines } from '../lib/index.js'

/** Build a MemoryStore over an in-memory file map (rel path -> content). */
function makeStore(files) {
  const map = new Map(files)
  const fs = {
    async resolve(path) {
      return { rel: path.replace(/^memory\//, '') }
    },
    async readText(t) {
      return map.get(t.rel) ?? ''
    },
    async writeText(t, content) {
      map.set(t.rel, content)
    },
    async listDir(t) {
      if (t.rel !== 'topics') return []
      return [...map.keys()]
        .filter((k) => k.startsWith('topics/'))
        .map((k) => ({ name: k.slice('topics/'.length), target: { rel: k } }))
    },
    async stat() {
      return { mtimeMs: 1 }
    },
    async readBytes() {
      return new Uint8Array()
    },
  }
  const ctx = { get(name) { return name === 'fs' ? fs : undefined } }
  return { store: new MemoryStore(ctx, { memoryHome: 'memory' }), map }
}

test('listTopics returns bare slugs that round-trip to readTopic', async () => {
  const { store } = makeStore([['topics/dsh-dev.md', '- 事实：hello world\n']])
  const topics = await store.listTopics()
  assert.deepEqual(topics, ['dsh-dev'])
  assert.equal(await store.readTopic('dsh-dev'), '- 事实：hello world\n')
})

test('readTopic does not double-sanitize a listed slug (regression: dsh-dev.md)', async () => {
  const { store } = makeStore([['topics/dsh-dev.md', '- 决策：use object-level required\n']])
  const topics = await store.listTopics()
  assert.equal(topics[0], 'dsh-dev')
  // Previously the frontend passed the ".md"-suffixed name and re-sanitized it to
  // dsh-dev-md.md, which does not exist; a listed slug must resolve to its file.
  assert.equal(await store.readTopic(topics[0]), '- 决策：use object-level required\n')
})

test('collectItems reads each topic file and labels it with the bare slug', async () => {
  const { store } = makeStore([
    ['topics/dsh-dev.md', '- 事实：a\n- 决策：b\n'],
    ['topics/fitness.md', '- 做法：c\n'],
  ])
  const items = await store.collectItems()
  assert.deepEqual(
    items.map((i) => [i.kind, i.topic, i.text]),
    [
      ['howto', 'fitness', 'c'],
      ['fact', 'dsh-dev', 'a'],
      ['decision', 'dsh-dev', 'b'],
    ],
  )
})

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
