import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: [
      // Include tests from all packages and apps
      'apps/*/src/**/*.test.ts',
      'packages/*/tests/**/*.test.ts',
      'packages/*/**/*.test.ts'
    ],
    exclude: [
      'node_modules',
      '**/node_modules/**',
      'dist',
      'coverage',
      '**/coverage/**'
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        '**/node_modules/**',
        'dist/',
        '**/*.d.ts',
        '**/vitest.config.ts',
        '**/*.config.ts',
        '**/*.config.js',
        '**/tests/**',
        'coverage/',
        '**/coverage/**',
        'apps/**/coverage/**',
        'packages/**/coverage/**',
        // Exclude coverage report files
        'sorter.js',
        'prettify.js',
        'block-navigation.js',
        'coverage/*.js'
      ],
      // Merge coverage reports from all packages
      all: true
    }
  }
}) 