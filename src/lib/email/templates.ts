/**
 * Email Templates
 *
 * HTML email templates for various notification types.
 * All templates include:
 * - Responsive design for mobile
 * - Plain text fallback
 * - Unsubscribe link (COPPA compliance)
 */

interface BaseTemplateData {
  recipientName: string;
  unsubscribeUrl?: string;
}

// Common styles for all emails
const commonStyles = `
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
  .container { max-width: 600px; margin: 0 auto; background: #fff; }
  .header { background: #6366f1; color: white; padding: 24px; text-align: center; }
  .header h1 { margin: 0; font-size: 24px; }
  .content { padding: 32px 24px; }
  .button { display: inline-block; background: #6366f1; color: white !important; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; margin: 16px 0; }
  .footer { padding: 24px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #eee; }
  .footer a { color: #6366f1; }
  h2 { color: #1f2937; margin-top: 0; }
  .highlight { background: #f0f9ff; border-left: 4px solid #6366f1; padding: 16px; margin: 16px 0; }
`;

function wrapInTemplate(content: string, previewText: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Kaelyn's Academy</title>
  <style>${commonStyles}</style>
  <!--[if mso]><style>body{font-family:Arial,sans-serif}</style><![endif]-->
</head>
<body>
  <!-- Preview text -->
  <div style="display:none;max-height:0;overflow:hidden">${previewText}</div>
  <div class="container">
    <div class="header">
      <h1>🎓 Kaelyn's Academy</h1>
    </div>
    ${content}
  </div>
</body>
</html>`;
}

function generateUnsubscribeFooter(unsubscribeUrl?: string): string {
  if (!unsubscribeUrl) return "";
  return `
    <div class="footer">
      <p>You're receiving this because you have an account at Kaelyn's Academy.</p>
      <p><a href="${unsubscribeUrl}">Unsubscribe from these emails</a></p>
    </div>
  `;
}

// ============== NEW MESSAGE NOTIFICATION ==============

interface NewMessageData extends BaseTemplateData {
  senderName: string;
  messagePreview: string;
  conversationSubject: string;
  viewUrl: string;
}

export function newMessageTemplate(data: NewMessageData): { html: string; text: string } {
  const content = `
    <div class="content">
      <h2>New Message from ${data.senderName}</h2>
      <p>Hi ${data.recipientName},</p>
      <p>You have a new message in the conversation "<strong>${data.conversationSubject}</strong>":</p>
      <div class="highlight">
        <p style="margin: 0; color: #374151;">"${data.messagePreview}"</p>
      </div>
      <p>
        <a href="${data.viewUrl}" class="button">View Message</a>
      </p>
    </div>
    ${generateUnsubscribeFooter(data.unsubscribeUrl)}
  `;

  const html = wrapInTemplate(content, `New message from ${data.senderName}`);

  const text = `
New Message from ${data.senderName}

Hi ${data.recipientName},

You have a new message in "${data.conversationSubject}":

"${data.messagePreview}"

View the message: ${data.viewUrl}
  `.trim();

  return { html, text };
}

// ============== WEEKLY PROGRESS SUMMARY ==============

interface ProgressData extends BaseTemplateData {
  learnerName: string;
  weekStart: string;
  weekEnd: string;
  lessonsCompleted: number;
  quizzesPassed: number;
  timeSpent: string;
  achievements: string[];
  topSubject: string;
  viewUrl: string;
}

export function weeklyProgressTemplate(data: ProgressData): { html: string; text: string } {
  const achievementsList = data.achievements.length > 0
    ? data.achievements.map((a) => `<li>🏆 ${a}</li>`).join("")
    : "<li>Keep going - achievements are waiting!</li>";

  const content = `
    <div class="content">
      <h2>Weekly Progress: ${data.learnerName}</h2>
      <p>Hi ${data.recipientName},</p>
      <p>Here's how ${data.learnerName} did this week (${data.weekStart} - ${data.weekEnd}):</p>

      <div class="highlight">
        <p style="margin: 0;"><strong>📚 ${data.lessonsCompleted}</strong> lessons completed</p>
        <p style="margin: 8px 0 0 0;"><strong>✅ ${data.quizzesPassed}</strong> quizzes passed</p>
        <p style="margin: 8px 0 0 0;"><strong>⏱️ ${data.timeSpent}</strong> learning time</p>
        <p style="margin: 8px 0 0 0;"><strong>⭐ Top subject:</strong> ${data.topSubject}</p>
      </div>

      <h3>Achievements Earned</h3>
      <ul>${achievementsList}</ul>

      <p>
        <a href="${data.viewUrl}" class="button">View Full Report</a>
      </p>
    </div>
    ${generateUnsubscribeFooter(data.unsubscribeUrl)}
  `;

  const html = wrapInTemplate(content, `${data.learnerName}'s weekly progress report`);

  const text = `
Weekly Progress: ${data.learnerName}

Hi ${data.recipientName},

Here's how ${data.learnerName} did this week (${data.weekStart} - ${data.weekEnd}):

- ${data.lessonsCompleted} lessons completed
- ${data.quizzesPassed} quizzes passed
- ${data.timeSpent} learning time
- Top subject: ${data.topSubject}

Achievements: ${data.achievements.join(", ") || "Keep going!"}

View full report: ${data.viewUrl}
  `.trim();

  return { html, text };
}

// ============== ACHIEVEMENT ANNOUNCEMENT ==============

interface AchievementData extends BaseTemplateData {
  learnerName: string;
  achievementName: string;
  achievementDescription: string;
  xpEarned: number;
  viewUrl: string;
}

export function achievementTemplate(data: AchievementData): { html: string; text: string } {
  const content = `
    <div class="content" style="text-align: center;">
      <h2>🎉 Achievement Unlocked!</h2>
      <p>Hi ${data.recipientName},</p>
      <p><strong>${data.learnerName}</strong> just earned a new achievement!</p>

      <div class="highlight" style="text-align: center;">
        <p style="font-size: 48px; margin: 0;">🏆</p>
        <h3 style="margin: 8px 0;">${data.achievementName}</h3>
        <p style="margin: 0; color: #666;">${data.achievementDescription}</p>
        <p style="margin: 8px 0 0 0;"><strong>+${data.xpEarned} XP</strong></p>
      </div>

      <p>
        <a href="${data.viewUrl}" class="button">View All Achievements</a>
      </p>
    </div>
    ${generateUnsubscribeFooter(data.unsubscribeUrl)}
  `;

  const html = wrapInTemplate(content, `${data.learnerName} earned: ${data.achievementName}`);

  const text = `
Achievement Unlocked!

Hi ${data.recipientName},

${data.learnerName} just earned a new achievement!

🏆 ${data.achievementName}
${data.achievementDescription}
+${data.xpEarned} XP

View all achievements: ${data.viewUrl}
  `.trim();

  return { html, text };
}

// ============== CONSENT REQUEST ==============

interface ConsentRequestData extends BaseTemplateData {
  childName: string;
  schoolName: string;
  consentUrl: string;
  expiresIn: string;
}

export function consentRequestTemplate(data: ConsentRequestData): { html: string; text: string } {
  const content = `
    <div class="content">
      <h2>Parental Consent Required</h2>
      <p>Hi ${data.recipientName},</p>
      <p>${data.schoolName} has invited <strong>${data.childName}</strong> to join Kaelyn's Academy, an educational platform for K-12 learners.</p>

      <p>As ${data.childName}'s parent/guardian, we need your consent before they can access the platform. This is required by law (COPPA) to protect children's privacy online.</p>

      <div class="highlight">
        <p style="margin: 0;"><strong>What we collect:</strong> Learning progress, quiz scores, and time spent</p>
        <p style="margin: 8px 0 0 0;"><strong>How we use it:</strong> To personalize learning and show progress reports</p>
        <p style="margin: 8px 0 0 0;"><strong>Your rights:</strong> View, download, or delete your child's data anytime</p>
      </div>

      <p>
        <a href="${data.consentUrl}" class="button">Review & Provide Consent</a>
      </p>

      <p style="font-size: 12px; color: #666;">This request expires in ${data.expiresIn}. If you didn't expect this email, please ignore it.</p>
    </div>
  `;

  const html = wrapInTemplate(content, `Parental consent needed for ${data.childName}`);

  const text = `
Parental Consent Required

Hi ${data.recipientName},

${data.schoolName} has invited ${data.childName} to join Kaelyn's Academy.

As their parent/guardian, we need your consent before they can access the platform.

What we collect: Learning progress, quiz scores, and time spent
How we use it: To personalize learning and show progress reports
Your rights: View, download, or delete your child's data anytime

Provide consent: ${data.consentUrl}

This request expires in ${data.expiresIn}.
  `.trim();

  return { html, text };
}

// ============== ASSIGNMENT REMINDER ==============

interface AssignmentReminderData extends BaseTemplateData {
  learnerName: string;
  assignmentTitle: string;
  subject: string;
  dueDate: string;
  viewUrl: string;
}

export function assignmentReminderTemplate(data: AssignmentReminderData): { html: string; text: string } {
  const content = `
    <div class="content">
      <h2>Assignment Reminder</h2>
      <p>Hi ${data.recipientName},</p>
      <p><strong>${data.learnerName}</strong> has an upcoming assignment due soon:</p>

      <div class="highlight">
        <p style="margin: 0;"><strong>📝 ${data.assignmentTitle}</strong></p>
        <p style="margin: 8px 0 0 0;"><strong>Subject:</strong> ${data.subject}</p>
        <p style="margin: 8px 0 0 0;"><strong>Due:</strong> ${data.dueDate}</p>
      </div>

      <p>
        <a href="${data.viewUrl}" class="button">View Assignment</a>
      </p>
    </div>
    ${generateUnsubscribeFooter(data.unsubscribeUrl)}
  `;

  const html = wrapInTemplate(content, `Reminder: ${data.assignmentTitle} due ${data.dueDate}`);

  const text = `
Assignment Reminder

Hi ${data.recipientName},

${data.learnerName} has an assignment due soon:

📝 ${data.assignmentTitle}
Subject: ${data.subject}
Due: ${data.dueDate}

View assignment: ${data.viewUrl}
  `.trim();

  return { html, text };
}
