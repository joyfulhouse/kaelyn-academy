/**
 * Email Module
 *
 * Exports email client and templates for sending notifications.
 */

export { sendEmail, sendBatchEmails, type EmailOptions, type SendEmailResult } from "./client";
export {
  newMessageTemplate,
  weeklyProgressTemplate,
  achievementTemplate,
  consentRequestTemplate,
  assignmentReminderTemplate,
} from "./templates";
export { EmailNotifications } from "./notifications";
