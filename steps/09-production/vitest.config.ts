import { fileURLToPath } from 'node:url'
import { mergeConfig, defineConfig, configDefaults } from 'vitest/config'
import viteConfig from './vite.config.ts'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      exclude: [...configDefaults.exclude, 'e2e/**'],
      root: fileURLToPath(new URL('./', import.meta.url)),
      coverage: {
        provider: 'v8',
        // Only THIS step's app code. Test helpers, mocks and the playground are not "the product".
        include: ['src/**/*.{ts,vue}'],
        exclude: [
          'src/**/__tests__/**',
          'src/test/**',
          'src/mocks/**',
          'src/playground/**',
          'src/main.ts',
          'src/types.ts',
        ],
        reporter: ['text', 'html'], // html → coverage/index.html
        // CI fails if coverage drops below these. Pick numbers you already meet, then ratchet up.
        thresholds: { lines: 95, functions: 90, branches: 85, statements: 95 },
      },
    },
  }),
)
