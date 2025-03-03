import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { AuthService } from '../auth.service'
import { UserService } from '../../user/user.service'
import * as passwordUtils from '../../../../utils/password'
import * as jwtUtils from '../../../../utils/jwt'
import { User } from '@packages/prisma'

// Mock dependencies
vi.mock('../../user/user.service', () => ({
  UserService: {
    getUserByEmail: vi.fn(),
    createUser: vi.fn()
  }
}))

vi.mock('../../../../utils/password', () => ({
  hashPassword: vi.fn(),
  verifyPassword: vi.fn(),
  generateRandomPassword: vi.fn()
}))

vi.mock('../../../../utils/jwt', () => ({
  generateJWT: vi.fn()
}))

// Mock crypto
vi.mock('crypto', () => ({
  randomUUID: vi.fn().mockReturnValue('mock-uuid')
}))

describe('AuthService', () => {
  const mockUser: User = {
    id: 'user-123',
    email: 'test@example.com',
    password: 'hashed-password',
    name: 'Test User',
    createdAt: new Date(),
    updatedAt: new Date()
  }

  const mockToken = 'mock-jwt-token'

  beforeEach(() => {
    vi.clearAllMocks()

    // Mock current date
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2023-01-01'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('login', () => {
    it('should return a token when login credentials are valid', async () => {
      // Arrange
      const email = 'test@example.com'
      const password = 'password123'

      vi.mocked(UserService.getUserByEmail).mockResolvedValue(mockUser)
      vi.mocked(passwordUtils.verifyPassword).mockResolvedValue(true)
      vi.mocked(jwtUtils.generateJWT).mockResolvedValue(mockToken)

      // Act
      const result = await AuthService.login(email, password)

      // Assert
      expect(UserService.getUserByEmail).toHaveBeenCalledWith(email)
      expect(passwordUtils.verifyPassword).toHaveBeenCalledWith(password, mockUser.password)
      expect(jwtUtils.generateJWT).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email
      })
      expect(result).toBe(mockToken)
    })

    it('should throw an error when user is not found', async () => {
      // Arrange
      const email = 'nonexistent@example.com'
      const password = 'password123'

      vi.mocked(UserService.getUserByEmail).mockResolvedValue(null)

      // Act & Assert
      await expect(AuthService.login(email, password)).rejects.toThrow('Invalid email or password')
      expect(UserService.getUserByEmail).toHaveBeenCalledWith(email)
      expect(passwordUtils.verifyPassword).not.toHaveBeenCalled()
    })

    it('should throw an error when password is incorrect', async () => {
      // Arrange
      const email = 'test@example.com'
      const password = 'wrong-password'

      vi.mocked(UserService.getUserByEmail).mockResolvedValue(mockUser)
      vi.mocked(passwordUtils.verifyPassword).mockResolvedValue(false)

      // Act & Assert
      await expect(AuthService.login(email, password)).rejects.toThrow('Invalid email or password')
      expect(UserService.getUserByEmail).toHaveBeenCalledWith(email)
      expect(passwordUtils.verifyPassword).toHaveBeenCalledWith(password, mockUser.password)
      expect(jwtUtils.generateJWT).not.toHaveBeenCalled()
    })
  })

  describe('register', () => {
    it('should create a new user and return a token', async () => {
      // Arrange
      const email = 'newuser@example.com'
      const password = 'password123'
      const name = 'New User'
      const hashedPassword = 'hashed-password-123'

      vi.mocked(UserService.getUserByEmail).mockResolvedValue(null)
      vi.mocked(passwordUtils.hashPassword).mockResolvedValue(hashedPassword)
      vi.mocked(UserService.createUser).mockResolvedValue({
        ...mockUser,
        id: 'mock-uuid',
        email,
        name,
        password: hashedPassword
      })
      vi.mocked(jwtUtils.generateJWT).mockResolvedValue(mockToken)

      // Act
      const result = await AuthService.register(email, password, name)

      // Assert
      expect(UserService.getUserByEmail).toHaveBeenCalledWith(email)
      expect(passwordUtils.hashPassword).toHaveBeenCalledWith(password)
      expect(UserService.createUser).toHaveBeenCalledWith(expect.objectContaining({
        email,
        password: hashedPassword,
        name,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01')
      }))
      expect(jwtUtils.generateJWT).toHaveBeenCalledWith(expect.objectContaining({
        email
      }))
      expect(result).toBe(mockToken)
    })

    it('should use email prefix as name when name is not provided', async () => {
      // Arrange
      const email = 'newuser@example.com'
      const password = 'password123'
      const hashedPassword = 'hashed-password-123'

      vi.mocked(UserService.getUserByEmail).mockResolvedValue(null)
      vi.mocked(passwordUtils.hashPassword).mockResolvedValue(hashedPassword)
      vi.mocked(UserService.createUser).mockResolvedValue({
        ...mockUser,
        id: 'mock-uuid',
        email,
        name: 'newuser',
        password: hashedPassword
      })
      vi.mocked(jwtUtils.generateJWT).mockResolvedValue(mockToken)

      // Act
      const result = await AuthService.register(email, password)

      // Assert
      expect(UserService.createUser).toHaveBeenCalledWith(expect.objectContaining({
        email,
        password: hashedPassword,
        name: 'newuser',
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01')
      }))
      expect(result).toBe(mockToken)
    })

    it('should throw an error when user already exists', async () => {
      // Arrange
      const email = 'existing@example.com'
      const password = 'password123'

      vi.mocked(UserService.getUserByEmail).mockResolvedValue(mockUser)

      // Act & Assert
      await expect(AuthService.register(email, password)).rejects.toThrow('User already exists')
      expect(UserService.getUserByEmail).toHaveBeenCalledWith(email)
      expect(passwordUtils.hashPassword).not.toHaveBeenCalled()
      expect(UserService.createUser).not.toHaveBeenCalled()
    })
  })
}) 