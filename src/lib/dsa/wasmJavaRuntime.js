import { base } from '$app/paths'

const CHEERPJ_VERSION = '4.3'
const CHEERPJ_LOADER_URL = `https://cjrtnc.leaningtech.com/${CHEERPJ_VERSION}/loader.js`
const ECJ_ASSET_URL = `${base}/cheerpj/ecj-4.6.1.jar`
const JAVA_SOURCE_DIR = '/str'
const JAVA_WORK_DIR = '/files'
const JAVA_SOLUTION_PATH = `${JAVA_SOURCE_DIR}/Solution.java`
const JAVA_HARNESS_PATH = `${JAVA_SOURCE_DIR}/Harness.java`
const JAVA_RESULT_PATH = `${JAVA_WORK_DIR}/result.json`
const JAVA_ERROR_PATH = `${JAVA_WORK_DIR}/error.txt`
const ECJ_VFS_PATH = `${JAVA_SOURCE_DIR}/ecj.jar`

/** @type {Promise<void> | null} */
let initPromise = null
/** @type {Promise<any> | null} */
let libraryPromise = null
/** @type {Promise<void> | null} */
let compilerJarPromise = null

/**
 * @returns {Window & {
 *   cheerpjInit?: (options?: Record<string, unknown>) => Promise<void>,
 *   cheerpjRunLibrary?: (classPath: string) => Promise<any>,
 *   cheerpjRunMain?: (className: string, classPath: string, ...args: string[]) => Promise<number>,
 *   cheerpOSAddStringFile?: (path: string, data: string | Uint8Array) => void,
 *   cjFileBlob?: (path: string) => Promise<Blob>,
 *   __dsaCheerpjInitPromise?: Promise<void>,
 *   __dsaCheerpjLibraryPromise?: Promise<any>,
 *   __dsaCheerpjCompilerJarPromise?: Promise<void>
 * }}
 */
function getCheerpjWindow() {
  return /** @type {any} */ (window)
}

/** @returns {Promise<void>} */
function appendCheerpjScript() {
  if (typeof window === 'undefined') {
    throw new Error('CheerpJ can only load in a browser environment.')
  }

  const cheerpjWindow = getCheerpjWindow()
  if (cheerpjWindow.cheerpjInit) return Promise.resolve()

  return new Promise((resolve, reject) => {
    const existingScript = document.querySelector('script[data-cheerpj-loader="true"]')
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(), { once: true })
      existingScript.addEventListener('error', () => reject(new Error('Failed to load the CheerpJ runtime bundle.')), { once: true })
      return
    }

    const script = document.createElement('script')
    script.src = CHEERPJ_LOADER_URL
    script.async = true
    script.dataset.cheerpjLoader = 'true'
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load the CheerpJ runtime bundle.'))
    document.head.append(script)
  })
}

export async function ensureJavaRuntime() {
  const cheerpjWindow = getCheerpjWindow()

  if (!cheerpjWindow.__dsaCheerpjInitPromise) {
    cheerpjWindow.__dsaCheerpjInitPromise = (async () => {
      await appendCheerpjScript()
      if (!cheerpjWindow.cheerpjInit) {
        throw new Error('CheerpJ loaded, but the initializer function is unavailable.')
      }

      try {
        await cheerpjWindow.cheerpjInit({
          status: 'none',
          version: 8
        })
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        if (!/already initialized/i.test(message)) {
          throw error
        }
      }
    })()
  }

  initPromise = cheerpjWindow.__dsaCheerpjInitPromise
  await initPromise

  if (!cheerpjWindow.__dsaCheerpjLibraryPromise) {
    if (!cheerpjWindow.cheerpjRunLibrary) {
      throw new Error('CheerpJ loaded, but library mode is unavailable.')
    }
    cheerpjWindow.__dsaCheerpjLibraryPromise = cheerpjWindow.cheerpjRunLibrary('')
  }

  libraryPromise = cheerpjWindow.__dsaCheerpjLibraryPromise
  return libraryPromise
}

/**
 * @param {{ solutionSource: string, harnessSource: string }} sources
 */
export async function runJavaPractice({ solutionSource, harnessSource }) {
  const lib = await ensureJavaRuntime()
  const cheerpjWindow = getCheerpjWindow()

  if (!cheerpjWindow.cheerpOSAddStringFile || !cheerpjWindow.cheerpjRunMain) {
    throw new Error('CheerpJ loaded, but the runtime file APIs are unavailable.')
  }

  const ByteArrayOutputStream = await lib.java.io.ByteArrayOutputStream
  const PrintStream = await lib.java.io.PrintStream

  await ensureWritableDirectory(lib, JAVA_WORK_DIR)

  cheerpjWindow.cheerpOSAddStringFile(JAVA_SOLUTION_PATH, solutionSource)
  cheerpjWindow.cheerpOSAddStringFile(JAVA_HARNESS_PATH, harnessSource)

  const compilerBuffer = await new ByteArrayOutputStream()
  const compilerStream = await new PrintStream(compilerBuffer)

  const compileSucceeded = await compileJavaSources({
    lib,
    compilerStream
  })

  const compileOutput = await compilerBuffer.toString()
  if (!compileSucceeded) {
    return {
      ok: false,
      stdout: '',
      stderr: compileOutput.trim(),
      error: compileOutput.trim() || 'Java compilation failed inside the browser runtime.'
    }
  }

  const exitCode = await cheerpjWindow.cheerpjRunMain('Harness', JAVA_WORK_DIR)
  const resultText = await readVirtualFile(JAVA_RESULT_PATH)
  const errorText = await readVirtualFile(JAVA_ERROR_PATH)

  return {
    ok: exitCode === 0 && !errorText.trim(),
    stdout: resultText.trim(),
    stderr: errorText.trim(),
    exitCode,
    error: exitCode === 0 && !errorText.trim()
      ? ''
      : (errorText.trim() || `Java program exited with code ${exitCode}.`)
  }
}

/**
 * @param {{ lib: any, compilerStream: any }} options
 */
async function compileJavaSources({ lib, compilerStream }) {
  const toolProvider = await lib.javax.tools.ToolProvider
  const systemCompiler = await toolProvider.getSystemJavaCompiler()

  if (systemCompiler) {
    const compileExitCode = await systemCompiler.run(
      null,
      compilerStream,
      compilerStream,
      '-source',
      '1.8',
      '-target',
      '1.8',
      '-d',
      JAVA_WORK_DIR,
      JAVA_SOLUTION_PATH,
      JAVA_HARNESS_PATH
    )
    return compileExitCode === 0
  }

  const compileExitCode = await runEcjCompilerMain()
  return compileExitCode === 0
}

async function runEcjCompilerMain() {
  const cheerpjWindow = getCheerpjWindow()

  if (!cheerpjWindow.cheerpjRunMain) {
    throw new Error('CheerpJ loaded, but the Java main-entry runtime is unavailable.')
  }

  await ensureEcjCompilerJar()

  return cheerpjWindow.cheerpjRunMain(
    'org.eclipse.jdt.internal.compiler.batch.Main',
    ECJ_VFS_PATH,
    '-proc:none',
    '-source', '1.8',
    '-target', '1.8',
    '-d', JAVA_WORK_DIR,
    JAVA_SOLUTION_PATH,
    JAVA_HARNESS_PATH
  )
}

async function ensureEcjCompilerJar() {
  const cheerpjWindow = getCheerpjWindow()

  if (!cheerpjWindow.__dsaCheerpjCompilerJarPromise) {
    cheerpjWindow.__dsaCheerpjCompilerJarPromise = (async () => {
      const response = await fetch(ECJ_ASSET_URL)
      if (!response.ok) {
        throw new Error(`Failed to load the bundled ECJ compiler jar: ${response.status} ${response.statusText}`)
      }

      if (!cheerpjWindow.cheerpOSAddStringFile) {
        throw new Error('CheerpJ loaded, but the compiler fallback APIs are unavailable.')
      }

      const jarBytes = new Uint8Array(await response.arrayBuffer())
      cheerpjWindow.cheerpOSAddStringFile(ECJ_VFS_PATH, jarBytes)
    })()
  }

  compilerJarPromise = cheerpjWindow.__dsaCheerpjCompilerJarPromise
  return compilerJarPromise
}

/**
 * @param {any} lib
 * @param {string} path
 */
async function ensureWritableDirectory(lib, path) {
  const File = await lib.java.io.File
  const directory = await new File(path)
  await directory.mkdirs()
}

/** @param {string} path */
async function readVirtualFile(path) {
  try {
    const cheerpjWindow = getCheerpjWindow()
    if (!cheerpjWindow.cjFileBlob) return ''

    const blob = await cheerpjWindow.cjFileBlob(path)
    return await blob.text()
  } catch {
    return ''
  }
}
