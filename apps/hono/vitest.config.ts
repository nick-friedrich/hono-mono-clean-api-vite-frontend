import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    exclude: ['node_modules', 'dist', 'coverage', '**/coverage/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'vitest.config.ts',
        '**/*.config.ts',
        '**/*.config.js',
        '**/*.test.ts',
        'coverage',
        'coverage/**',
        '**/coverage/**',
        'dist',
        'node_modules',
        'tests',
        // Exclude coverage report files
        'sorter.js',
        'prettify.js',
        'block-navigation.js'
      ]
    }
  }
}) 