/**
 * Single-file client + ESM host build for dsh-memory.
 * Host half is plain ESM for Node; client half is one CJS bundle wrapped in the
 * ModuleLoader factory handshake (external @deepseek-ai/dsh-* + react + cordis).
 */
import { build } from 'esbuild'
import { mkdirSync } from 'node:fs'
import { spawnSync } from 'node:child_process'

// esbuild's native-binary discovery can be flaky under some shells (npm publish
// runs `prepublishOnly` via `sh -c`). Pin the binary explicitly when present so
// the build is deterministic regardless of how it's launched.
if (!process.env.ESBUILD_BINARY_PATH) {
  const found = spawnSync('find', ['node_modules/.pnpm', '-path', '*@esbuild/*', '-name', 'esbuild', '-type', 'f'], { encoding: 'utf8' }).stdout.trim().split('\n')[0]
  if (found) process.env.ESBUILD_BINARY_PATH = found
}

mkdirSync('lib', { recursive: true })

const dshExternal = ['@deepseek-ai/cordis', '@deepseek-ai/dsh-*']

await build({
  entryPoints: ['src/index.ts'],
  outfile: 'lib/index.js',
  bundle: true,
  format: 'esm',
  platform: 'node',
  target: ['node22'],
  sourcemap: true,
  external: dshExternal,
  logLevel: 'info',
})

await build({
  entryPoints: ['src/client/index.ts'],
  outfile: 'lib/client.js',
  bundle: true,
  format: 'cjs',
  platform: 'browser',
  target: ['es2022'],
  sourcemap: true,
  jsx: 'automatic',
  external: [...dshExternal, 'react', 'react-dom', 'react/jsx-runtime', 'react/jsx-dev-runtime', 'scheduler'],
  banner: {
    js: "window.__ModuleLoader__.load({ id: '@jiangdaoli/dsh-memory', factory: (require) => { var module = { exports: {} }; var exports = module.exports;",
  },
  footer: {
    js: 'return module.exports; } });',
  },
  logLevel: 'info',
})
