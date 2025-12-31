/**
 * Email Notifications Service
 *
 * High-level service for sending notification emails.
 * Respects user email preferences and handles unsubscribe URLs.
 */

import { sendEmail, type SendEmailResult } from "./client";
import {
  newMessageTemplate,
  weeklyProgressTemplate,
  achievementTemplate,
  consentRequestTemplate,
  assignmentReminderTemplate,
} from "./templates";
import { logger } from "@/lib/logging";

// Base URL for generating links
const getBaseUrl = () => process.env.NEXT_PUBLIC_APP_URL || "https://kaelyns.academy";

/**
 * Generate unsubscribe URL for a user
 */
function getUnsubscribeUrl(userId: string, notificationType: string): string {
  const baseUrl = getBaseUrl();
  // Token should be generated server-side with proper signing
  const params = new URLSearchParams({
    userId,
    type: notificationType,
  });
  return `${baseUrl}/api/email/unsubscribe?${params.toString()}`;
}

/**
 * Email Notifications - high-level interface for sending notifications
 */
export const EmailNotifications = {
  /**
   * Send new message notification
   */
  async sendNewMessageNotification(params: {
    recipientEmail: string;
    recipientName: string;
    recipientUserId: string;
    senderName: string;
    messagePreview: string;
    conversationSubject: string;
    conversationId: string;
  }): Promise<SendEmailResult> {
    const viewUrl = `${getBaseUrl()}/messages/${params.conversationId}`;
    const unsubscribeUrl = getUnsubscribeUrl(params.recipientUserId, "messages");

    const { html, text } = newMessageTemplate({
      recipientName: params.recipientName,
      senderName: params.senderName,
      messagePreview: params.messagePreview,
      conversationSubject: params.conversationSubject,
      viewUrl,
      unsubscribeUrl,
    });

    logger.info("Sending new message notification", {
      to: params.recipientEmail,
      conversationId: params.conversationId,
    });

    return sendEmail({
      to: params.recipientEmail,
      subject: `New message from ${params.senderName}`,
      html,
      text,
      tags: [{ name: "type", value: "new_message" }],
    });
  },

  /**
   * Send weekly progress summary
   */
  async sendWeeklyProgressSummary(params: {
    recipientEmail: string;
    recipientName: string;
    recipientUserId: string;
    learnerName: string;
    learnerId: string;
    weekStart: string;
    weekEnd: string;
    lessonsCompleted: number;
    quizzesPassed: number;
    timeSpent: string;
    achievements: string[];
    topSubject: string;
  }): Promise<SendEmailResult> {
    const viewUrl = `${getBaseUrl()}/parent/learners/${params.learnerId}/progress`;
    const unsubscribeUrl = getUnsubscribeUrl(params.recipientUserId, "progress");

    const { html, text } = weeklyProgressTemplate({
      recipientName: params.recipientName,
      learnerName: params.learnerName,
      weekStart: params.weekStart,
      weekEnd: params.weekEnd,
      lessonsCompleted: params.lessonsCompleted,
      quizzesPassed: params.quizzesPassed,
      timeSpent: params.timeSpent,
      achievements: params.achievements,
      topSubject: params.topSubject,
      viewUrl,
      unsubscribeUrl,
    });

    logger.info("Sending weekly progress summary", {
      to: params.recipientEmail,
      learnerName: params.learnerName,
    });

    return sendEmail({
      to: params.recipientEmail,
      subject: `Weekly Progress: ${params.learnerName}`,
      html,
      text,
      tags: [{ name: "type", value: "weekly_progress" }],
    });
  },

  /**
   * Send achievement notification
   */
  async sendAchievementNotification(params: {
    recipientEmail: string;
    recipientName: string;
    recipientUserId: string;
    learnerName: string;
    learnerId: string;
    achievementName: string;
    achievementDescription: string;
    xpEarned: number;
  }): Promise<SendEmailResult> {
    const viewUrl = `${getBaseUrl()}/parent/learners/${params.learnerId}/achievements`;
    const unsubscribeUrl = getUnsubscribeUrl(params.recipientUserId, "achievements");

    const { html, text } = achievementTemplate({
      recipientName: params.recipientName,
      learnerName: params.learnerName,
      achievementName: params.achievementName,
      achievementDescription: params.achievementDescription,
      xpEarned: params.xpEarned,
      viewUrl,
      unsubscribeUrl,
    });

    logger.info("Sending achievement notification", {
      to: params.recipientEmail,
      achievementName: params.achievementName,
    });

    return sendEmail({
      to: params.recipientEmail,
      subject: `🏆 ${params.learnerName} earned: ${params.achievementName}`,
      html,
      text,
      tags: [{ name: "type", value: "achievement" }],
    });
  },

  /**
   * Send parental consent request
   */
  async sendConsentRequest(params: {
    recipientEmail: string;
    recipientName: string;
    childName: string;
    schoolName: string;
    consentToken: string;
    expiresIn: string;
  }): Promise<SendEmailResult> {
    const consentUrl = `${getBaseUrl()}/consent/${params.consentToken}`;

    const { html, text } = consentRequestTemplate({
      recipientName: params.recipientName,
      childName: params.childName,
      schoolName: params.schoolName,
      consentUrl,
      expiresIn: params.expiresIn,
    });

    logger.info("Sending consent request", {
      to: params.recipientEmail,
      childName: params.childName,
    });

    return sendEmail({
      to: params.recipientEmail,
      subject: `Parental consent needed for ${params.childName}`,
      html,
      text,
      tags: [{ name: "type", value: "consent_request" }],
    });
  },

  /**
   * Send assignment reminder
   */
  async sendAssignmentReminder(params: {
    recipientEmail: string;
    recipientName: string;
    recipientUserId: string;
    learnerName: string;
    assignmentId: string;
    assignmentTitle: string;
    subject: string;
    dueDate: string;
  }): Promise<SendEmailResult> {
    const viewUrl = `${getBaseUrl()}/assignments/${params.assignmentId}`;
    const unsubscribeUrl = getUnsubscribeUrl(params.recipientUserId, "reminders");

    const { html, text } = assignmentReminderTemplate({
      recipientName: params.recipientName,
      learnerName: params.learnerName,
      assignmentTitle: params.assignmentTitle,
      subject: params.subject,
      dueDate: params.dueDate,
      viewUrl,
      unsubscribeUrl,
    });

    logger.info("Sending assignment reminder", {
      to: params.recipientEmail,
      assignmentTitle: params.assignmentTitle,
    });

    return sendEmail({
      to: params.recipientEmail,
      subject: `Reminder: ${params.assignmentTitle} due ${params.dueDate}`,
      html,
      text,
      tags: [{ name: "type", value: "assignment_reminder" }],
    });
  },
};
