import { sign, verify } from 'hono/jwt'

// JWT secret from environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key'

/**
 * JWT payload interface
 */
export interface JWTPayload {
  sub: string
  email: string
  [key: string]: any
}

/**
 * Generate JWT token
 * @param payload - JWT payload
 * @returns Promise with JWT token
 */
export async function generateJWT(payload: JWTPayload): Promise<string> {
  // Set expiry if not already set
  if (!payload.exp) {
    const expirySeconds = process.env.JWT_EXPIRY_SECONDS
      ? parseInt(process.env.JWT_EXPIRY_SECONDS, 10)
      : 24 * 60 * 60 // Default to 24 hours

    payload.exp = Math.floor(Date.now() / 1000) + expirySeconds
  }

  // Add issued at timestamp
  payload.iat = Math.floor(Date.now() / 1000)

  // Generate token using Hono's sign function
  return sign(payload, JWT_SECRET)
}

/**
 * Verify JWT token
 * @param token - JWT token
 * @returns Promise with JWT payload if valid
 * @throws Error if token is invalid
 */
export async function verifyJWT(token: string): Promise<JWTPayload> {
  return verify(token, JWT_SECRET) as Promise<JWTPayload>
} 