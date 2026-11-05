import { fileURLToPath, URL } from 'node:url'
import path from 'node:path'

import { defineConfig, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

const ownSrc = fileURLToPath(new URL('./src', import.meta.url))

/**
 * '@/x' normally means "this app's src/x". The Playground imports files from other
 * step folders, and THEIR '@/x' must mean THEIR src. This resolves '@/' relative to
 * the step folder of the importing file.
 */
function stepAwareAlias(): Plugin {
  return {
    name: 'step-aware-alias',
    enforce: 'pre',
    async resolveId(source, importer) {
      if (!source.startsWith('@/')) return null
      const stepRoot = importer?.match(/^(.*[\\/]steps[\\/]\d{2}-[^\\/]+)[\\/]/)?.[1]
      const src = stepRoot ? path.join(stepRoot, 'src') : ownSrc
      return this.resolve(path.join(src, source.slice(2)), importer, { skipSelf: true })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [stepAwareAlias(), vue(), vueDevTools()],
})
