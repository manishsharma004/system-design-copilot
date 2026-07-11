/** Minimal VS Code-style codicon SVG strings (16x16 viewBox). */

const SVG_ATTRS = 'width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"'

/** @type {Record<string, string>} */
export const codicons = {
  folder: `<svg ${SVG_ATTRS}><path d="M14.5 3H7.71l-.85-.85L6.51 2h-5l-.5.5v11l.5.5h13l.5-.5v-10l-.5-.5zm-.51 10.5H1.99V3.5h4.29l.85.85.85-.85H14v9.5z"/></svg>`,
  'folder-opened': `<svg ${SVG_ATTRS}><path d="M1.5 2.5h4.59l.85.85.85-.85H14.5v8.5h-13V2.5zm0-1A.5.5 0 0 0 1 2v9.5l.5.5h13l.5-.5V2.5l-.5-.5H7.21l-.85-.85L5.71 1H1.5l-.5.5z"/></svg>`,
  file: `<svg ${SVG_ATTRS}><path d="M13.71 4.29l-3-3L10 1H4L3.5 1.5v13l.5.5h9l.5-.5v-10l-.29-.71zM10 2l2 2h-2V2zM4 14V2h5v3.5l.5.5H13v8H4z"/></svg>`,
  json: `<svg ${SVG_ATTRS}><path d="M4.5 3h7A1.5 1.5 0 0 1 13 4.5v7a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 3 11.5v-7A1.5 1.5 0 0 1 4.5 3zm0 1a.5.5 0 0 0-.5.5v7a.5.5 0 0 0 .5.5h7a.5.5 0 0 0 .5-.5v-7a.5.5 0 0 0-.5-.5h-7zM6 6h1v4H6V6zm3 0h1v4H9V6z"/></svg>`,
  markdown: `<svg ${SVG_ATTRS}><path d="M4.5 3h7A1.5 1.5 0 0 1 13 4.5v7a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 3 11.5v-7A1.5 1.5 0 0 1 4.5 3zm0 1a.5.5 0 0 0-.5.5v7a.5.5 0 0 0 .5.5h7a.5.5 0 0 0 .5-.5v-7a.5.5 0 0 0-.5-.5h-7zM5 6.5h1.5L7.5 9l1-2.5H10v3H9V7.5L7.5 10 6 7.5V9.5H5v-3z"/></svg>`,
  typescript: `<svg ${SVG_ATTRS}><path d="M4.5 3h7A1.5 1.5 0 0 1 13 4.5v7a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 3 11.5v-7A1.5 1.5 0 0 1 4.5 3zm0 1a.5.5 0 0 0-.5.5v7a.5.5 0 0 0 .5.5h7a.5.5 0 0 0 .5-.5v-7a.5.5 0 0 0-.5-.5h-7zM6 6h3.5v1H7v1h2v1H7v1.5H6V6z"/></svg>`,
  flow: `<svg ${SVG_ATTRS}><path d="M3 4h3v2H5v2h1v2H3V4zm7 0h3v6h-3v-2h1V8h-1V6h1V4zM7 8h2v2H7V8z"/></svg>`,
  'chevron-right': `<svg ${SVG_ATTRS}><path d="M6 4l4 4-4 4V4z"/></svg>`,
  'new-file': `<svg ${SVG_ATTRS}><path d="M13.71 4.29l-3-3L10 1H4L3.5 1.5v13l.5.5h9l.5-.5v-10l-.29-.71zM10 2l2 2h-2V2zM4 14V2h5v3.5l.5.5H13v8H4zm1-5h4v1H5V9z"/></svg>`,
  'new-folder': `<svg ${SVG_ATTRS}><path d="M14.5 3H7.71l-.85-.85L6.51 2h-5l-.5.5v11l.5.5h13l.5-.5v-10l-.5-.5zm-.51 10.5H1.99V3.5h4.29l.85.85.85-.85H14v9.5zM8 7v2h2v1H8v2H7v-2H5V9h2V7h1z"/></svg>`,
  collapse: `<svg ${SVG_ATTRS}><path d="M3 5h10v1H3V5zm0 3h10v1H3V8zm0 3h6v1H3v-1z"/></svg>`,
  edit: `<svg ${SVG_ATTRS}><path d="M11.5 1.5l3 3L5 14H2v-3L11.5 1.5zm1.06 1.06L12 3l1.44 1.44-1.06 1.06L11.56 3.5l-1.06-1.06zM3 12.5V13h.5L11 5.5l-.5-.5L3 12.5z"/></svg>`,
  trash: `<svg ${SVG_ATTRS}><path d="M6 2h4l.5.5.5.5H13v1H3V3h2.5L6 2zm1 4h1v6H7V6zm3 0h1v6h-1V6zM4 6h1v7l.5.5h5l.5-.5V6h1v7.5l-.5.5h-6l-.5-.5V6z"/></svg>`,
  close: `<svg ${SVG_ATTRS}><path d="M3.72 3.72l.708-.708L8 6.586l3.572-3.574.708.708L8.707 7.293l3.573 3.572-.708.708L8 8.707l-3.572 3.573-.708-.708L7.293 8 3.72 4.428z"/></svg>`,
  add: `<svg ${SVG_ATTRS}><path d="M8 3v5H3v1h5v5h1V9h5V8H9V3H8z"/></svg>`,
  link: `<svg ${SVG_ATTRS}><path d="M6.5 4.5A3.5 3.5 0 0 1 10 8h1a4.5 4.5 0 1 0 0-9H8v1h3a3.5 3.5 0 0 1-2.5 6H10a2.5 2.5 0 1 1 0-5H8v1h2a1.5 1.5 0 0 0 0-3H6.5z"/></svg>`,
  'grabber': `<svg ${SVG_ATTRS}><path d="M5 4h1v1H5V4zm0 2h1v1H5V6zm0 2h1v1H5V8zm2-4h1v1H7V4zm0 2h1v1H7V6zm0 2h1v1H7V8zm2-4h1v1H9V4zm0 2h1v1H9V6zm0 2h1v1H9V8z"/></svg>`,
  'debug-alt': `<svg ${SVG_ATTRS}><path d="M8 2a6 6 0 1 0 0 12A6 6 0 0 0 8 2zm0 1a5 5 0 1 1 0 10A5 5 0 0 1 8 3zm-.5 2v4.5l3.5 2 .5-.87-3-1.71V5H7.5z"/></svg>`,
  warning: `<svg ${SVG_ATTRS}><path d="M8 1.5l6.5 11H1.5L8 1.5zm0 2.2L3.8 11.5h8.4L8 3.7zM7.25 6h1.5v3h-1.5V6zm0 4h1.5v1h-1.5v-1z"/></svg>`,
  files: `<svg ${SVG_ATTRS}><path d="M3 2h4l1 1h7l1 1v9l-1 1H3l-1-1V3l1-1zm0 1v10h10V5H7L6 4H3z"/></svg>`,
  fullscreen: `<svg ${SVG_ATTRS}><path d="M2 9V2h7v1H3v7H2zm7-7h7v7h-1V3H9V2zm5 12v-7h1v7H7v1h7zM2 12h1v3h3v1H2v-4z"/></svg>`,
  'fullscreen-exit': `<svg ${SVG_ATTRS}><path d="M2 8V2h6v1H3v5H2zm8-6h6v6h-1V3H10V2zM8 10v6H2v-1h5v-5h1zm8 0h1v5h-5v1h4v-6z"/></svg>`
}

/** @param {string} name @param {string} [language] @param {boolean} [isFolder] */
export function fileCodicon(name, language, isFolder = false) {
  if (isFolder) return 'folder'
  if (language === 'json' || name.endsWith('.json')) return 'json'
  if (language === 'markdown' || name.endsWith('.md')) return 'markdown'
  if (language === 'typescript' || name.endsWith('.ts')) return 'typescript'
  if (language === 'flow-graph' || name.endsWith('.flow')) return 'flow'
  return 'file'
}

/** @param {string} name */
export function codiconSvg(name) {
  return codicons[name] ?? codicons.file
}
