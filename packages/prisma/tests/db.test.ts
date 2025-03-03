import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest'
import { db } from '../index'

// Mock the Prisma client
vi.mock('@prisma/client', () => {
  const mockPrismaClient = vi.fn().mockImplementation(() => ({
    $connect: vi.fn().mockResolvedValue(undefined),
    $disconnect: vi.fn().mockResolvedValue(undefined),
    $queryRaw: vi.fn().mockResolvedValue([{ result: 1 }]),
  }))

  return {
    PrismaClient: mockPrismaClient
  }
})

describe('Prisma Database', () => {
  beforeAll(async () => {
    // No need to connect since we're mocking, but keeping the structure
    // for completeness
  })

  afterAll(async () => {
    // No actual disconnection needed for mocked client
  })

  it('should have a valid Prisma instance', () => {
    expect(db).toBeDefined()
    expect(typeof db.$connect).toBe('function')
    expect(typeof db.$disconnect).toBe('function')
  })

  it('should execute raw queries', async () => {
    // Test a simple query
    const result = await db.$queryRaw`SELECT 1 as result`
    expect(result).toEqual([{ result: 1 }])
  })
}) 