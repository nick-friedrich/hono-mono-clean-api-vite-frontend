# Testing

This monorepo uses Vitest for testing. Tests can be run either individually for each package or app, or all at once from the root.

## Running Tests

### All Tests

To run all tests in the monorepo:

```bash
pnpm test
```

To run all tests with coverage:

```bash
pnpm test:coverage
```

To run tests in watch mode (for development):

```bash
pnpm test:watch
```

### Individual Packages

To run tests for specific packages:

- Backend (Hono API):

  ```bash
  pnpm test:backend
  ```

- Prisma Package:

  ```bash
  pnpm test:prisma
  ```

- Run all package tests individually:
  ```bash
  pnpm test:packages
  ```

## Test Structure

- **Unit Tests**: Located alongside the code they test, within a `tests` folder:

  ```
  modules/v1/health/tests/health.controller.test.ts
  ```

- **E2E Tests**: Located alongside the code they test, within a `tests` folder:

  ```
  modules/v1/health/tests/health.e2e.test.ts
  ```

- **Package Tests**: For packages like Prisma, located in a `tests` folder:
  ```
  packages/prisma/tests/db.test.ts
  ```

## Coverage Reports

After running tests with coverage, you can find the reports:

- HTML report: `coverage/index.html`
- JSON report: `coverage/coverage-final.json`
- Console report is displayed in the terminal

## Configuration

- Root configuration: `vitest.config.ts`
- Package-specific configurations:
  - `apps/hono/vitest.config.ts`
  - `packages/prisma/vitest.config.ts`
