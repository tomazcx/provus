export abstract class NotificationProvider {
  abstract sendEmail(to: string, subject: string, body: string): Promise<void>;
}
