export const lessonUnlockedTemplate = {
  name: 'Lesson Unlocked',
  subject: 'New lesson available: {{lessonTitle}}',
  category: 'lesson-unlocked',
  htmlContent: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Lesson Unlocked</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f7; font-family: Arial, Helvetica, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f7;">
    <tr>
      <td align="center" style="padding: 24px 16px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 8px; overflow: hidden;">
          <tr>
            <td style="background-color: #7c3aed; padding: 32px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">{{platformName}}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 16px; color: #1a1a2e; font-size: 22px;">New Lesson Available</h2>
              <p style="margin: 0 0 24px; color: #51545e; font-size: 16px; line-height: 1.625;">Hi {{firstName}},</p>
              <p style="margin: 0 0 24px; color: #51545e; font-size: 16px; line-height: 1.625;">A new lesson has been unlocked in <strong>{{courseName}}</strong>:</p>
              <div style="margin: 0 0 32px; padding: 20px; background-color: #f5f3ff; border-left: 4px solid #7c3aed; border-radius: 4px;">
                <strong style="color: #1a1a2e; font-size: 16px;">{{lessonTitle}}</strong>
                <p style="margin: 8px 0 0; color: #6b7280; font-size: 14px;">Module: {{moduleName}}</p>
              </div>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="{{lessonUrl}}" style="display: inline-block; background-color: #7c3aed; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 6px;">Start Lesson</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 24px 40px; background-color: #f8f9fa; border-top: 1px solid #e8e8eb;">
              <p style="margin: 0; color: #9a9ea6; font-size: 13px; text-align: center;">You received this email because you're enrolled in a course on {{platformName}}.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  textContent: `New Lesson Available

Hi {{firstName}},

A new lesson has been unlocked in {{courseName}}:

{{lessonTitle}} (Module: {{moduleName}})

Start the lesson: {{lessonUrl}}

— {{platformName}}`,
};
