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
    getUserByEmail: vi.fn(),
    getUserByVerificationToken: vi.fn(),
    updateUser: vi.fn()
  }
}))

// Mock the AuthService
vi.mock('../auth.service', () => ({
  AuthService: {
    loginWithEmailPassword: vi.fn(),
    signUpWithEmailPassword: vi.fn(),
    verifyEmail: vi.fn()
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
        json: vi.fn(),
        query: vi.fn()
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

    it('should return zoderror if email is not provided', async () => {
      // Arrange
      const email = ''
      const password = 'password123'
      const mockBody = { email, password }
      mockContext.req.json = vi.fn().mockResolvedValue(mockBody)
      // Act
      const result = await AuthController.handleLogin(mockContext)

      // Assert
      expect(mockContext.req.json).toHaveBeenCalledTimes(1)
      expect(AuthService.loginWithEmailPassword).not.toHaveBeenCalled()
      expect(result).toEqual({ error: 'email: Invalid email format' })
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
      vi.mocked(AuthService.signUpWithEmailPassword).mockResolvedValue({ token: mockToken, emailVerificationNeeded: false })

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

    it('should return zoderror if email is not provided', async () => {
      // Arrange
      const email = ''
      const password = 'password123'
      const mockBody = { email, password }
      mockContext.req.json = vi.fn().mockResolvedValue(mockBody)
      // Act
      const result = await AuthController.handleRegister(mockContext)

      // Assert
      expect(mockContext.req.json).toHaveBeenCalledTimes(1)
      expect(AuthService.signUpWithEmailPassword).not.toHaveBeenCalled()
      expect(result).toEqual({ error: 'email: Invalid email format' })
    })

    it('should return zoderror if password is not provided', async () => {
      // Arrange
      const email = 'newuser@example.com'
      const password = ''
      const mockBody = { email, password }
      mockContext.req.json = vi.fn().mockResolvedValue(mockBody)
      // Act
      const result = await AuthController.handleRegister(mockContext)

      // Assert
      expect(mockContext.req.json).toHaveBeenCalledTimes(1)
      expect(AuthService.signUpWithEmailPassword).not.toHaveBeenCalled()
      expect(result).toEqual({ error: 'password: Password must be at least 8 characters' })
    })

  })


  describe('handleVerifyEmail', () => {
    it('should return success when email is verified', async () => {
      // Arrange
      const token = 'valid-token'
      const mockUser: User = {
        id: 'user-123',
        email: 'test@example.com',
        emailVerifiedAt: null,
        emailVerificationToken: token,
        emailVerificationTokenExpiresAt: null,
        name: 'Test User',
        password: 'password123',
        createdAt: new Date(),
        updatedAt: new Date()
      }

      // Fixed function signature to match Hono's Context.req.query
      mockContext.req.query = vi.fn() as unknown as {
        (key: string): string | undefined;
        (): Record<string, string>;
      };

      // Then implement the mock behavior
      (mockContext.req.query as any).mockImplementation((param?: string) => {
        if (param === 'token') return token;
        if (!param) return {}; // Return empty record when called with no args
        return undefined;
      });

      // Mock the user service methods
      vi.mocked(UserService.getUserByVerificationToken).mockResolvedValue(mockUser)
      vi.mocked(UserService.updateUser).mockResolvedValue(mockUser)

      // Mock the AuthService.verifyEmail method which is actually called
      vi.mocked(AuthService.verifyEmail).mockResolvedValue(true);

      // Act
      const result = await AuthController.handleVerifyEmail(mockContext)

      // Assert
      // Remove this expectation since req.json() isn't called
      // expect(mockContext.req.json).toHaveBeenCalledTimes(1)

      // Instead test that the query parameter was accessed
      expect(mockContext.req.query).toHaveBeenCalledWith('token')

      // And that the AuthService method was called with the token
      expect(AuthService.verifyEmail).toHaveBeenCalledWith(token)

      // The success response should be returned
      expect(result).toEqual({ success: true })
    })

    it('should return error when token is not provided', async () => {
      // Arrange
      const token = ''
      mockContext.req.query = vi.fn() as unknown as {
        (key: string): string | undefined;
        (): Record<string, string>;
      };
      // Act
      const result = await AuthController.handleVerifyEmail(mockContext)

      // Assert
      expect(mockContext.req.query).toHaveBeenCalledWith('token')
      expect(result).toEqual({ success: false, error: 'Token is required' })
      expect(AuthService.verifyEmail).not.toHaveBeenCalled()

    })

    it('should return error when token is invalid', async () => {
      // Arrange
      const token = 'invalid-token'
      const errorMessage = 'Invalid or expired verification token'

      // Setup mocks
      mockContext.req.query = vi.fn() as unknown as {
        (key: string): string | undefined;
        (): Record<string, string>;
      };
      (mockContext.req.query as any).mockImplementation((param?: string) => {
        if (param === 'token') return token;
        if (!param) return {}; // Return empty record when called with no args
        return undefined;
      });

      // Mock the user service methods
      vi.mocked(UserService.getUserByVerificationToken).mockRejectedValue(new Error(errorMessage))

      // Act
      const result = await AuthController.handleVerifyEmail(mockContext)

      // Assert
      expect(mockContext.req.query).toHaveBeenCalledWith('token')
      expect(result).toEqual({ success: false, error: errorMessage })
      expect(AuthService.verifyEmail).not.toHaveBeenCalled()

    })

    it('should return error when token is expired', async () => {
      // Arrange
      const token = 'expired-token'
      const errorMessage = 'Verification token has expired'

      const mockUser: User = {
        id: 'user-123',
        email: 'test@example.com',
        emailVerifiedAt: null,
        emailVerificationToken: token,
        emailVerificationTokenExpiresAt: new Date(Date.now() - 1000),
        name: 'Test User',
        password: 'password123',
        createdAt: new Date(),
        updatedAt: new Date()
      }
      // Setup mocks
      mockContext.req.query = vi.fn() as unknown as {
        (key: string): string | undefined;
        (): Record<string, string>;
      };
      (mockContext.req.query as any).mockImplementation((param?: string) => {
        if (param === 'token') return token;
        if (!param) return {}; // Return empty record when called with no args
        return undefined;
      });

      // Mock the user service methods
      vi.mocked(UserService.getUserByVerificationToken).mockResolvedValue(mockUser)
      vi.mocked(UserService.updateUser).mockRejectedValue(new Error(errorMessage))

      // Act
      const result = await AuthController.handleVerifyEmail(mockContext)

      // Assert
      expect(mockContext.req.query).toHaveBeenCalledWith('token')
      expect(result).toEqual({ success: false, error: errorMessage })
      expect(AuthService.verifyEmail).not.toHaveBeenCalled()

    })
  })
}) 