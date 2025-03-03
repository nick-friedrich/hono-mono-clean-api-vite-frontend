import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { AuthController } from '../auth.controller'
import { AuthService } from '../auth.service'
import { Context } from 'hono'
import { ZodError } from 'zod'
import { LoginRequestSchema, RegisterRequestSchema } from '../types'

// Mock the AuthService
vi.mock('../auth.service', () => ({
  AuthService: {
    login: vi.fn(),
    register: vi.fn()
  }
}))

// Mock console methods to prevent noise during tests
vi.spyOn(console, 'warn').mockImplementation(() => { })
vi.spyOn(console, 'error').mockImplementation(() => { })

describe('AuthController', () => {
  let mockContext: Context

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks()

    // Create a mock context
    mockContext = {
      req: {
        json: vi.fn()
      }
    } as unknown as Context
  })

  describe('handleLogin', () => {
    it('should return a token when login is successful', async () => {
      // Arrange
      const email = 'test@example.com'
      const password = 'password123'
      const mockToken = 'mock-jwt-token'

      // Setup mocks
      mockContext.req.json = vi.fn().mockResolvedValue({ email, password })
      vi.mocked(AuthService.login).mockResolvedValue(mockToken)

      // Act
      const result = await AuthController.handleLogin(mockContext)

      // Assert
      expect(mockContext.req.json).toHaveBeenCalledTimes(1)
      expect(AuthService.login).toHaveBeenCalledWith(email, password)
      expect(result).toEqual({ token: mockToken })
    })

    it('should return an error when login fails due to invalid credentials', async () => {
      // Arrange
      const email = 'test@example.com'
      const password = 'wrong-password'

      // Setup mocks
      mockContext.req.json = vi.fn().mockResolvedValue({ email, password })
      vi.mocked(AuthService.login).mockRejectedValue(new Error('Invalid email or password'))

      // Act
      const result = await AuthController.handleLogin(mockContext)

      // Assert
      expect(mockContext.req.json).toHaveBeenCalledTimes(1)
      expect(AuthService.login).toHaveBeenCalledWith(email, password)
      expect(result).toEqual({ error: 'Invalid email or password' })
    })

    it('should return an error when request validation fails', async () => {
      // Arrange
      mockContext.req.json = vi.fn().mockResolvedValue({
        email: 'invalid-email',
        password: 'short'
      })

      // Directly mock the schema parse function
      const parseOriginal = LoginRequestSchema.parse;
      LoginRequestSchema.parse = vi.fn().mockImplementation(() => {
        throw new Error('Validation error');
      });

      // Act
      const result = await AuthController.handleLogin(mockContext)

      // Assert
      expect(result).toEqual({ error: 'Validation error' })
      expect(console.warn).not.toHaveBeenCalled() // No longer a ZodError

      // Restore original
      LoginRequestSchema.parse = parseOriginal;
    })
  })

  describe('handleRegister', () => {
    it('should return a token when registration is successful', async () => {
      // Arrange
      const email = 'newuser@example.com'
      const password = 'password123'
      const name = 'New User'
      const mockToken = 'mock-jwt-token'

      // Setup mocks
      mockContext.req.json = vi.fn().mockResolvedValue({ email, password, name })
      vi.mocked(AuthService.register).mockResolvedValue(mockToken)

      // Act
      const result = await AuthController.handleRegister(mockContext)

      // Assert
      expect(mockContext.req.json).toHaveBeenCalledTimes(1)
      expect(AuthService.register).toHaveBeenCalledWith(email, password, name)
      expect(result).toEqual({ token: mockToken })
    })

    it('should return an error when registration fails due to existing user', async () => {
      // Arrange
      const email = 'existing@example.com'
      const password = 'password123'

      // Setup mocks
      mockContext.req.json = vi.fn().mockResolvedValue({ email, password })
      vi.mocked(AuthService.register).mockRejectedValue(new Error('User already exists'))

      // Act
      const result = await AuthController.handleRegister(mockContext)

      // Assert
      expect(mockContext.req.json).toHaveBeenCalledTimes(1)
      expect(AuthService.register).toHaveBeenCalledWith(email, password, undefined)
      expect(result).toEqual({ error: 'User already exists' })
    })

    it('should return an error when request validation fails', async () => {
      // Arrange
      mockContext.req.json = vi.fn().mockResolvedValue({
        email: 'invalid-email',
        password: 'short'
      })

      // Directly mock the schema parse function
      const parseOriginal = RegisterRequestSchema.parse;
      RegisterRequestSchema.parse = vi.fn().mockImplementation(() => {
        throw new Error('Validation error');
      });

      // Act
      const result = await AuthController.handleRegister(mockContext)

      // Assert
      expect(result).toEqual({ error: 'Validation error' })

      // Restore original
      RegisterRequestSchema.parse = parseOriginal;
    })
  })

  describe('handleError', () => {
    it('should log unexpected errors with stack trace', async () => {
      // Arrange
      const unexpectedError = new Error('Unexpected database error')

      // Setup mock for the context
      mockContext.req.json = vi.fn().mockResolvedValue({ email: 'test@example.com', password: 'password123' })

      // Need to mock schema.parse to not interfere with this test
      const parseOriginal = LoginRequestSchema.parse;
      LoginRequestSchema.parse = vi.fn().mockReturnValue({ email: 'test@example.com', password: 'password123' });

      vi.mocked(AuthService.login).mockRejectedValue(unexpectedError)

      // Act
      const result = await AuthController.handleLogin(mockContext)

      // Assert
      expect(result).toEqual({ error: 'Unexpected database error' })
      expect(console.error).toHaveBeenCalled()

      // Restore original
      LoginRequestSchema.parse = parseOriginal;
    })

    it('should handle non-Error objects', async () => {
      // Arrange
      const nonError = 'Just a string error'

      // Setup mocks for testing private method via public method
      mockContext.req.json = vi.fn().mockResolvedValue({ email: 'test@example.com', password: 'password123' })

      // Need to mock schema.parse to not interfere with this test
      const parseOriginal = LoginRequestSchema.parse;
      LoginRequestSchema.parse = vi.fn().mockReturnValue({ email: 'test@example.com', password: 'password123' });

      vi.mocked(AuthService.login).mockRejectedValue(nonError)

      // Act
      const result = await AuthController.handleLogin(mockContext)

      // Assert
      expect(result).toEqual({ error: 'Authentication failed' })

      // Restore original
      LoginRequestSchema.parse = parseOriginal;
    })
  })
}) 