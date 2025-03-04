
/**
 * Send email options
 */
interface SendEmailOptions {
  to: string
  subject: string
  text: string
  html?: string
}

/**
 * Email service
 */
abstract class EmailService {
  abstract sendEmail(options: SendEmailOptions): Promise<boolean>
}

/**
 * Console mail adapter
 */
export class ConsoleMailAdapter implements EmailService {
  async sendEmail(options: SendEmailOptions): Promise<boolean> {
    console.log(options)
    return true
  }
}

/**
 * Mail service instance
 */
export class MailServiceInstance {
  private emailService: EmailService
  private static instance: MailServiceInstance

  /**
   * Constructor for MailServiceInstance
   * 
   * @returns The singleton instance of MailServiceInstance
   */
  private constructor() {
    this.emailService = new ConsoleMailAdapter()
  }

  /**
   * Get the singleton instance of MailServiceInstance
   * 
   * @returns The singleton instance of MailServiceInstance
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
   * 
   * @param service - The email service implementation to use
   */
  public initializeWith(service: EmailService): void {
    this.emailService = service
  }

  /**
   * Send an email using the configured email service
   * 
   * @param options - The email options
   * @returns A promise that resolves to a boolean indicating the success of the email send
   */
  public async sendEmail(options: SendEmailOptions): Promise<boolean> {
    return this.emailService.sendEmail(options)
  }
}

/**
 * Get the mail service instance
 * 
 * @returns The mail service instance
 */
export const getMailService = (): MailServiceInstance => {
  return MailServiceInstance.getInstance()
}