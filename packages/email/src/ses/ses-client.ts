import { SESv2Client, SendEmailCommand } from '@aws-sdk/client-sesv2';

export interface SesConfig {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  fromEmail: string;
  fromName?: string;
}

/**
 * SES email sender using the AWS SES v2 SDK.
 */
export class SesClient {
  private client: SESv2Client;

  constructor(private config: SesConfig) {
    this.client = new SESv2Client({
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
  }

  async sendEmail(input: {
    to: string | string[];
    subject: string;
    html: string;
    text?: string;
    replyTo?: string;
    tags?: Record<string, string>;
  }): Promise<{ messageId: string }> {
    const recipients = Array.isArray(input.to) ? input.to : [input.to];

    const command = new SendEmailCommand({
      Content: {
        Simple: {
          Subject: { Data: input.subject },
          Body: {
            Html: { Data: input.html },
            ...(input.text ? { Text: { Data: input.text } } : {}),
          },
        },
      },
      Destination: { ToAddresses: recipients },
      FromEmailAddress: this.config.fromName
        ? `${this.config.fromName} <${this.config.fromEmail}>`
        : this.config.fromEmail,
      ...(input.replyTo ? { ReplyToAddresses: [input.replyTo] } : {}),
    });

    const result = await this.client.send(command);

    return { messageId: result.MessageId ?? crypto.randomUUID() };
  }

  async sendBulk(inputs: Array<{
    to: string;
    subject: string;
    html: string;
    text?: string;
  }>): Promise<Array<{ to: string; messageId: string; error?: string }>> {
    const settled = await Promise.allSettled(
      inputs.map((input) => this.sendEmail(input).then((r) => ({ to: input.to, ...r }))),
    );

    return settled.map((result, i) => {
      if (result.status === 'fulfilled') {
        return { to: result.value.to, messageId: result.value.messageId };
      }
      return { to: inputs[i].to, messageId: '', error: String(result.reason) };
    });
  }

  getConfig() {
    return { region: this.config.region, fromEmail: this.config.fromEmail, fromName: this.config.fromName };
  }
}
