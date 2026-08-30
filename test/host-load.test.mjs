import { test } from 'node:test'
import assert from 'node:assert/strict'
import { assertSupportedJsonSchema } from '@deepseek-ai/dsh-tools'
import { apply } from '../lib/index.js'

/** Minimal context satisfying what apply() touches: get/on/effect. */
function fakeCtx() {
  const listeners = {}
  const registered = { tools: 0, commands: 0, sections: 0, typert: 0 }
  const toolDefs = []
  const stubs = {
    tools: { register: (def) => { registered.tools++; toolDefs.push(def); return () => {} } },
    commands: { register: () => { registered.commands++; return () => {} } },
    systemPrompt: { section: () => { registered.sections++; return () => {} } },
    typert: { register: () => { registered.typert++; return () => {} } },
    fs: {}, sessionQuery: {}, llm: {}, agentDefaultModel: {}, timer: {},
  }
  const ctx = {
    get: (name) => stubs[name],
    on: (ev, h) => { (listeners[ev] ??= []).push(h); return () => {} },
    effect: (cb) => { const d = cb(); return () => { if (typeof d === 'function') d() } },
    // cordis `Service` registers the instance back onto ctx.reflect.provide.
    reflect: { provide: () => {} },
  }
  return { ctx, listeners, registered, toolDefs }
}

test('host plugin apply() mounts without throwing and registers everything', () => {
  const { ctx, listeners, registered, toolDefs } = fakeCtx()
  assert.doesNotThrow(() => apply(ctx, { memoryHome: '/tmp/dsh-memory-smoke' }))
  assert.ok(registered.commands >= 1, 'registers /memory command')
  assert.ok(registered.tools >= 2, 'registers remember + memory_search tools')
  assert.ok(registered.sections >= 1, 'registers a systemPrompt section')
  assert.ok(registered.typert >= 1, 'registers the typert manifest')
  assert.ok(Array.isArray(listeners['session/event']) && listeners['session/event'].length > 0, 'listens session/event')
  assert.ok(Array.isArray(listeners['session/disposed']) && listeners['session/disposed'].length > 0, 'listens session/disposed')
})

test('every registered tool has object-rooted parameters and a valid output schema', () => {
  const { ctx, toolDefs } = fakeCtx()
  apply(ctx, { memoryHome: '/tmp/dsh-memory-smoke' })
  assert.ok(toolDefs.length >= 2, 'expected at least two tools')
  for (const def of toolDefs) {
    assert.equal(def.parameters?.type, 'object', `tool ${def.name} parameters must be object-rooted (model-facing function schema)`)
    assert.ok(def.parameters?.properties && typeof def.parameters.properties === 'object', `tool ${def.name} parameters.properties required`)
    assert.doesNotThrow(
      () => assertSupportedJsonSchema(def.output.schema),
      `tool ${def.name} output.schema is invalid`,
    )
  }
})
