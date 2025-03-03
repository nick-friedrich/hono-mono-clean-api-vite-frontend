import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    exclude: ['node_modules', 'coverage', '**/coverage/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'vitest.config.ts',
        '**/*.config.ts',
        'tests/**',
        'coverage',
        '**/coverage/**',
        // Exclude coverage report files
        'sorter.js',
        'prettify.js',
        'block-navigation.js'
      ]
    }
  }
}) 