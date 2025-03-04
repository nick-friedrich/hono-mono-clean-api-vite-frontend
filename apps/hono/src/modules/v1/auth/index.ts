import { OpenAPIHono } from '@hono/zod-openapi'
import { createRoute } from '@hono/zod-openapi'
import { LoginResponseSchema, LoginRequestSchema, RegisterRequestSchema, VerifyEmailRequestSchema, VerifyEmailResponseSchema } from './types'
import { AuthController } from './auth.controller'

const auth = new OpenAPIHono()

const loginRoute = createRoute({
  method: 'post',
  path: '/login',
  request: {
    body: {
      content: {
        'application/json': {
          schema: LoginRequestSchema
        }
      }
    }
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: LoginResponseSchema
        }
      },
      description: 'Login information'
    }
  },
  tags: ['Auth'],
  summary: 'Login',
  description: 'Login to the system'
})

const registerRoute = createRoute({
  method: 'post',
  path: '/register',
  request: {
    body: {
      content: {
        'application/json': {
          schema: RegisterRequestSchema
        }
      }
    }
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: LoginResponseSchema
        }
      },
      description: 'Registration information'
    }
  },
  tags: ['Auth'],
  summary: 'Register',
  description: 'Register a new user'
})

const verifyEmailRoute = createRoute({
  method: 'post',
  path: '/verify-email',
  request: {
    body: {
      content: {
        'application/json': {
          schema: VerifyEmailRequestSchema
        }
      }
    }
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: VerifyEmailResponseSchema
        }
      },
      description: 'Verify email'
    }
  },
  tags: ['Auth'],
  summary: 'Verify email',
  description: 'Verify email'
})

auth.openapi(loginRoute, async (c) => {
  const result = await AuthController.handleLogin(c)
  return c.json(result)
})

auth.openapi(registerRoute, async (c) => {
  const result = await AuthController.handleRegister(c)
  return c.json(result)
})

auth.openapi(verifyEmailRoute, async (c) => {
  const result = await AuthController.handleVerifyEmail(c)
  if (result.success) {
    c.redirect(`${process.env.FRONTEND_URL}/auth/login?verify-email-success=true`)
  }
  return c.json(result)
})

export default auth