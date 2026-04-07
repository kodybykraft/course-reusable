export const quizPassedTemplate = {
  name: 'Quiz Passed',
  subject: 'You passed the quiz in {{courseName}}!',
  category: 'quiz-passed',
  htmlContent: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Quiz Passed</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f7; font-family: Arial, Helvetica, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f7;">
    <tr>
      <td align="center" style="padding: 24px 16px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 8px; overflow: hidden;">
          <tr>
            <td style="background-color: #2563eb; padding: 32px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">{{platformName}}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 16px; color: #1a1a2e; font-size: 22px;">Quiz Passed!</h2>
              <p style="margin: 0 0 24px; color: #51545e; font-size: 16px; line-height: 1.625;">Hi {{firstName}},</p>
              <p style="margin: 0 0 16px; color: #51545e; font-size: 16px; line-height: 1.625;">Great job! You passed <strong>{{quizTitle}}</strong> in {{courseName}}.</p>
              <div style="margin: 24px 0; padding: 20px; background-color: #ecfdf5; border-radius: 8px; text-align: center;">
                <div style="font-size: 32px; font-weight: 700; color: #059669;">{{score}}%</div>
                <div style="font-size: 14px; color: #6b7280; margin-top: 4px;">{{correctAnswers}} of {{totalQuestions}} correct</div>
              </div>
              <p style="margin: 0 0 32px; color: #51545e; font-size: 16px; line-height: 1.625;">Keep up the great work! Continue to the next lesson.</p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="{{courseUrl}}" style="display: inline-block; background-color: #2563eb; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 6px;">Continue Course</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 24px 40px; background-color: #f8f9fa; border-top: 1px solid #e8e8eb;">
              <p style="margin: 0; color: #9a9ea6; font-size: 13px; text-align: center;">You received this email because you completed a quiz on {{platformName}}.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  textContent: `Quiz Passed!

Hi {{firstName}},

Great job! You passed {{quizTitle}} in {{courseName}}.

Score: {{score}}% ({{correctAnswers}} of {{totalQuestions}} correct)

Continue your course: {{courseUrl}}

— {{platformName}}`,
};
