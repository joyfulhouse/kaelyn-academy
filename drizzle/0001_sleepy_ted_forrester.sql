CREATE TABLE "organization_domains" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"domain" varchar(255) NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"verification_status" varchar(20) DEFAULT 'pending' NOT NULL,
	"verification_token" varchar(64),
	"verification_method" varchar(20) DEFAULT 'dns_txt',
	"verified_at" timestamp,
	"last_verification_attempt" timestamp,
	"verification_error" text,
	"ssl_enabled" boolean DEFAULT false NOT NULL,
	"ssl_certificate_id" varchar(255),
	"ssl_expires_at" timestamp,
	"auto_renew_ssl" boolean DEFAULT true NOT NULL,
	"routing_enabled" boolean DEFAULT false NOT NULL,
	"redirect_to_www" boolean DEFAULT false NOT NULL,
	"force_https" boolean DEFAULT true NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "organization_domains_domain_unique" UNIQUE("domain")
);
--> statement-breakpoint
CREATE TABLE "goal_progress_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"goal_id" uuid NOT NULL,
	"value" integer NOT NULL,
	"percent_complete" real NOT NULL,
	"notes" text,
	"recorded_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "learner_streaks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"learner_id" uuid NOT NULL,
	"organization_id" uuid NOT NULL,
	"current_streak" integer DEFAULT 0 NOT NULL,
	"longest_streak" integer DEFAULT 0 NOT NULL,
	"last_activity_date" timestamp,
	"freeze_tokens" integer DEFAULT 0 NOT NULL,
	"total_freeze_tokens_earned" integer DEFAULT 0 NOT NULL,
	"total_freeze_tokens_used" integer DEFAULT 0 NOT NULL,
	"total_repairs" integer DEFAULT 0 NOT NULL,
	"last_repair_date" timestamp,
	"milestones" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "learning_goals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"learner_id" uuid NOT NULL,
	"organization_id" uuid NOT NULL,
	"created_by_user_id" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"metric_type" varchar(50) NOT NULL,
	"target_value" integer NOT NULL,
	"current_value" integer DEFAULT 0,
	"subject_id" uuid,
	"config" jsonb,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp,
	"status" varchar(50) DEFAULT 'active' NOT NULL,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "learning_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"learner_id" uuid NOT NULL,
	"organization_id" uuid NOT NULL,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"ended_at" timestamp,
	"last_heartbeat_at" timestamp DEFAULT now(),
	"status" varchar(50) DEFAULT 'active' NOT NULL,
	"current_activity_type" varchar(50),
	"current_lesson_id" uuid,
	"current_activity_id" uuid,
	"current_subject_id" uuid,
	"total_active_time" integer DEFAULT 0,
	"total_paused_time" integer DEFAULT 0,
	"activities_completed" integer DEFAULT 0,
	"lessons_viewed" integer DEFAULT 0,
	"progress_snapshot" jsonb,
	"device_type" varchar(50),
	"browser_info" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "parent_session_notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"parent_user_id" uuid NOT NULL,
	"learner_id" uuid NOT NULL,
	"session_id" uuid,
	"organization_id" uuid NOT NULL,
	"notification_type" varchar(50) NOT NULL,
	"title" varchar(255) NOT NULL,
	"message" text NOT NULL,
	"read" boolean DEFAULT false,
	"dismissed" boolean DEFAULT false,
	"read_at" timestamp,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"learner_id" uuid NOT NULL,
	"organization_id" uuid NOT NULL,
	"event_type" varchar(50) NOT NULL,
	"lesson_id" uuid,
	"activity_id" uuid,
	"subject_id" uuid,
	"event_data" jsonb,
	"occurred_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "streak_freeze_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"learner_id" uuid NOT NULL,
	"organization_id" uuid NOT NULL,
	"action" varchar(50) NOT NULL,
	"tokens_change" integer NOT NULL,
	"reason" text,
	"streak_at_time" integer,
	"date_protected" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "streak_milestones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"days" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"icon_url" text,
	"freeze_token_reward" integer DEFAULT 0,
	"points" integer DEFAULT 0,
	"badge_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "streak_milestones_days_unique" UNIQUE("days")
);
--> statement-breakpoint
CREATE TABLE "streak_repair_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"learner_id" uuid NOT NULL,
	"organization_id" uuid NOT NULL,
	"streak_before" integer NOT NULL,
	"streak_after" integer NOT NULL,
	"days_missed" integer NOT NULL,
	"tokens_cost" integer NOT NULL,
	"broken_at" timestamp NOT NULL,
	"repaired_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "assignment_rubrics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"assignment_id" uuid NOT NULL,
	"rubric_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "assignment_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"teacher_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"template_type" varchar(50) DEFAULT 'homework' NOT NULL,
	"instructions" text,
	"questions" text,
	"attachments" text,
	"default_time_limit" integer,
	"default_total_points" integer DEFAULT 100,
	"default_passing_score" integer DEFAULT 70,
	"default_allow_late_submissions" boolean DEFAULT true,
	"default_max_attempts" integer DEFAULT 1,
	"lesson_ids" uuid[],
	"activity_ids" uuid[],
	"is_shared" boolean DEFAULT false,
	"is_public" boolean DEFAULT false,
	"usage_count" integer DEFAULT 0,
	"tags" varchar(50)[],
	"grade_level" integer,
	"subject_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "class_announcements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"class_id" uuid NOT NULL,
	"teacher_id" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"priority" varchar(20) DEFAULT 'normal' NOT NULL,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "grade_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"class_id" uuid NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"description" text,
	"weight_percentage" real DEFAULT 100 NOT NULL,
	"color" varchar(20),
	"display_order" integer DEFAULT 0,
	"drop_lowest" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "grade_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"grade_id" uuid NOT NULL,
	"changed_by" uuid NOT NULL,
	"previous_points_earned" real,
	"previous_letter_grade" varchar(5),
	"previous_feedback" text,
	"new_points_earned" real,
	"new_letter_grade" varchar(5),
	"new_feedback" text,
	"change_reason" text,
	"changed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "grades" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"class_id" uuid NOT NULL,
	"learner_id" uuid NOT NULL,
	"teacher_id" uuid NOT NULL,
	"category" varchar(50) DEFAULT 'assignment' NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"points_earned" real,
	"points_possible" real DEFAULT 100 NOT NULL,
	"percentage" real,
	"letter_grade" varchar(5),
	"weight" real DEFAULT 1,
	"feedback" text,
	"due_date" timestamp,
	"assignment_id" uuid,
	"graded_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rubric_criteria" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"rubric_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"max_points" integer DEFAULT 25 NOT NULL,
	"weight" real DEFAULT 1,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rubric_performance_levels" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"criterion_id" uuid NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"points" integer NOT NULL,
	"percentage" real NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rubrics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"teacher_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"total_points" integer DEFAULT 100 NOT NULL,
	"is_template" boolean DEFAULT false,
	"is_public" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "teacher_student_notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"teacher_id" uuid NOT NULL,
	"learner_id" uuid NOT NULL,
	"title" varchar(255),
	"content" text NOT NULL,
	"category" varchar(50) DEFAULT 'general',
	"is_pinned" boolean DEFAULT false,
	"is_private" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "content_approval_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"learner_id" uuid NOT NULL,
	"parent_user_id" uuid NOT NULL,
	"content_type" varchar(50) NOT NULL,
	"content_id" uuid,
	"content_title" varchar(255) NOT NULL,
	"content_description" text,
	"content_metadata" jsonb,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"request_reason" text,
	"response_reason" text,
	"responded_at" timestamp,
	"responded_by" uuid,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "parental_consent_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"parent_user_id" uuid NOT NULL,
	"learner_id" uuid,
	"verification_method" varchar(50) NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"parent_name" varchar(255) NOT NULL,
	"parent_email" varchar(255) NOT NULL,
	"relationship" varchar(50) NOT NULL,
	"child_name" varchar(255) NOT NULL,
	"child_birthdate" timestamp NOT NULL,
	"verification_token" varchar(255),
	"verification_code" varchar(10),
	"verification_code_expires" timestamp,
	"verification_attempts" jsonb DEFAULT '[]'::jsonb,
	"security_question" varchar(255),
	"security_answer_hash" varchar(255),
	"agreements" jsonb NOT NULL,
	"signature_text" varchar(255) NOT NULL,
	"signature_timestamp" timestamp NOT NULL,
	"signature_ip_address" varchar(45),
	"signature_user_agent" text,
	"consented_at" timestamp,
	"expires_at" timestamp,
	"revoked_at" timestamp,
	"revocation_reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "conversation_participants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversation_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" varchar(50) NOT NULL,
	"left_at" timestamp,
	"last_read_at" timestamp,
	"notifications_enabled" boolean DEFAULT true,
	"joined_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "conversations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"subject" varchar(255) NOT NULL,
	"learner_id" uuid,
	"type" varchar(50) DEFAULT 'general' NOT NULL,
	"status" varchar(50) DEFAULT 'open' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"closed_at" timestamp,
	"last_message_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "message_attachments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"message_id" uuid NOT NULL,
	"file_name" varchar(255) NOT NULL,
	"file_type" varchar(100) NOT NULL,
	"file_size" varchar(50) NOT NULL,
	"storage_url" text NOT NULL,
	"thumbnail_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversation_id" uuid NOT NULL,
	"sender_id" uuid NOT NULL,
	"content" text NOT NULL,
	"type" varchar(50) DEFAULT 'text' NOT NULL,
	"system_event_type" varchar(50),
	"is_edited" boolean DEFAULT false,
	"edited_at" timestamp,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "read_receipts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"message_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"read_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_id" uuid NOT NULL,
	"actor_role" varchar(50) NOT NULL,
	"actor_email" varchar(255),
	"organization_id" uuid,
	"action" varchar(100) NOT NULL,
	"category" varchar(50) NOT NULL,
	"resource_type" varchar(100) NOT NULL,
	"resource_id" uuid,
	"resource_name" varchar(255),
	"description" text,
	"metadata" jsonb,
	"status" varchar(20) DEFAULT 'success' NOT NULL,
	"error_message" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "system_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" varchar(50) DEFAULT 'default' NOT NULL,
	"settings" jsonb NOT NULL,
	"updated_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "system_settings_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "ai_usage" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"period_start" timestamp NOT NULL,
	"period_end" timestamp NOT NULL,
	"total_requests" integer DEFAULT 0 NOT NULL,
	"input_tokens" integer DEFAULT 0 NOT NULL,
	"output_tokens" integer DEFAULT 0 NOT NULL,
	"estimated_cost" integer DEFAULT 0 NOT NULL,
	"billed_amount" integer DEFAULT 0,
	"usage_by_provider" jsonb,
	"usage_by_feature" jsonb,
	"status" varchar(50) DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "billing_webhook_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"stripe_event_id" varchar(255) NOT NULL,
	"event_type" varchar(100) NOT NULL,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"error_message" text,
	"payload" jsonb,
	"processed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "billing_webhook_events_stripe_event_id_unique" UNIQUE("stripe_event_id")
);
--> statement-breakpoint
CREATE TABLE "coupon_redemptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"coupon_id" uuid NOT NULL,
	"organization_id" uuid NOT NULL,
	"subscription_id" uuid,
	"discount_applied" integer DEFAULT 0 NOT NULL,
	"redeemed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "coupons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(50) NOT NULL,
	"description" text,
	"discount_type" varchar(20) DEFAULT 'percent' NOT NULL,
	"discount_value" numeric(10, 2) NOT NULL,
	"max_redemptions" integer,
	"times_redeemed" integer DEFAULT 0 NOT NULL,
	"applicable_plans" jsonb,
	"valid_from" timestamp,
	"valid_until" timestamp,
	"is_active" boolean DEFAULT true NOT NULL,
	"stripe_coupon_id" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "coupons_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"subscription_id" uuid,
	"stripe_invoice_id" varchar(255),
	"stripe_payment_intent_id" varchar(255),
	"invoice_number" varchar(100),
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"currency" varchar(3) DEFAULT 'usd' NOT NULL,
	"subtotal" integer DEFAULT 0 NOT NULL,
	"tax" integer DEFAULT 0 NOT NULL,
	"total" integer DEFAULT 0 NOT NULL,
	"amount_paid" integer DEFAULT 0 NOT NULL,
	"amount_due" integer DEFAULT 0 NOT NULL,
	"line_items" jsonb,
	"period_start" timestamp,
	"period_end" timestamp,
	"due_date" timestamp,
	"paid_at" timestamp,
	"invoice_pdf_url" text,
	"hosted_invoice_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "invoices_stripe_invoice_id_unique" UNIQUE("stripe_invoice_id")
);
--> statement-breakpoint
CREATE TABLE "payment_methods" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"stripe_payment_method_id" varchar(255) NOT NULL,
	"type" varchar(50) DEFAULT 'card' NOT NULL,
	"brand" varchar(50),
	"last4" varchar(4),
	"expiry_month" integer,
	"expiry_year" integer,
	"is_default" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "payment_methods_stripe_payment_method_id_unique" UNIQUE("stripe_payment_method_id")
);
--> statement-breakpoint
CREATE TABLE "subscription_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" varchar(50) NOT NULL,
	"description" text,
	"price_monthly" integer DEFAULT 0 NOT NULL,
	"price_yearly" integer DEFAULT 0 NOT NULL,
	"stripe_product_id" varchar(255),
	"stripe_price_id_monthly" varchar(255),
	"stripe_price_id_yearly" varchar(255),
	"limits" jsonb NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_popular" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "subscription_plans_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"plan_id" uuid NOT NULL,
	"stripe_customer_id" varchar(255),
	"stripe_subscription_id" varchar(255),
	"stripe_price_id" varchar(255),
	"status" varchar(50) DEFAULT 'active' NOT NULL,
	"billing_cycle" varchar(20) DEFAULT 'monthly' NOT NULL,
	"current_period_start" timestamp,
	"current_period_end" timestamp,
	"cancel_at_period_end" boolean DEFAULT false NOT NULL,
	"canceled_at" timestamp,
	"trial_start" timestamp,
	"trial_end" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "subscriptions_organization_id_unique" UNIQUE("organization_id")
);
--> statement-breakpoint
ALTER TABLE "activities" ADD COLUMN "min_grade_level" integer;--> statement-breakpoint
ALTER TABLE "activities" ADD COLUMN "max_grade_level" integer;--> statement-breakpoint
ALTER TABLE "activities" ADD COLUMN "has_audio_support" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "activities" ADD COLUMN "has_visual_alternative" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "activities" ADD COLUMN "mobile_optimized" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "organization_domains" ADD CONSTRAINT "organization_domains_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "goal_progress_history" ADD CONSTRAINT "goal_progress_history_goal_id_learning_goals_id_fk" FOREIGN KEY ("goal_id") REFERENCES "public"."learning_goals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learner_streaks" ADD CONSTRAINT "learner_streaks_learner_id_learners_id_fk" FOREIGN KEY ("learner_id") REFERENCES "public"."learners"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learner_streaks" ADD CONSTRAINT "learner_streaks_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_goals" ADD CONSTRAINT "learning_goals_learner_id_learners_id_fk" FOREIGN KEY ("learner_id") REFERENCES "public"."learners"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_goals" ADD CONSTRAINT "learning_goals_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_goals" ADD CONSTRAINT "learning_goals_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_sessions" ADD CONSTRAINT "learning_sessions_learner_id_learners_id_fk" FOREIGN KEY ("learner_id") REFERENCES "public"."learners"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_sessions" ADD CONSTRAINT "learning_sessions_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_sessions" ADD CONSTRAINT "learning_sessions_current_lesson_id_lessons_id_fk" FOREIGN KEY ("current_lesson_id") REFERENCES "public"."lessons"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_sessions" ADD CONSTRAINT "learning_sessions_current_activity_id_activities_id_fk" FOREIGN KEY ("current_activity_id") REFERENCES "public"."activities"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_sessions" ADD CONSTRAINT "learning_sessions_current_subject_id_subjects_id_fk" FOREIGN KEY ("current_subject_id") REFERENCES "public"."subjects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parent_session_notifications" ADD CONSTRAINT "parent_session_notifications_parent_user_id_users_id_fk" FOREIGN KEY ("parent_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parent_session_notifications" ADD CONSTRAINT "parent_session_notifications_learner_id_learners_id_fk" FOREIGN KEY ("learner_id") REFERENCES "public"."learners"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parent_session_notifications" ADD CONSTRAINT "parent_session_notifications_session_id_learning_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."learning_sessions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parent_session_notifications" ADD CONSTRAINT "parent_session_notifications_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_events" ADD CONSTRAINT "session_events_session_id_learning_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."learning_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_events" ADD CONSTRAINT "session_events_learner_id_learners_id_fk" FOREIGN KEY ("learner_id") REFERENCES "public"."learners"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_events" ADD CONSTRAINT "session_events_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_events" ADD CONSTRAINT "session_events_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_events" ADD CONSTRAINT "session_events_activity_id_activities_id_fk" FOREIGN KEY ("activity_id") REFERENCES "public"."activities"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_events" ADD CONSTRAINT "session_events_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "streak_freeze_history" ADD CONSTRAINT "streak_freeze_history_learner_id_learners_id_fk" FOREIGN KEY ("learner_id") REFERENCES "public"."learners"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "streak_freeze_history" ADD CONSTRAINT "streak_freeze_history_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "streak_repair_history" ADD CONSTRAINT "streak_repair_history_learner_id_learners_id_fk" FOREIGN KEY ("learner_id") REFERENCES "public"."learners"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "streak_repair_history" ADD CONSTRAINT "streak_repair_history_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assignment_rubrics" ADD CONSTRAINT "assignment_rubrics_assignment_id_assignments_id_fk" FOREIGN KEY ("assignment_id") REFERENCES "public"."assignments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assignment_rubrics" ADD CONSTRAINT "assignment_rubrics_rubric_id_rubrics_id_fk" FOREIGN KEY ("rubric_id") REFERENCES "public"."rubrics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assignment_templates" ADD CONSTRAINT "assignment_templates_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assignment_templates" ADD CONSTRAINT "assignment_templates_teacher_id_users_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "class_announcements" ADD CONSTRAINT "class_announcements_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "class_announcements" ADD CONSTRAINT "class_announcements_teacher_id_users_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "grade_categories" ADD CONSTRAINT "grade_categories_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "grade_history" ADD CONSTRAINT "grade_history_grade_id_grades_id_fk" FOREIGN KEY ("grade_id") REFERENCES "public"."grades"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "grade_history" ADD CONSTRAINT "grade_history_changed_by_users_id_fk" FOREIGN KEY ("changed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "grades" ADD CONSTRAINT "grades_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "grades" ADD CONSTRAINT "grades_learner_id_learners_id_fk" FOREIGN KEY ("learner_id") REFERENCES "public"."learners"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "grades" ADD CONSTRAINT "grades_teacher_id_users_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "grades" ADD CONSTRAINT "grades_assignment_id_assignments_id_fk" FOREIGN KEY ("assignment_id") REFERENCES "public"."assignments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rubric_criteria" ADD CONSTRAINT "rubric_criteria_rubric_id_rubrics_id_fk" FOREIGN KEY ("rubric_id") REFERENCES "public"."rubrics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rubric_performance_levels" ADD CONSTRAINT "rubric_performance_levels_criterion_id_rubric_criteria_id_fk" FOREIGN KEY ("criterion_id") REFERENCES "public"."rubric_criteria"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rubrics" ADD CONSTRAINT "rubrics_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rubrics" ADD CONSTRAINT "rubrics_teacher_id_users_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teacher_student_notes" ADD CONSTRAINT "teacher_student_notes_teacher_id_users_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teacher_student_notes" ADD CONSTRAINT "teacher_student_notes_learner_id_learners_id_fk" FOREIGN KEY ("learner_id") REFERENCES "public"."learners"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_approval_requests" ADD CONSTRAINT "content_approval_requests_learner_id_learners_id_fk" FOREIGN KEY ("learner_id") REFERENCES "public"."learners"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_approval_requests" ADD CONSTRAINT "content_approval_requests_parent_user_id_users_id_fk" FOREIGN KEY ("parent_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_approval_requests" ADD CONSTRAINT "content_approval_requests_responded_by_users_id_fk" FOREIGN KEY ("responded_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parental_consent_records" ADD CONSTRAINT "parental_consent_records_parent_user_id_users_id_fk" FOREIGN KEY ("parent_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parental_consent_records" ADD CONSTRAINT "parental_consent_records_learner_id_learners_id_fk" FOREIGN KEY ("learner_id") REFERENCES "public"."learners"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversation_participants" ADD CONSTRAINT "conversation_participants_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversation_participants" ADD CONSTRAINT "conversation_participants_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_learner_id_learners_id_fk" FOREIGN KEY ("learner_id") REFERENCES "public"."learners"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message_attachments" ADD CONSTRAINT "message_attachments_message_id_messages_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."messages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "read_receipts" ADD CONSTRAINT "read_receipts_message_id_messages_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."messages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "read_receipts" ADD CONSTRAINT "read_receipts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_usage" ADD CONSTRAINT "ai_usage_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coupon_redemptions" ADD CONSTRAINT "coupon_redemptions_coupon_id_coupons_id_fk" FOREIGN KEY ("coupon_id") REFERENCES "public"."coupons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coupon_redemptions" ADD CONSTRAINT "coupon_redemptions_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coupon_redemptions" ADD CONSTRAINT "coupon_redemptions_subscription_id_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_subscription_id_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_methods" ADD CONSTRAINT "payment_methods_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_plan_id_subscription_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."subscription_plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_org_domains_org_id" ON "organization_domains" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "idx_org_domains_domain" ON "organization_domains" USING btree ("domain");--> statement-breakpoint
CREATE INDEX "idx_org_domains_verification_status" ON "organization_domains" USING btree ("verification_status");--> statement-breakpoint
CREATE INDEX "goal_progress_history_goal_idx" ON "goal_progress_history" USING btree ("goal_id");--> statement-breakpoint
CREATE INDEX "goal_progress_history_recorded_idx" ON "goal_progress_history" USING btree ("recorded_at");--> statement-breakpoint
CREATE INDEX "learner_streaks_learner_idx" ON "learner_streaks" USING btree ("learner_id");--> statement-breakpoint
CREATE INDEX "learner_streaks_org_idx" ON "learner_streaks" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "learning_goals_learner_idx" ON "learning_goals" USING btree ("learner_id");--> statement-breakpoint
CREATE INDEX "learning_goals_org_idx" ON "learning_goals" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "learning_goals_status_idx" ON "learning_goals" USING btree ("status");--> statement-breakpoint
CREATE INDEX "learning_goals_dates_idx" ON "learning_goals" USING btree ("start_date","end_date");--> statement-breakpoint
CREATE INDEX "learning_sessions_learner_idx" ON "learning_sessions" USING btree ("learner_id");--> statement-breakpoint
CREATE INDEX "learning_sessions_org_idx" ON "learning_sessions" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "learning_sessions_status_idx" ON "learning_sessions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "learning_sessions_started_at_idx" ON "learning_sessions" USING btree ("started_at");--> statement-breakpoint
CREATE INDEX "parent_session_notifications_parent_idx" ON "parent_session_notifications" USING btree ("parent_user_id");--> statement-breakpoint
CREATE INDEX "parent_session_notifications_learner_idx" ON "parent_session_notifications" USING btree ("learner_id");--> statement-breakpoint
CREATE INDEX "parent_session_notifications_read_idx" ON "parent_session_notifications" USING btree ("read");--> statement-breakpoint
CREATE INDEX "parent_session_notifications_created_at_idx" ON "parent_session_notifications" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "session_events_session_idx" ON "session_events" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "session_events_learner_idx" ON "session_events" USING btree ("learner_id");--> statement-breakpoint
CREATE INDEX "session_events_occurred_at_idx" ON "session_events" USING btree ("occurred_at");--> statement-breakpoint
CREATE INDEX "streak_freeze_history_learner_idx" ON "streak_freeze_history" USING btree ("learner_id");--> statement-breakpoint
CREATE INDEX "streak_freeze_history_org_idx" ON "streak_freeze_history" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "streak_freeze_history_created_idx" ON "streak_freeze_history" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "streak_repair_history_learner_idx" ON "streak_repair_history" USING btree ("learner_id");--> statement-breakpoint
CREATE INDEX "streak_repair_history_org_idx" ON "streak_repair_history" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "approval_learner_id_idx" ON "content_approval_requests" USING btree ("learner_id");--> statement-breakpoint
CREATE INDEX "approval_parent_user_id_idx" ON "content_approval_requests" USING btree ("parent_user_id");--> statement-breakpoint
CREATE INDEX "approval_status_idx" ON "content_approval_requests" USING btree ("status");--> statement-breakpoint
CREATE INDEX "approval_content_type_idx" ON "content_approval_requests" USING btree ("content_type");--> statement-breakpoint
CREATE INDEX "approval_pending_idx" ON "content_approval_requests" USING btree ("parent_user_id","status");--> statement-breakpoint
CREATE INDEX "consent_parent_user_id_idx" ON "parental_consent_records" USING btree ("parent_user_id");--> statement-breakpoint
CREATE INDEX "consent_learner_id_idx" ON "parental_consent_records" USING btree ("learner_id");--> statement-breakpoint
CREATE INDEX "consent_status_idx" ON "parental_consent_records" USING btree ("status");--> statement-breakpoint
CREATE INDEX "consent_verification_token_idx" ON "parental_consent_records" USING btree ("verification_token");--> statement-breakpoint
CREATE INDEX "participants_conversation_idx" ON "conversation_participants" USING btree ("conversation_id");--> statement-breakpoint
CREATE INDEX "participants_user_idx" ON "conversation_participants" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "conversations_org_idx" ON "conversations" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "conversations_learner_idx" ON "conversations" USING btree ("learner_id");--> statement-breakpoint
CREATE INDEX "conversations_status_idx" ON "conversations" USING btree ("status");--> statement-breakpoint
CREATE INDEX "conversations_last_message_idx" ON "conversations" USING btree ("last_message_at");--> statement-breakpoint
CREATE INDEX "attachments_message_idx" ON "message_attachments" USING btree ("message_id");--> statement-breakpoint
CREATE INDEX "messages_conversation_idx" ON "messages" USING btree ("conversation_id");--> statement-breakpoint
CREATE INDEX "messages_sender_idx" ON "messages" USING btree ("sender_id");--> statement-breakpoint
CREATE INDEX "messages_created_idx" ON "messages" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "receipts_message_idx" ON "read_receipts" USING btree ("message_id");--> statement-breakpoint
CREATE INDEX "receipts_user_idx" ON "read_receipts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "audit_logs_actor_idx" ON "audit_logs" USING btree ("actor_id");--> statement-breakpoint
CREATE INDEX "audit_logs_org_idx" ON "audit_logs" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "audit_logs_resource_idx" ON "audit_logs" USING btree ("resource_type","resource_id");--> statement-breakpoint
CREATE INDEX "audit_logs_action_idx" ON "audit_logs" USING btree ("action");--> statement-breakpoint
CREATE INDEX "audit_logs_category_idx" ON "audit_logs" USING btree ("category");--> statement-breakpoint
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "activity_attempts_learner_activity_idx" ON "activity_attempts" USING btree ("learner_id","activity_id");--> statement-breakpoint
CREATE INDEX "activity_attempts_org_idx" ON "activity_attempts" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "concept_mastery_learner_concept_idx" ON "concept_mastery" USING btree ("learner_id","concept_id");--> statement-breakpoint
CREATE INDEX "concept_mastery_org_idx" ON "concept_mastery" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "learner_achievements_learner_idx" ON "learner_achievements" USING btree ("learner_id");--> statement-breakpoint
CREATE INDEX "learner_achievements_org_idx" ON "learner_achievements" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "learner_subject_progress_learner_subject_idx" ON "learner_subject_progress" USING btree ("learner_id","subject_id");--> statement-breakpoint
CREATE INDEX "learner_subject_progress_org_idx" ON "learner_subject_progress" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "lesson_progress_learner_lesson_idx" ON "lesson_progress" USING btree ("learner_id","lesson_id");--> statement-breakpoint
CREATE INDEX "lesson_progress_org_idx" ON "lesson_progress" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "unit_progress_learner_unit_idx" ON "unit_progress" USING btree ("learner_id","unit_id");--> statement-breakpoint
CREATE INDEX "unit_progress_org_idx" ON "unit_progress" USING btree ("organization_id");