import { describe, it, expect } from 'vitest'
import app from '../../../../index'
import { RouteHealth } from '../types'

describe('Health Endpoint (E2E)', () => {
  it('should return a successful health check', async () => {
    // Create a request for the health endpoint
    const req = new Request('http://localhost/api/v1/health')
    const res = await app.fetch(req)

    // Assert status
    expect(res.status).toBe(200)

    // Parse response
    const data = await res.json() as RouteHealth

    // Assert response shape
    expect(data).toEqual({
      message: 'System is healthy',
      status: 'ok',
      timestamp: expect.any(Number)
    })

    // Assert timestamp is recent
    expect(data.timestamp).to.be.closeTo(Date.now(), 1000) // Within 1 second
  })
}) 