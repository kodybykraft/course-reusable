export const certificateIssuedTemplate = {
  name: 'Certificate Issued',
  subject: 'Your certificate for {{courseName}} is ready',
  category: 'certificate-issued',
  htmlContent: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Certificate Issued</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f7; font-family: Arial, Helvetica, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f7;">
    <tr>
      <td align="center" style="padding: 24px 16px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 8px; overflow: hidden;">
          <tr>
            <td style="background-color: #d97706; padding: 32px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">{{platformName}}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px; text-align: center;">
              <div style="font-size: 48px; margin-bottom: 16px;">&#128220;</div>
              <h2 style="margin: 0 0 16px; color: #1a1a2e; font-size: 22px;">Your Certificate is Ready</h2>
              <p style="margin: 0 0 24px; color: #51545e; font-size: 16px; line-height: 1.625;">Hi {{firstName}},</p>
              <p style="margin: 0 0 16px; color: #51545e; font-size: 16px; line-height: 1.625;">Your certificate of completion for <strong>{{courseName}}</strong> has been issued.</p>
              <div style="margin: 24px 0; padding: 16px; background-color: #fef3c7; border-radius: 6px; display: inline-block;">
                <span style="font-family: monospace; font-size: 18px; font-weight: 700; color: #92400e;">{{certificateCode}}</span>
              </div>
              <p style="margin: 0 0 32px; color: #51545e; font-size: 14px;">Use this code to verify your certificate anytime.</p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="{{certificateUrl}}" style="display: inline-block; background-color: #d97706; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 6px;">View Certificate</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 24px 40px; background-color: #f8f9fa; border-top: 1px solid #e8e8eb;">
              <p style="margin: 0; color: #9a9ea6; font-size: 13px; text-align: center;">You received this email because you earned a certificate on {{platformName}}.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  textContent: `Your Certificate is Ready

Hi {{firstName}},

Your certificate of completion for {{courseName}} has been issued.

Certificate Code: {{certificateCode}}

View your certificate: {{certificateUrl}}

— {{platformName}}`,
};
