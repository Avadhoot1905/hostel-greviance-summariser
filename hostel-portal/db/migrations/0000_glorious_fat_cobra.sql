CREATE TABLE "analysis_results" (
	"id" serial PRIMARY KEY NOT NULL,
	"grievance_id" integer NOT NULL,
	"category" varchar(100) NOT NULL,
	"sentiment" varchar(50) NOT NULL,
	"urgency" varchar(50) NOT NULL,
	"clean_text" text NOT NULL,
	"confidence" jsonb,
	"processed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "batch_summaries" (
	"id" serial PRIMARY KEY NOT NULL,
	"batch_name" varchar(255),
	"total_complaints" integer NOT NULL,
	"complaint_volume_by_category" jsonb NOT NULL,
	"sentiment_overview" jsonb NOT NULL,
	"urgency_distribution" jsonb NOT NULL,
	"weekly_summary" text NOT NULL,
	"top_recurring_issues" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"grievance_ids" jsonb
);
--> statement-breakpoint
CREATE TABLE "system_analytics" (
	"id" serial PRIMARY KEY NOT NULL,
	"analytics_date" timestamp DEFAULT now() NOT NULL,
	"total_grievances" integer NOT NULL,
	"category_counts" jsonb NOT NULL,
	"sentiment_counts" jsonb NOT NULL,
	"urgency_counts" jsonb NOT NULL,
	"trending_issues" jsonb,
	"weekly_growth" jsonb
);
--> statement-breakpoint
CREATE TABLE "user_grievances" (
	"id" serial PRIMARY KEY NOT NULL,
	"raw_text" text NOT NULL,
	"submitted_at" timestamp DEFAULT now() NOT NULL,
	"user_info" jsonb,
	"ip_address" varchar(45)
);
--> statement-breakpoint
ALTER TABLE "analysis_results" ADD CONSTRAINT "analysis_results_grievance_id_user_grievances_id_fk" FOREIGN KEY ("grievance_id") REFERENCES "public"."user_grievances"("id") ON DELETE no action ON UPDATE no action;