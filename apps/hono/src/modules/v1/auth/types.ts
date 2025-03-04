import { z } from 'zod'

/**
 * Login response schema
 */
export const LoginResponseSchema = z.object({
  token: z.string().describe('JWT token').optional(),
  error: z.string().describe('Error message').optional(),
})

export const LoginRequestSchema = z.object({
  email: z.string().email('Invalid email format').describe('Email'),
  password: z.string().describe('Password'),
})

export const RegisterResponseSchema = z.object({
  token: z.string().describe('JWT token').optional(),
  error: z.string().describe('Error message').optional(),
  emailVerificationNeeded: z.boolean().describe('Email verification needed').optional(),
})

export const RegisterRequestSchema = z.object({
  email: z.string().email('Invalid email format').describe('Email'),
  password: z.string().min(8, 'Password must be at least 8 characters').describe('Password'),
  name: z.string().optional().describe('User name'),
})

export type RouteLoginResponse = z.infer<typeof LoginResponseSchema>
export type RouteLoginRequest = z.infer<typeof LoginRequestSchema>

export type RouteRegisterResponse = z.infer<typeof RegisterResponseSchema>
export type RouteRegisterRequest = z.infer<typeof RegisterRequestSchema> 