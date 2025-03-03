import { describe, it, expect, vi, beforeEach } from 'vitest'
import { hashPassword, verifyPassword, generateRandomPassword } from '../password'

// Mock argon2
vi.mock('argon2', () => ({
  hash: vi.fn().mockResolvedValue('hashed-password'),
  verify: vi.fn(),
  argon2id: 2
}))

// Import the mocked module
import * as argon2 from 'argon2'

describe('Password Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('hashPassword', () => {
    it('should hash a password using argon2', async () => {
      const password = 'password123'

      const hashedPassword = await hashPassword(password)

      // Check that the password was hashed
      expect(hashedPassword).toBe('hashed-password')

      // Check that argon2.hash was called with the correct parameters
      expect(argon2.hash).toHaveBeenCalledWith(password, {
        type: 2, // argon2id
        memoryCost: 2 ** 16,
        timeCost: 3,
        parallelism: 1
      })
    })
  })

  describe('verifyPassword', () => {
    it('should return true when password is valid', async () => {
      // Mock argon2.verify to return true
      vi.mocked(argon2.verify).mockResolvedValueOnce(true)

      const password = 'password123'
      const hash = 'hashed-password'

      const isValid = await verifyPassword(password, hash)

      // Check that the password was verified
      expect(isValid).toBe(true)

      // Check that argon2.verify was called with the correct parameters
      expect(argon2.verify).toHaveBeenCalledWith(hash, password)
    })

    it('should return false when password is invalid', async () => {
      // Mock argon2.verify to return false
      vi.mocked(argon2.verify).mockResolvedValueOnce(false)

      const password = 'wrong-password'
      const hash = 'hashed-password'

      const isValid = await verifyPassword(password, hash)

      // Check that the password was not verified
      expect(isValid).toBe(false)
    })

    it('should return false and log error when verification throws', async () => {
      // Mock argon2.verify to throw an error
      vi.mocked(argon2.verify).mockRejectedValueOnce(new Error('Verification error'))

      // Mock console.error
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { })

      const password = 'password123'
      const hash = 'hashed-password'

      const isValid = await verifyPassword(password, hash)

      // Check that the password was not verified
      expect(isValid).toBe(false)

      // Check that the error was logged
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error verifying password:',
        expect.any(Error)
      )
    })
  })

  describe('generateRandomPassword', () => {
    it('should generate a random password with default length', () => {
      // Mock Math.random to return predictable values
      const randomValues = Array(12).fill(0).map((_, i) => i / 12)
      let callCount = 0
      vi.spyOn(Math, 'random').mockImplementation(() => randomValues[callCount++])

      const password = generateRandomPassword()

      // Check that the password has the default length
      expect(password.length).toBe(12)

      // Check that Math.random was called the correct number of times
      expect(Math.random).toHaveBeenCalledTimes(12)
    })

    it('should generate a random password with custom length', () => {
      // Mock Math.random to return predictable values
      const randomValues = Array(8).fill(0).map((_, i) => i / 8)
      let callCount = 0
      vi.spyOn(Math, 'random').mockImplementation(() => randomValues[callCount++])

      const password = generateRandomPassword(8)

      // Check that the password has the custom length
      expect(password.length).toBe(8)

      // Check that Math.random was called the correct number of times
      expect(Math.random).toHaveBeenCalledTimes(8)
    })

    it('should use the character set to generate passwords', () => {
      // Mock Math.random to return values that will select specific characters
      // This will select the first character in the set for each position
      vi.spyOn(Math, 'random').mockReturnValue(0)

      const password = generateRandomPassword(5)

      // The first character in the set should be 'A'
      expect(password).toBe('AAAAA')
    })
  })
}) 