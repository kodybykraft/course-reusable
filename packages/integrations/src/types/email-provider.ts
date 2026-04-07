export interface EmailMessage {
  to: string | string[];
  from: string;
  replyTo?: string;
  subject: string;
  html: string;
  text?: string;
  tags?: Record<string, string>;
}

export interface BulkEmailMessage extends EmailMessage {
  to: string[];
}

export interface EmailSendResult {
  messageId: string;
  status: 'sent' | 'queued' | 'failed';
  errorMessage?: string;
}

export interface EmailProvider {
  readonly id: string;
  readonly name: string;

  send(message: EmailMessage): Promise<EmailSendResult>;
  sendBulk(messages: BulkEmailMessage): Promise<EmailSendResult[]>;

  verifyDomain?(domain: string): Promise<{
    verified: boolean;
    dkimRecords?: string[];
    spfRecord?: string;
  }>;
}
