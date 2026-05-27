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
    available: true,
    summary: 'Loads the Pyodide WebAssembly runtime in-browser for single-file Python execution.'
  }],
  ['wasm-cpp', {
    id: 'wasm-cpp',
    label: 'C++ WASM toolchain adapter',
    kind: 'wasm',
    available: true,
    summary: 'Compiles single-file C++ solutions to WebAssembly in-browser with YoWASP Clang and runs them through a WASI runtime.'
  }],
  ['wasm-java', {
    id: 'wasm-java',
    label: 'Java WASM toolchain adapter',
    kind: 'wasm',
    available: true,
    summary: 'Loads a CheerpJ browser runtime, compiles Java sources in-browser, and executes a generated harness locally.'
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
