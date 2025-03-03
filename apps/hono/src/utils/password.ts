import * as argon2 from 'argon2'

/**
 * Hash password
 * @param password - Plain text password
 * @returns Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 2 ** 16,
    timeCost: 3,
    parallelism: 1
  })
}

/**
 * Verify password
 * @param password - Plain text password
 * @param hash - Hashed password
 * @returns True if password is valid
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    return await argon2.verify(hash, password)
  } catch (error) {
    console.error('Error verifying password:', error)
    return false
  }
}

/**
 * Generate random password
 * @param length - Password length
 * @returns Random password
 */
export function generateRandomPassword(length = 12): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+'
  let password = ''
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
} 