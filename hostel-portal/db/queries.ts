import { db } from './index';
import { userGrievances, analysisResults, batchSummaries, systemAnalytics } from './schema';
import { eq, desc, sql, count } from 'drizzle-orm';
import type { NewUserGrievance, NewAnalysisResult, NewBatchSummary } from './schema';

// User Grievances Functions
export async function insertGrievance(grievance: NewUserGrievance) {
  const [result] = await db.insert(userGrievances).values(grievance).returning();
  return result;
}

export async function getGrievanceById(id: number) {
  const [result] = await db.select().from(userGrievances).where(eq(userGrievances.id, id));
  return result;
}

export async function getAllGrievances() {
  return await db.select().from(userGrievances).orderBy(desc(userGrievances.submittedAt));
}

// Analysis Results Functions
export async function insertAnalysisResult(analysis: NewAnalysisResult) {
  const [result] = await db.insert(analysisResults).values(analysis).returning();
  return result;
}

export async function getAnalysisByGrievanceId(grievanceId: number) {
  const [result] = await db.select().from(analysisResults).where(eq(analysisResults.grievanceId, grievanceId));
  return result;
}

export async function getGrievanceWithAnalysis(grievanceId: number) {
  const result = await db
    .select({
      grievance: userGrievances,
      analysis: analysisResults,
    })
    .from(userGrievances)
    .leftJoin(analysisResults, eq(userGrievances.id, analysisResults.grievanceId))
    .where(eq(userGrievances.id, grievanceId));
  
  return result[0];
}

export async function getAllGrievancesWithAnalysis() {
  return await db
    .select({
      grievance: userGrievances,
      analysis: analysisResults,
    })
    .from(userGrievances)
    .leftJoin(analysisResults, eq(userGrievances.id, analysisResults.grievanceId))
    .orderBy(desc(userGrievances.submittedAt));
}

// Batch Summary Functions
export async function insertBatchSummary(summary: NewBatchSummary) {
  const [result] = await db.insert(batchSummaries).values(summary).returning();
  return result;
}

export async function getLatestBatchSummary() {
  const [result] = await db.select().from(batchSummaries).orderBy(desc(batchSummaries.createdAt)).limit(1);
  return result;
}

export async function getAllBatchSummaries() {
  return await db.select().from(batchSummaries).orderBy(desc(batchSummaries.createdAt));
}

// Analytics Functions
export async function getGrievanceStats() {
  const totalCount = await db.select({ count: count() }).from(userGrievances);
  
  const categoryStats = await db
    .select({
      category: analysisResults.category,
      count: count(),
    })
    .from(analysisResults)
    .groupBy(analysisResults.category);

  const sentimentStats = await db
    .select({
      sentiment: analysisResults.sentiment,
      count: count(),
    })
    .from(analysisResults)
    .groupBy(analysisResults.sentiment);

  const urgencyStats = await db
    .select({
      urgency: analysisResults.urgency,
      count: count(),
    })
    .from(analysisResults)
    .groupBy(analysisResults.urgency);

  return {
    total: totalCount[0]?.count || 0,
    categories: categoryStats.reduce((acc, item) => {
      acc[item.category] = item.count;
      return acc;
    }, {} as Record<string, number>),
    sentiments: sentimentStats.reduce((acc, item) => {
      acc[item.sentiment] = item.count;
      return acc;
    }, {} as Record<string, number>),
    urgencies: urgencyStats.reduce((acc, item) => {
      acc[item.urgency] = item.count;
      return acc;
    }, {} as Record<string, number>),
  };
}

export async function getRecentGrievances(limit: number = 10) {
  return await db
    .select({
      grievance: userGrievances,
      analysis: analysisResults,
    })
    .from(userGrievances)
    .leftJoin(analysisResults, eq(userGrievances.id, analysisResults.grievanceId))
    .orderBy(desc(userGrievances.submittedAt))
    .limit(limit);
}

// Search and Filter Functions
export async function searchGrievances(searchTerm: string) {
  return await db
    .select({
      grievance: userGrievances,
      analysis: analysisResults,
    })
    .from(userGrievances)
    .leftJoin(analysisResults, eq(userGrievances.id, analysisResults.grievanceId))
    .where(sql`${userGrievances.rawText} ILIKE ${`%${searchTerm}%`}`)
    .orderBy(desc(userGrievances.submittedAt));
}

export async function getGrievancesByCategory(category: string) {
  return await db
    .select({
      grievance: userGrievances,
      analysis: analysisResults,
    })
    .from(userGrievances)
    .innerJoin(analysisResults, eq(userGrievances.id, analysisResults.grievanceId))
    .where(eq(analysisResults.category, category))
    .orderBy(desc(userGrievances.submittedAt));
}

export async function getGrievancesBySentiment(sentiment: string) {
  return await db
    .select({
      grievance: userGrievances,
      analysis: analysisResults,
    })
    .from(userGrievances)
    .innerJoin(analysisResults, eq(userGrievances.id, analysisResults.grievanceId))
    .where(eq(analysisResults.sentiment, sentiment))
    .orderBy(desc(userGrievances.submittedAt));
}

export async function getGrievancesByUrgency(urgency: string) {
  return await db
    .select({
      grievance: userGrievances,
      analysis: analysisResults,
    })
    .from(userGrievances)
    .innerJoin(analysisResults, eq(userGrievances.id, analysisResults.grievanceId))
    .where(eq(analysisResults.urgency, urgency))
    .orderBy(desc(userGrievances.submittedAt));
}
