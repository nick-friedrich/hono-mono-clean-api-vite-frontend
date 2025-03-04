import { describe, it, expect, vi, beforeEach } from 'vitest'
import { UserService } from '../user.service'
import { User } from '@packages/prisma'

// Mock the Prisma client
vi.mock('@packages/prisma', () => {
  return {
    db: {
      user: {
        findUnique: vi.fn(),
        create: vi.fn()
      }
    },
    User: vi.fn()
  }
})

// Import mocked modules
import { db } from '@packages/prisma'

describe('UserService', () => {
  const mockUser: User = {
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

  const mockUserNoName: User = {
    ...mockUser,
    name: ''
  }

  const mockUserNoEmail: User = {
    ...mockUser,
    email: ''
  }

  const mockUserNoPassword: User = {
    ...mockUser,
    password: ''
  }

  const mockUserNoEmailVerificationToken: User = {
    ...mockUser,
    emailVerificationToken: null
  }




  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getUserById', () => {
    it('should return a user when found by ID', async () => {
      // Arrange
      vi.mocked(db.user.findUnique).mockResolvedValue(mockUser)

      // Act
      const result = await UserService.getUserById('user-123')

      // Assert
      expect(db.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-123' }
      })
      expect(result).toEqual(mockUser)
    })

    it('should return null when user is not found by ID', async () => {
      // Arrange
      vi.mocked(db.user.findUnique).mockResolvedValue(null)

      // Act
      const result = await UserService.getUserById('non-existent-id')

      // Assert
      expect(db.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'non-existent-id' }
      })
      expect(result).toBeNull()
    })
  })

  describe('getUserByEmail', () => {
    it('should return a user when found by email', async () => {
      // Arrange
      vi.mocked(db.user.findUnique).mockResolvedValue(mockUser)

      // Act
      const result = await UserService.getUserByEmail('test@example.com')

      // Assert
      expect(db.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' }
      })
      expect(result).toEqual(mockUser)
    })

    it('should return null when user is not found by email', async () => {
      // Arrange
      vi.mocked(db.user.findUnique).mockResolvedValue(null)

      // Act
      const result = await UserService.getUserByEmail('non-existent@example.com')

      // Assert
      expect(db.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'non-existent@example.com' }
      })
      expect(result).toBeNull()
    })
  })

  describe('createUser', () => {
    it('should create and return a new user', async () => {
      // Arrange
      const newUser: User = {
        id: 'new-user-123',
        email: 'newuser@example.com',
        name: 'New User',
        password: 'hashed-password',
        createdAt: new Date(),
        updatedAt: new Date(),
        emailVerificationToken: null,
        emailVerificationTokenExpiresAt: null,
        emailVerifiedAt: null
      }

      vi.mocked(db.user.create).mockResolvedValue(newUser)

      // Act
      const result = await UserService.createUser(newUser)

      // Assert
      expect(db.user.create).toHaveBeenCalledWith({
        data: newUser
      })
      expect(result).toEqual(newUser)
    })

    it('should throw an error when email is not provided', async () => {
      // Act & Assert
      await expect(UserService.createUser(mockUserNoEmail)).rejects.toThrow('Email is required')
    })

    it('should use the email part before the @ as the name if no name is provided', async () => {
      // Act
      const result = await UserService.createUser(mockUserNoName)
      // Assert
      expect(result.name).toEqual('New User')
    })
  })
}) 