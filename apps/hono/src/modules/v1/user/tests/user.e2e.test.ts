import { describe, it, expect, vi, beforeEach } from 'vitest'
import app from '../../../../index'
import { UserController } from '../user.controller'

// Mock the UserController
vi.mock('../user.controller', () => ({
  UserController: {
    handleGetUser: vi.fn()
  }
}))

describe('User Routes (E2E)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /api/v1/user/:id', () => {
    it('should return 200 and user data when user exists', async () => {
      // Arrange
      const userId = 'user-123'
      const mockUserResponse = {
        id: userId,
        email: 'test@example.com',
        name: 'Test User'
      }

      vi.mocked(UserController.handleGetUser).mockResolvedValue(mockUserResponse)

      // Act
      const res = await app.request(`/api/v1/user/${userId}`, {
        method: 'GET'
      })

      // Assert
      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body).toEqual(mockUserResponse)
      expect(UserController.handleGetUser).toHaveBeenCalled()
    })

    it('should return 500 when user is not found', async () => {
      // Arrange
      const userId = 'non-existent-id'

      // Setup mock to throw an error, simulating user not found
      vi.mocked(UserController.handleGetUser).mockRejectedValue(new Error('User not found'))

      // Act
      const res = await app.request(`/api/v1/user/${userId}`, {
        method: 'GET'
      })

      // Assert
      expect(res.status).toBe(500)
      // Check the response text instead of trying to parse as JSON
      const text = await res.text()
      expect(text).toContain('Internal Server Error')
    })

    it('should return 500 when an unexpected error occurs', async () => {
      // Arrange
      const userId = 'user-123'

      // Setup mock to throw an unexpected error
      vi.mocked(UserController.handleGetUser).mockRejectedValue(new Error('Database connection error'))

      // Act
      const res = await app.request(`/api/v1/user/${userId}`, {
        method: 'GET'
      })

      // Assert
      expect(res.status).toBe(500)
      // Check the response text instead of trying to parse as JSON
      const text = await res.text()
      expect(text).toContain('Internal Server Error')
    })
  })
}) 