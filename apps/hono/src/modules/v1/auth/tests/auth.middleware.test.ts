import { Hono } from "hono"
import { authMiddleware } from "../auth.middleware"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { UserService } from "../../user/user.service"
import * as jwtUtils from "../../../../utils/jwt"

// Setup mocks before tests
vi.mock("../../user/user.service")
vi.mock("../../../../utils/jwt")

describe('AuthMiddleware', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.resetAllMocks()
  })

  // Test unauthorized when no token provided
  it('should return 401 when no token is provided', async () => {
    const app = new Hono()

    // Apply middleware to a test route
    app.get('/protected', authMiddleware, (c) => c.text('Protected Content'))

    // Make request without Authorization header
    const res = await app.request('/protected')

    expect(res.status).toBe(401)
    expect(await res.json()).toEqual({ message: 'Unauthorized: Missing or invalid token' })
  })

  // Test unauthorized with invalid token
  it('should return 401 with invalid token format', async () => {
    const app = new Hono()
    app.get('/protected', authMiddleware, (c) => c.text('Protected Content'))

    // Make request with invalid Authorization header
    const res = await app.request('/protected', {
      headers: { 'Authorization': 'InvalidToken' }
    })

    expect(res.status).toBe(401)
    expect(await res.json()).toEqual({ message: 'Unauthorized: Missing or invalid token' })
  })

  // Test successful authentication
  it('should pass when valid token is provided', async () => {
    const mockUser = {
      id: '123',
      email: 'test@example.com',
      name: 'Test User',
      password: 'password',
      createdAt: new Date(),
      updatedAt: new Date(),
      emailVerificationToken: null,
      emailVerificationTokenExpiresAt: null,
      emailVerifiedAt: new Date()
    }
    const mockJwtPayload = { sub: '123', email: 'test@example.com', name: 'Test User' }

    // Setup mocks correctly
    vi.mocked(jwtUtils.verifyJWT).mockResolvedValue(mockJwtPayload)
    vi.mocked(UserService.getUserById).mockResolvedValue(mockUser)

    const app = new Hono()
    app.get('/protected', authMiddleware, (c) => {
      const user = c.get('user')
      return c.json(user)
    })

    const res = await app.request('/protected', {
      headers: { 'Authorization': 'Bearer valid-token' }
    })

    expect(res.status).toBe(200)
    expect(await res.json()).toMatchObject({
      id: mockUser.id,
      email: mockUser.email,
      name: mockUser.name
    })
  })

  // Test case for valid token but user not found (line 33-34)
  it('should return 401 when user not found in database', async () => {
    const mockJwtPayload = { sub: 'non-existent-id', email: 'test@example.com' }

    // Mock JWT verification to succeed but user lookup to return null
    vi.mocked(jwtUtils.verifyJWT).mockResolvedValue(mockJwtPayload)
    vi.mocked(UserService.getUserById).mockResolvedValue(null)

    const app = new Hono()
    app.get('/protected', authMiddleware, (c) => c.text('Protected Content'))

    const res = await app.request('/protected', {
      headers: { 'Authorization': 'Bearer valid-token' }
    })

    expect(res.status).toBe(401)
    expect(await res.json()).toEqual({ message: 'Unauthorized: User not found' })
  })

  // Test case for JWT verification error (line 41-42)
  it('should return 401 when token verification fails', async () => {
    // Mock JWT verification to throw an error
    vi.mocked(jwtUtils.verifyJWT).mockRejectedValue(new Error('Invalid token'))

    const app = new Hono()
    app.get('/protected', authMiddleware, (c) => c.text('Protected Content'))

    const res = await app.request('/protected', {
      headers: { 'Authorization': 'Bearer invalid-token' }
    })

    expect(res.status).toBe(401)
    expect(await res.json()).toEqual({ message: 'Unauthorized: Invalid token' })
  })
})
