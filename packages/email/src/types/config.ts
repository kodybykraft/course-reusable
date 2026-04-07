export interface EmailConfig {
  provider: 'ses';
  region: string;
  fromEmail: string;
  fromName?: string;
  accessKeyId: string;
  secretAccessKey: string;
}
