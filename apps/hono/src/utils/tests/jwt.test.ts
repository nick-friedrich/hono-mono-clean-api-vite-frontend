import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { generateJWT, verifyJWT, JWTPayload } from '../jwt'

// Mock the Hono JWT functions
vi.mock('hono/jwt', () => ({
  sign: vi.fn().mockResolvedValue('mock-jwt-token'),
  verify: vi.fn().mockResolvedValue({ sub: 'user-123', email: 'test@example.com' })
}))

// Import the mocked module
import * as honoJwt from 'hono/jwt'

describe('JWT Utilities', () => {
  const originalEnv = { ...process.env }
  const mockDate = new Date('2023-01-01T00:00:00Z')

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks()

    // Mock Date.now() to return a fixed timestamp
    vi.spyOn(Date, 'now').mockImplementation(() => mockDate.getTime())
  })

  afterEach(() => {
    // Restore environment variables and Date.now
    process.env = { ...originalEnv }
    vi.restoreAllMocks()
  })

  describe('generateJWT', () => {
    it('should generate a JWT token with the provided payload', async () => {
      const payload: JWTPayload = {
        sub: 'user-123',
        email: 'test@example.com'
      }

      const token = await generateJWT(payload)

      // Check that the token was generated
      expect(token).toBe('mock-jwt-token')

      // Check that sign was called with the correct parameters
      expect(honoJwt.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          sub: 'user-123',
          email: 'test@example.com',
          iat: Math.floor(mockDate.getTime() / 1000),
          exp: Math.floor(mockDate.getTime() / 1000) + 24 * 60 * 60
        }),
        expect.any(String)
      )
    })

    it('should use custom expiry from environment variable', async () => {
      // Set custom expiry
      process.env.JWT_EXPIRY_SECONDS = '3600' // 1 hour

      const payload: JWTPayload = {
        sub: 'user-123',
        email: 'test@example.com'
      }

      await generateJWT(payload)

      // Check that sign was called with the correct expiry
      expect(honoJwt.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          exp: Math.floor(mockDate.getTime() / 1000) + 3600
        }),
        expect.any(String)
      )
    })

    it('should not override existing expiry in payload', async () => {
      const customExp = Math.floor(mockDate.getTime() / 1000) + 7200 // 2 hours
      const payload: JWTPayload = {
        sub: 'user-123',
        email: 'test@example.com',
        exp: customExp
      }

      await generateJWT(payload)

      // Check that sign was called with the existing expiry
      expect(honoJwt.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          exp: customExp
        }),
        expect.any(String)
      )
    })
  })

  describe('verifyJWT', () => {
    it('should verify a JWT token and return the payload', async () => {
      const expectedPayload = { sub: 'user-123', email: 'test@example.com' }
      vi.mocked(honoJwt.verify).mockResolvedValueOnce(expectedPayload)

      const token = 'valid-jwt-token'

      const payload = await verifyJWT(token)

      // Check that verify was called with the correct parameters
      expect(honoJwt.verify).toHaveBeenCalledWith(token, expect.any(String))

      // Check that the payload was returned
      expect(payload).toEqual(expectedPayload)
    })
  })
}) 