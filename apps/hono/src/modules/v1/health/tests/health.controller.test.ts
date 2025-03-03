import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { getHealth } from '../health.controller'

describe('Health Controller', () => {
  it('should return a healthy status', async () => {
    const result = await getHealth()

    expect(result).toEqual({
      message: 'System is healthy',
      status: 'ok',
      timestamp: expect.any(Number)
    })

    expect(result.timestamp).to.be.closeTo(Date.now(), 1000) // Within 1 second
  })

  it('should handle errors and return error status with Error message', async () => {
    // Mock implementation to throw an error
    const originalDateNow = Date.now
    const mockError = new Error('Test error message')

    // Setup a spy that will throw an error when Date.now is called the first time
    let callCount = 0
    vi.spyOn(Date, 'now').mockImplementation(() => {
      if (callCount === 0) {
        callCount++
        throw mockError
      }
      return 1234567890
    })

    try {
      const result = await getHealth()

      expect(result).toEqual({
        message: 'Test error message',
        status: 'error',
        timestamp: 1234567890
      })
    } finally {
      // Restore original Date.now
      vi.spyOn(Date, 'now').mockRestore()
    }
  })

  it('should handle non-Error objects in catch block', async () => {
    // Mock implementation to throw a non-Error object
    let callCount = 0
    vi.spyOn(Date, 'now').mockImplementation(() => {
      if (callCount === 0) {
        callCount++
        // Throw a string instead of an Error object
        throw 'This is not an Error object'
      }
      return 9876543210
    })

    try {
      const result = await getHealth()

      expect(result).toEqual({
        message: 'System health check failed',
        status: 'error',
        timestamp: 9876543210
      })
    } finally {
      // Restore original Date.now
      vi.spyOn(Date, 'now').mockRestore()
    }
  })
}) 