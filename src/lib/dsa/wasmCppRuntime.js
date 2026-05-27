let runtimePromise = null

async function loadCppRuntime() {
  if (typeof window === 'undefined') {
    throw new Error('The C++ WebAssembly runtime can only load in a browser environment.')
  }

  if (!runtimePromise) {
    runtimePromise = (async () => {
      const [clangModule, wasiModule] = await Promise.all([
        import('@yowasp/clang'),
        import('@wasmer/wasi')
      ])

      await wasiModule.init()
      return {
        runClang: clangModule.runClang,
        WASI: wasiModule.WASI
      }
    })()
  }

  return runtimePromise
}

export async function ensureCppRuntime() {
  await loadCppRuntime()
}

export async function runCppSource(source) {
  const { runClang, WASI } = await loadCppRuntime()

  let compiledFiles
  try {
    compiledFiles = await runClang(
      ['clang++', 'solution.cpp', '-std=c++17', '-O2', '-o', 'solution'],
      { 'solution.cpp': source }
    )
  } catch (error) {
    return {
      ok: false,
      stdout: '',
      stderr: '',
      error: error instanceof Error ? error.message : 'C++ compilation failed.'
    }
  }

  const moduleBytes = compiledFiles.solution ?? compiledFiles['a.out'] ?? findFirstBinaryArtifact(compiledFiles)
  if (!moduleBytes) {
    return {
      ok: false,
      stdout: '',
      stderr: '',
      error: 'C++ compilation did not produce a runnable WebAssembly module.'
    }
  }

  try {
    const wasi = new WASI({
      args: ['solution'],
      env: {}
    })

    const module = await WebAssembly.compile(moduleBytes)
    await wasi.instantiate(module, {})
    const exitCode = wasi.start()
    const stdout = wasi.getStdoutString().trim()
    const stderr = wasi.getStderrString().trim()

    return {
      ok: exitCode === 0,
      stdout,
      stderr,
      exitCode,
      error: exitCode === 0 ? '' : (stderr || `C++ program exited with code ${exitCode}.`)
    }
  } catch (error) {
    return {
      ok: false,
      stdout: '',
      stderr: '',
      error: error instanceof Error ? error.message : 'Unable to execute the compiled C++ WebAssembly module.'
    }
  }
}

function findFirstBinaryArtifact(files) {
  for (const value of Object.values(files ?? {})) {
    if (value instanceof Uint8Array || value instanceof ArrayBuffer) return value
  }
  return null
}
