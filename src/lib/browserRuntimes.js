const runtimeRegistry = new Map([
  ['native-flow', {
    id: 'native-flow',
    label: 'Native flow-graph compiler',
    kind: 'builtin',
    available: true,
    summary: 'Runs the topology and simulation DSL interpreters directly in the browser.'
  }],
  ['wasm-python', {
    id: 'wasm-python',
    label: 'Pyodide / Python WASM adapter',
    kind: 'wasm',
    available: false,
    summary: 'Ready for browser-side Python interpreters compiled to WebAssembly.'
  }],
  ['wasm-lua', {
    id: 'wasm-lua',
    label: 'Lua / custom WASM adapter',
    kind: 'wasm',
    available: false,
    summary: 'Use this slot for additional in-browser interpreters backed by WebAssembly modules.'
  }]
])

/**
 * @param {{ id: string, label: string, kind: string, available: boolean, summary: string }} runtime
 */
export function registerBrowserRuntime(runtime) {
  runtimeRegistry.set(runtime.id, runtime)
}

export function listBrowserRuntimes() {
  return [...runtimeRegistry.values()]
}
