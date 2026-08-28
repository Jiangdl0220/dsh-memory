import type { MemoryNamespaceFace } from './remote.ts'
import type { Translate } from './locales.ts'

let remote: MemoryNamespaceFace | undefined
let translate: Translate | undefined
const listeners = new Set<() => void>()

function emit(): void {
  for (const listener of [...listeners]) {
    try { listener() } catch { /* ignore */ }
  }
}

/** Publish the mounted handles after the Remote mounts. */
export function mountState(face: MemoryNamespaceFace, t: Translate): void {
  remote = face
  translate = t
  emit()
}

/** Drop the handles on teardown. */
export function clearState(): void {
  remote = undefined
  translate = undefined
  emit()
}

/** Subscribe to handle changes; returns the unsubscribe function. */
export function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => { listeners.delete(listener) }
}

/** The mounted Remote namespace, or undefined before it mounts. */
export function getRemote(): MemoryNamespaceFace | undefined {
  return remote
}

/** The bound translate function (never undefined after apply runs). */
export function getTranslate(): Translate | undefined {
  return translate
}
