import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { AuthController } from '../auth.controller'
import { AuthService } from '../auth.service'
import { Context } from 'hono'
import { ZodError } from 'zod'
import { LoginRequestSchema, RegisterRequestSchema } from '../types'
import { UserService } from '../../user/user.service'
import { User } from '@packages/prisma'

// Mock the UserService
vi.mock('../../user/user.service', () => ({
  UserService: {
    getUserByEmail: vi.fn()
  }
}))

// Mock the AuthService
vi.mock('../auth.service', () => ({
  AuthService: {
    loginWithEmailPassword: vi.fn(),
    signUpWithEmailPassword: vi.fn()
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
      vi.mocked(AuthService.loginWithEmailPassword).mockResolvedValue(mockToken)

      // Act
      const result = await AuthController.handleLogin(mockContext)

      // Assert
      expect(mockContext.req.json).toHaveBeenCalledTimes(1)
      expect(AuthService.loginWithEmailPassword).toHaveBeenCalledWith(email, password)
      expect(result).toEqual({ token: mockToken })
    })

    it('should return an error when login fails due to invalid credentials', async () => {
      // Arrange
      const email = 'test@example.com'
      const password = 'wrong-password'
      const errorMessage = 'Invalid email or password'

      // Setup mocks
      mockContext.req.json = vi.fn().mockResolvedValue({ email, password })
      vi.mocked(AuthService.loginWithEmailPassword).mockRejectedValue(new Error(errorMessage))

      // Act
      const result = await AuthController.handleLogin(mockContext)

      // Assert
      expect(mockContext.req.json).toHaveBeenCalledTimes(1)
      expect(AuthService.loginWithEmailPassword).toHaveBeenCalledWith(email, password)
      expect(result).toEqual({ error: errorMessage })
    })

    it('should return an error when login fails due to email not verified', async () => {
      // Arrange
      const email = 'test@example.com'
      const password = 'password123'
      const errorMessage = 'Email not verified'

      // Setup mocks
      mockContext.req.json = vi.fn().mockResolvedValue({ email, password })

      // Need to mock AuthService to throw the appropriate error
      vi.mocked(AuthService.loginWithEmailPassword).mockRejectedValue(new Error(errorMessage))

      // Note: We don't need to mock UserService.getUserByEmail here since the controller
      // doesn't directly use it - that would be part of the AuthService's implementation

      // Act
      const result = await AuthController.handleLogin(mockContext)

      // Assert
      expect(mockContext.req.json).toHaveBeenCalledTimes(1)
      expect(AuthService.loginWithEmailPassword).toHaveBeenCalledWith(email, password)
      expect(result).toEqual({ error: errorMessage })
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
      vi.mocked(AuthService.signUpWithEmailPassword).mockResolvedValue(mockToken)

      // Act
      const result = await AuthController.handleRegister(mockContext)

      // Assert
      expect(mockContext.req.json).toHaveBeenCalledTimes(1)
      expect(AuthService.signUpWithEmailPassword).toHaveBeenCalledWith(email, password, name)
      expect(result).toEqual({ token: mockToken, emailVerificationNeeded: false })
    })

    it('should return an error when registration fails due to existing user', async () => {
      // Arrange
      const email = 'existing@example.com'
      const password = 'password123'
      const name = 'Existing User'
      const errorMessage = 'User already exists'

      // Setup mocks
      mockContext.req.json = vi.fn().mockResolvedValue({ email, password, name })
      vi.mocked(AuthService.signUpWithEmailPassword).mockRejectedValue(new Error(errorMessage))

      // Act
      const result = await AuthController.handleRegister(mockContext)

      // Assert
      expect(mockContext.req.json).toHaveBeenCalledTimes(1)
      expect(AuthService.signUpWithEmailPassword).toHaveBeenCalledWith(email, password, name)
      expect(result).toEqual({ error: errorMessage })
    })

  })
}) 