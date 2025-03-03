import { z } from '@hono/zod-openapi'

/**
 * Health check response schema
 */
export const HealthResponseSchema = z.object({
  message: z.string().describe('Health status message'),
  status: z.enum(['ok', 'error']).describe('Current health status'),
  timestamp: z.number().describe('Unix timestamp of the health check')
})

export type RouteHealth = z.infer<typeof HealthResponseSchema> 