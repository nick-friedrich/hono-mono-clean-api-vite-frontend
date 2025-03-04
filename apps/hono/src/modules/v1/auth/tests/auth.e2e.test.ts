import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import app from '../../../../index'
import { AuthService } from '../auth.service'
import { UserService } from '../../user/user.service'
import * as jwtUtils from '../../../../utils/jwt'

// Mock dependencies
vi.mock('../auth.service')
vi.mock('../../user/user.service')
vi.mock('../../../../utils/jwt')

describe('Auth Routes (E2E)', () => {
  // Setup and cleanup for each test
  beforeEach(() => {
    vi.resetAllMocks()
  })

  // Test login routes
  describe('POST /api/v1/auth/login', () => {
    it('should return 200 and token when login is successful', async () => {
      // Arrange
      const mockToken = 'mock-jwt-token'
      vi.spyOn(AuthService, 'loginWithEmailPassword').mockResolvedValue(mockToken)

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
      const data = await res.json()
      expect(data).toEqual({ token: mockToken })
    })

    it('should return error when login fails', async () => {
      // Arrange
      vi.spyOn(AuthService, 'loginWithEmailPassword').mockRejectedValue(new Error('Invalid email or password'))

      const requestBody = {
        email: 'wrong@example.com',
        password: 'wrongpassword'
      }

      // Act
      const res = await app.request('/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })

      // Assert - API returns 200 with error in body, not 400
      expect(res.status).toBe(200)
      const data = await res.json()
      expect(data).toEqual({ error: 'Invalid email or password' })
    })

    it('should return 200 with error when email is not verified', async () => {
      // Arrange
      vi.spyOn(AuthService, 'loginWithEmailPassword').mockRejectedValue(new Error('Email not verified'))

      const requestBody = {
        email: 'unverified@example.com',
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

      // Assert - API returns 200 with error in body, not 400
      expect(res.status).toBe(200)
      const data = await res.json()
      expect(data).toEqual({ error: 'Email not verified' })
    })
  })

  // Test register routes
  describe('POST /api/v1/auth/register', () => {
    it('should return 200 and token when signup is successful without email verification', async () => {
      // Arrange
      const mockToken = 'mock-jwt-token'
      vi.spyOn(AuthService, 'signUpWithEmailPassword').mockResolvedValue({ token: mockToken, emailVerificationNeeded: false })

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

      // Assert - API returns 200, not 201
      expect(res.status).toBe(200)
      const data = await res.json()
      expect(data).toEqual({ token: mockToken, emailVerificationNeeded: false })
    })

    it('should return 200 when signup with email verification is successful', async () => {
      // Arrange
      const mockToken = 'mock-jwt-token'
      vi.spyOn(AuthService, 'signUpWithEmailPassword').mockResolvedValue({ token: mockToken, emailVerificationNeeded: true })

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

      // Assert - API returns 200, not 201
      expect(res.status).toBe(200)
      const data = await res.json()
      expect(data).toEqual({ token: mockToken, emailVerificationNeeded: true })
    })

    it('should return 200 with error when user already exists', async () => {
      // Arrange
      vi.spyOn(AuthService, 'signUpWithEmailPassword').mockRejectedValue(new Error('User already exists'))

      const requestBody = {
        email: 'existing@example.com',
        password: 'password123',
        name: 'Existing User'
      }

      // Act
      const res = await app.request('/api/v1/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })

      // Assert - API returns 200 with error in body, not 400
      expect(res.status).toBe(200)
      const data = await res.json()
      expect(data).toEqual({ error: 'User already exists' })
    })
  })

  // Test verify email routes
  describe('GET /api/v1/auth/verify-email', () => {
    it('should return 200 and success message when verification is successful with no FRONTEND_URL', async () => {
      // Arrange
      const token = 'valid-token'
      vi.spyOn(AuthService, 'verifyEmail').mockResolvedValue(true)

      // Save original env and unset FRONTEND_URL to prevent redirect
      const originalEnv = process.env.FRONTEND_URL
      delete process.env.FRONTEND_URL

      // Act - Changed to GET method
      const res = await app.request(`/api/v1/auth/verify-email?token=${token}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
      })

      // Assert
      expect(res.status).toBe(200)
      const data = await res.json()
      expect(data).toEqual({ success: true })

      // Restore env
      process.env.FRONTEND_URL = originalEnv
    })

    it('should redirect to frontend when verification is successful with FRONTEND_URL', async () => {
      // Arrange
      const token = 'valid-token'
      vi.spyOn(AuthService, 'verifyEmail').mockResolvedValue(true)

      // Set FRONTEND_URL to test redirect
      const originalEnv = process.env.FRONTEND_URL
      process.env.FRONTEND_URL = 'http://localhost:5173'

      // Act - Changed to GET method
      const res = await app.request(`/api/v1/auth/verify-email?token=${token}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        redirect: 'manual' // Don't follow redirects automatically
      })

      // Assert
      expect(res.status).toBe(302) // 302 redirect
      // Updated to match actual implementation
      expect(res.headers.get('Location')).toBe('http://localhost:5173/?verify-email-success=true')

      // Restore env
      process.env.FRONTEND_URL = originalEnv
    })

    it('should return error when verification fails', async () => {
      const token = 'invalid-token'
      const errorMessage = 'Invalid or expired verification token'
      vi.spyOn(AuthService, 'verifyEmail').mockRejectedValue(new Error(errorMessage))

      // Act - Changed to GET method
      const res = await app.request(`/api/v1/auth/verify-email?token=${token}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
      })

      // Assert
      expect(res.status).toBe(200) // Error is returned in response body, not as HTTP error
      const data = await res.json()
      expect(data).toEqual({ success: false, error: errorMessage })
    })
  })

  // Test current user route
  describe('GET /api/v1/auth/current', () => {
    it('should return 200 and user information when authenticated', async () => {
      // Create a mock user with proper Date objects
      const mockUserDates = {
        createdAt: new Date(),
        updatedAt: new Date(),
        emailVerifiedAt: new Date(),
        emailVerificationTokenExpiresAt: null
      };

      // Mock user data
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashed_password',
        emailVerificationToken: null,
        ...mockUserDates
      };

      // Setup mock implementations
      vi.spyOn(UserService, 'getUserById').mockResolvedValue(mockUser);
      vi.spyOn(jwtUtils, 'verifyJWT').mockResolvedValue({
        sub: mockUser.id,
        email: mockUser.email
      });

      // Act
      const res = await app.request('/api/v1/auth/current', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer valid-token'
        }
      });

      // Assert
      expect(res.status).toBe(200);
      const data = await res.json();

      // Should return user data without sensitive fields
      expect(data).toMatchObject({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name
      });
      expect(data).not.toHaveProperty('password');
    });

    it('should return 401 when no authentication token is provided', async () => {
      // Act
      const res = await app.request('/api/v1/auth/current', {
        method: 'GET'
      });

      // Assert
      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data).toHaveProperty('message');
      expect(data.message).toContain('Unauthorized');
    });

    it('should return 401 when invalid token is provided', async () => {
      // Mock token verification to fail
      vi.spyOn(jwtUtils, 'verifyJWT').mockRejectedValue(
        new Error('Invalid token')
      );

      // Act
      const res = await app.request('/api/v1/auth/current', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer invalid-token'
        }
      });

      // Assert
      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data).toHaveProperty('message');
      expect(data.message).toContain('Unauthorized');
    });

    it('should return 401 when user does not exist', async () => {
      // Mock JWT verification to succeed but user lookup to return null
      vi.spyOn(jwtUtils, 'verifyJWT').mockResolvedValue({
        sub: 'non-existent-id',
        email: 'test@example.com'
      });
      vi.spyOn(UserService, 'getUserById').mockResolvedValue(null);

      // Act
      const res = await app.request('/api/v1/auth/current', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer valid-token'
        }
      });

      // Assert
      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data).toHaveProperty('message');
      expect(data.message).toContain('User not found');
    });
  });
}); 