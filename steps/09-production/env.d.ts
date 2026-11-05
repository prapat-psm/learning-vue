/// <reference types="vite/client" />

// Typed env vars. Validated at runtime in src/config.ts. Only VITE_* vars reach the browser.
interface ImportMetaEnv {
  /** Real API base URL. Leave empty to use the MSW mock API in the browser. */
  readonly VITE_API_URL?: string
  /** Shown in the browser tab. Default "Task Board". */
  readonly VITE_APP_TITLE?: string
  /** "false" to silence console error reports. Default "true". */
  readonly VITE_LOG_ERRORS?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
