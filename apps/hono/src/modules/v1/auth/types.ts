import { z } from '@hono/zod-openapi'

/**
 * Login response schema
 */
export const LoginResponseSchema = z.object({
  token: z.string().describe('JWT token').optional(),
  error: z.string().describe('Error message').optional(),
})

export const LoginRequestSchema = z.object({
  email: z.string().email().describe('Email'),
  password: z.string().min(8).describe('Password'),
})

export const RegisterRequestSchema = LoginRequestSchema.extend({
  name: z.string().optional().describe('User name'),
})

export type RouteLoginResponse = z.infer<typeof LoginResponseSchema>
export type RouteLoginRequest = z.infer<typeof LoginRequestSchema>
export type RouteRegisterRequest = z.infer<typeof RegisterRequestSchema> 