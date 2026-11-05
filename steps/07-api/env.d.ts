/// <reference types="vite/client" />

// Typed env vars (step 09 goes deeper). Only VITE_* vars reach the browser bundle.
interface ImportMetaEnv {
  /** Real API base URL. Leave empty to use the MSW mock API in the browser. */
  readonly VITE_API_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
