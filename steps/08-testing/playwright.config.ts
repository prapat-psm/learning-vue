import { defineConfig, devices } from '@playwright/test'

/**
 * E2E = the real built app in a real browser. Few tests, only the flows that must never break.
 * Each test gets a fresh browser context → empty localStorage → fresh mock database.
 * https://playwright.dev/docs/test-configuration
 */
const PORT = 4178

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI, // a stray test.only fails CI
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'on-first-retry', // open with `npx playwright show-trace` when CI fails
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  // Test the PRODUCTION build (vite build + preview), not the dev server
  webServer: {
    command: `npm run build-only && npx vite preview --port ${PORT} --strictPort`,
    port: PORT,
    reuseExistingServer: !process.env.CI,
  },
})
