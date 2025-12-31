import { pgTable, uuid, varchar, timestamp, jsonb } from "drizzle-orm/pg-core";

/**
 * System Settings Schema
 * Platform-wide configuration stored as a single-row table
 */

export interface GeneralSettings {
  siteName: string;
  supportEmail: string;
  maintenanceMode: boolean;
  registrationOpen: boolean;
}

export interface LearningSettings {
  defaultDifficulty: number;
  adaptiveDifficultyEnabled: boolean;
  lessonTimeLimit: number;
  maxDailyLessons: number;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  parentDigestFrequency: "daily" | "weekly" | "monthly";
  achievementAlerts: boolean;
}

export interface SecuritySettings {
  sessionTimeout: number;
  maxLoginAttempts: number;
  requireStrongPasswords: boolean;
  twoFactorRequired: boolean;
}

export interface AISettings {
  aiTutoringEnabled: boolean;
  maxQuestionsPerDay: number;
  contentModerationLevel: "low" | "medium" | "high";
  responseTimeout: number;
}

export interface SystemSettingsData {
  general: GeneralSettings;
  learning: LearningSettings;
  notifications: NotificationSettings;
  security: SecuritySettings;
  ai: AISettings;
}

export const defaultSystemSettings: SystemSettingsData = {
  general: {
    siteName: "Kaelyn's Academy",
    supportEmail: "support@kaelyns.academy",
    maintenanceMode: false,
    registrationOpen: true,
  },
  learning: {
    defaultDifficulty: 3,
    adaptiveDifficultyEnabled: true,
    lessonTimeLimit: 45,
    maxDailyLessons: 10,
  },
  notifications: {
    emailNotifications: true,
    pushNotifications: true,
    parentDigestFrequency: "weekly",
    achievementAlerts: true,
  },
  security: {
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    requireStrongPasswords: true,
    twoFactorRequired: false,
  },
  ai: {
    aiTutoringEnabled: true,
    maxQuestionsPerDay: 50,
    contentModerationLevel: "medium",
    responseTimeout: 30,
  },
};

export const systemSettings = pgTable("system_settings", {
  id: uuid("id").primaryKey().defaultRandom(),
  key: varchar("key", { length: 50 }).notNull().unique().default("default"),
  settings: jsonb("settings").$type<SystemSettingsData>().notNull(),
  updatedBy: uuid("updated_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
