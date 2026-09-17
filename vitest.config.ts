import react from '@vitejs/plugin-react'
import { playwright } from '@vitest/browser-playwright'
import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

/*
 * Two projects, deliberately.
 *
 * Unit tests run in jsdom and are fast. The contrast suite runs in a REAL
 * browser, because the colour ladder lives in CSS — clamp() and calc() over
 * custom properties — and the only honest way to test it is to let a browser
 * do the deriving and read back what it paints. Re-implementing the ladder in
 * TypeScript would give two sources of truth for the thing the whole system
 * rests on.
 */
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          environment: 'jsdom',
          globals: true,
          css: true,
          setupFiles: ['./src/test/setup.ts'],
          include: ['src/**/*.test.{ts,tsx}'],
          exclude: ['src/**/*.browser.test.{ts,tsx}'],
        },
      },
      {
        extends: true,
        test: {
          name: 'colour',
          globals: true,
          css: true,
          include: ['src/**/*.browser.test.{ts,tsx}'],
          browser: {
            enabled: true,
            provider: playwright(),
            headless: true,
            instances: [{ browser: 'chromium' }],
          },
        },
      },
    ],
  },
})
