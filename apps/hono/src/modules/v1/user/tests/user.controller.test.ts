import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Context } from 'hono'
import { UserController } from '../user.controller'
import { UserService } from '../user.service'

// Mock the UserService
vi.mock('../user.service', () => ({
  UserService: {
    getUserById: vi.fn()
  }
}))

describe('UserController', () => {
  let mockContext: Context

  beforeEach(() => {
    vi.clearAllMocks()

    // Create a mock context with params
    mockContext = {
      req: {
        param: vi.fn().mockReturnValue('user-123')
      },
      get: vi.fn().mockReturnValue({
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User'
      })
    } as unknown as Context
  })

  describe('handleGetUser', () => {
    it('should return user details when user exists', async () => {
      // Arrange
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashed-password',
        createdAt: new Date(),
        updatedAt: new Date(),
        emailVerificationToken: null,
        emailVerificationTokenExpiresAt: null,
        emailVerifiedAt: new Date()
      }

      vi.mocked(UserService.getUserById).mockResolvedValue(mockUser)

      // Act
      const result = await UserController.handleGetUser(mockContext)

      // Assert
      expect(mockContext.req.param).toHaveBeenCalledWith('id')
      expect(UserService.getUserById).toHaveBeenCalledWith('user-123')
      expect(result).toEqual({
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User'
      })
    })

    it('should use email prefix as name when name is not provided', async () => {
      // Arrange
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        name: undefined, // Name not set
        password: 'hashed-password',
        createdAt: new Date(),
        updatedAt: new Date()
      }

      vi.mocked(UserService.getUserById).mockResolvedValue(mockUser as any)

      // Act
      const result = await UserController.handleGetUser(mockContext)

      // Assert
      expect(result).toEqual({
        id: 'user-123',
        email: 'test@example.com',
        name: 'test' // Email prefix
      })
    })

    it('should throw an error when user is not found', async () => {
      // Arrange
      vi.mocked(UserService.getUserById).mockResolvedValue(null)

      // Act & Assert
      await expect(UserController.handleGetUser(mockContext)).rejects.toThrow('User not found')
      expect(mockContext.req.param).toHaveBeenCalledWith('id')
      expect(UserService.getUserById).toHaveBeenCalledWith('user-123')
    })
  })

  describe('handleGetCurrentUser', () => {
    it('should return current user details', async () => {
      // Arrange
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashed-password',
        createdAt: new Date(),
        updatedAt: new Date(),
        emailVerificationToken: null,
        emailVerificationTokenExpiresAt: null,
        emailVerifiedAt: new Date()
      }

      vi.mocked(UserService.getUserById).mockResolvedValue(mockUser)

      // Act
      const result = await UserController.handleGetCurrentUser(mockContext)

      // Assert
      expect(result).toEqual({
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User'
      })
    })

    it('should throw an error when user is not found', async () => {
      // Arrange
      vi.mocked(UserService.getUserById).mockResolvedValue(null)
      vi.mocked(mockContext.get).mockReturnValue(null)

      // Act & Assert
      await expect(UserController.handleGetCurrentUser(mockContext)).rejects.toThrow('User not found')
    })
  })

}) 