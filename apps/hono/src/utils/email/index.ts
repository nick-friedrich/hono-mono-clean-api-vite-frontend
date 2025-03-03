
interface SendEmailOptions {
  to: string
  subject: string
  text: string
  html?: string
}

abstract class EmailService {
  abstract sendEmail(options: SendEmailOptions): Promise<boolean>
}

export class ConsoleMailAdapter implements EmailService {
  async sendEmail(options: SendEmailOptions): Promise<boolean> {
    console.log(options)
    return true
  }
}

export class MailServiceInstance {
  private emailService: EmailService
  private static instance: MailServiceInstance

  private constructor() {
    this.emailService = new ConsoleMailAdapter()
  }

  /**
   * Get the singleton instance of MailServiceInstance
   */
  public static getInstance(): MailServiceInstance {
    if (!MailServiceInstance.instance) {
      MailServiceInstance.instance = new MailServiceInstance()
    }
    return MailServiceInstance.instance
  }

  /**
   * Initialize with a custom email service implementation
   * This should be called early in your application setup if you
   * want to use a different email service than the default
   */
  public initializeWith(service: EmailService): void {
    this.emailService = service
  }

  /**
   * Send an email using the configured email service
   */
  public async sendEmail(options: SendEmailOptions): Promise<boolean> {
    return this.emailService.sendEmail(options)
  }
}

// Export a convenience function to get the mail service
export const getMailService = (): MailServiceInstance => {
  return MailServiceInstance.getInstance()
}