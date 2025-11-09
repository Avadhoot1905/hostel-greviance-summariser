import { pgTable, serial, text, timestamp, varchar, jsonb, integer } from 'drizzle-orm/pg-core';

// Table for storing raw user inputs/grievances
export const userGrievances = pgTable('user_grievances', {
  id: serial('id').primaryKey(),
  rawText: text('raw_text').notNull(),
  submittedAt: timestamp('submitted_at').defaultNow().notNull(),
  userInfo: jsonb('user_info'), // Optional: store user details like room number, name, etc.
  ipAddress: varchar('ip_address', { length: 45 }), // Optional: for tracking
});

// Table for storing AI analysis results and summaries
export const analysisResults = pgTable('analysis_results', {
  id: serial('id').primaryKey(),
  grievanceId: integer('grievance_id').references(() => userGrievances.id).notNull(),
  category: varchar('category', { length: 100 }).notNull(),
  sentiment: varchar('sentiment', { length: 50 }).notNull(),
  urgency: varchar('urgency', { length: 50 }).notNull(),
  cleanText: text('clean_text').notNull(),
  confidence: jsonb('confidence'), // Store confidence scores for each classification
  processedAt: timestamp('processed_at').defaultNow().notNull(),
});

// Table for storing batch processing results and summaries
export const batchSummaries = pgTable('batch_summaries', {
  id: serial('id').primaryKey(),
  batchName: varchar('batch_name', { length: 255 }), // Optional: name for the batch (e.g., CSV filename)
  totalComplaints: integer('total_complaints').notNull(),
  complaintVolumeByCategory: jsonb('complaint_volume_by_category').notNull(),
  sentimentOverview: jsonb('sentiment_overview').notNull(),
  urgencyDistribution: jsonb('urgency_distribution').notNull(),
  weeklySummary: text('weekly_summary').notNull(),
  topRecurringIssues: jsonb('top_recurring_issues').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  grievanceIds: jsonb('grievance_ids'), // Array of grievance IDs included in this summary
});

// Table for storing system-wide analytics and trends
export const systemAnalytics = pgTable('system_analytics', {
  id: serial('id').primaryKey(),
  analyticsDate: timestamp('analytics_date').defaultNow().notNull(),
  totalGrievances: integer('total_grievances').notNull(),
  categoryCounts: jsonb('category_counts').notNull(),
  sentimentCounts: jsonb('sentiment_counts').notNull(),
  urgencyCounts: jsonb('urgency_counts').notNull(),
  trendingIssues: jsonb('trending_issues'),
  weeklyGrowth: jsonb('weekly_growth'), // Week-over-week growth statistics
});

// Export types for TypeScript
export type UserGrievance = typeof userGrievances.$inferSelect;
export type NewUserGrievance = typeof userGrievances.$inferInsert;

export type AnalysisResult = typeof analysisResults.$inferSelect;
export type NewAnalysisResult = typeof analysisResults.$inferInsert;

export type BatchSummary = typeof batchSummaries.$inferSelect;
export type NewBatchSummary = typeof batchSummaries.$inferInsert;

export type SystemAnalytics = typeof systemAnalytics.$inferSelect;
export type NewSystemAnalytics = typeof systemAnalytics.$inferInsert;
