import { expect, describe, it, vi, beforeEach, afterEach } from "vitest"
import { ConsoleMailAdapter, MailServiceInstance } from "../email"
import { getMailService } from '../email'

describe('MailServiceInstance', () => {
  it('should be a singleton', () => {
    const instance1 = MailServiceInstance.getInstance()
    const instance2 = MailServiceInstance.getInstance()
    expect(instance1).toBe(instance2)
  })

  it('should initialize with a custom email service', () => {
    const instance = MailServiceInstance.getInstance()
    instance.initializeWith(new ConsoleMailAdapter())
    expect(instance.sendEmail({ to: 'test@test.com', subject: 'Test', text: 'Test' })).resolves.toBe(true)
  })

  it('should send an email', () => {
    const instance = MailServiceInstance.getInstance()
    instance.initializeWith(new ConsoleMailAdapter())
    expect(instance.sendEmail({ to: 'test@test.com', subject: 'Test', text: 'Test' })).resolves.toBe(true)
  })

  // Spy on console.log before each test
  const consoleSpy = vi.spyOn(console, 'log')

  beforeEach(() => {
    // Clear all previous mock calls
    consoleSpy.mockClear()
  })

  it('should log email details to console', async () => {
    const mailService = getMailService()
    const emailOptions = {
      to: 'user@example.com',
      subject: 'Test Subject',
      text: 'Test content'
    }

    await mailService.sendEmail(emailOptions)

    // Verify console.log was called with the email options
    expect(consoleSpy).toHaveBeenCalledWith(emailOptions)
  })
})