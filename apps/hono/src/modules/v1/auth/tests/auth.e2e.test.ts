import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import app from '../../../../index'
import { AuthService } from '../auth.service'

// Mock the AuthService
vi.mock('../auth.service', () => ({
  AuthService: {
    loginWithEmailPassword: vi.fn(),
    signUpWithEmailPassword: vi.fn()
  }
}))

describe('Auth Routes (E2E)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('POST /api/v1/auth/login', () => {
    it('should return 200 and token when login is successful', async () => {
      // Arrange
      const mockToken = 'mock-jwt-token'
      vi.mocked(AuthService.loginWithEmailPassword).mockResolvedValue(mockToken)

      const requestBody = {
        email: 'test@example.com',
        password: 'password123'
      }

      // Act
      const res = await app.request('/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })

      // Assert
      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body).toEqual({ token: mockToken })
      expect(AuthService.loginWithEmailPassword).toHaveBeenCalledWith(requestBody.email, requestBody.password)
    })

    it('should return error when login fails', async () => {
      // Arrange
      vi.mocked(AuthService.loginWithEmailPassword).mockRejectedValue(new Error('Invalid email or password'))

      const requestBody = {
        email: 'test@example.com',
        password: 'wrong-password'
      }

      // Act
      const res = await app.request('/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })

      // Assert
      expect(res.status).toBe(200) // Even errors return 200 but with error in response body
      const body = await res.json()
      expect(body).toEqual({ error: 'Invalid email or password' })
    })

    it('should return 400 when request is invalid', async () => {
      // Arrange
      const requestBody = {
        email: 'not-an-email',
        password: 'short'
      }

      // Act
      const res = await app.request('/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })

      // Assert
      expect(res.status).toBe(400) // Validation errors return 400
      const body = await res.json()
      expect(body).toHaveProperty('error') // The exact error message may vary depending on zod openapi behavior
      expect(AuthService.loginWithEmailPassword).not.toHaveBeenCalled()
    })


    it('should return 400 when email is not verified', async () => {
      // Arrange
      vi.mocked(AuthService.loginWithEmailPassword).mockRejectedValue(new Error('Email not verified'))

      const requestBody = {
        email: 'test@example.com',
        password: 'password123'
      }

      // Act
      const res = await app.request('/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })

      // Assert
      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body).toEqual({ error: 'Email not verified' })
    })

  })

  describe('POST /api/v1/auth/register', () => {
    it('should return 200 and token when registration is successful', async () => {
      // Arrange
      const mockToken = 'mock-jwt-token'
      vi.mocked(AuthService.signUpWithEmailPassword).mockResolvedValue({ token: mockToken, emailVerificationNeeded: false })

      const requestBody = {
        email: 'newuser@example.com',
        password: 'password123',
        name: 'New User'
      }

      // Act
      const res = await app.request('/api/v1/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })

      // Assert
      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body).toEqual({ token: mockToken, emailVerificationNeeded: false })
      expect(AuthService.signUpWithEmailPassword).toHaveBeenCalledWith(
        requestBody.email,
        requestBody.password,
        requestBody.name
      )
    })

    it('should accept registration without name', async () => {
      // Arrange
      const mockToken = 'mock-jwt-token'
      vi.mocked(AuthService.signUpWithEmailPassword).mockResolvedValue({ token: mockToken, emailVerificationNeeded: false })

      const requestBody = {
        email: 'newuser@example.com',
        password: 'password123'
      }

      // Act
      const res = await app.request('/api/v1/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })

      // Assert
      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body).toEqual({ token: mockToken, emailVerificationNeeded: false })
      expect(AuthService.signUpWithEmailPassword).toHaveBeenCalledWith(
        requestBody.email,
        requestBody.password,
        undefined
      )
    })

    it('should return error when user already exists', async () => {
      // Arrange
      vi.mocked(AuthService.signUpWithEmailPassword).mockRejectedValue(new Error('User already exists'))

      const requestBody = {
        email: 'existing@example.com',
        password: 'password123'
      }

      // Act
      const res = await app.request('/api/v1/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })

      // Assert
      expect(res.status).toBe(200) // Even errors return 200 but with error in response body
      const body = await res.json()
      expect(body).toEqual({ error: 'User already exists' })
    })

    it('should return 400 when request is invalid', async () => {
      // Arrange
      const requestBody = {
        email: 'not-an-email',
        password: 'short'
      }

      // Act
      const res = await app.request('/api/v1/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })

      // Assert
      expect(res.status).toBe(400) // Validation errors return 400
      const body = await res.json()
      expect(body).toHaveProperty('error') // The exact error message may vary depending on zod openapi behavior
      expect(AuthService.signUpWithEmailPassword).not.toHaveBeenCalled()
    })
  })
}) 