'use server'

import { getGrievanceStats, getAllGrievancesWithAnalysis, insertBatchSummary } from '@/db/queries';
import { testDatabaseConnection } from '@/db/index';

export interface AnalyticsData {
  total_complaints: number;
  complaint_volume_by_category: Record<string, number>;
  sentiment_overview: Record<string, number>;
  urgency_distribution: Record<string, number>;
  weekly_summary: string;
  top_recurring_issues: string[];
  processed_complaints: any[];
  insights: {
    total_analyzed: number;
    pending_analysis: number;
    negative_percentage: number;
    urgent_percentage: number;
    most_common_category: string;
  };
  database_status: string;
  last_updated: string;
}

export async function getAnalyticsAction(): Promise<{
  success: boolean;
  data?: AnalyticsData;
  error?: string;
  details?: string;
}> {
  try {
    // Test database connection first
    const isConnected = await testDatabaseConnection();
    if (!isConnected) {
      return {
        success: false,
        error: 'Database connection failed',
        details: 'Please check your Neon database connection.'
      };
    }

    // Get statistics from database
    const stats = await getGrievanceStats();
    
    // Get recent grievances with analysis
    const grievancesWithAnalysis = await getAllGrievancesWithAnalysis();
    
    // Process all grievances (including those without analysis)
    const processedComplaints = grievancesWithAnalysis.map(item => ({
      id: item.grievance.id,
      raw_text: item.grievance.rawText,
      clean_text: item.analysis?.cleanText || item.grievance.rawText,
      category: item.analysis?.category || 'uncategorized',
      sentiment: item.analysis?.sentiment || 'neutral',
      urgency: item.analysis?.urgency || 'low',
      submitted_at: item.grievance.submittedAt,
      processed_at: item.analysis?.processedAt || null,
      user_info: item.grievance.userInfo,
    }));

    // Generate enhanced statistics with defaults
    const categories = stats.categories || {};
    const sentiments = stats.sentiments || {};
    const urgencies = stats.urgencies || {};

    // Ensure we have default values for all expected categories
    const defaultCategories = {
      'accommodation': 0,
      'food': 0,
      'facilities': 0,
      'staff': 0,
      'security': 0,
      'maintenance': 0,
      'uncategorized': 0,
      ...categories
    };

    const defaultSentiments = {
      'positive': 0,
      'neutral': 0,
      'negative': 0,
      ...sentiments
    };

    const defaultUrgencies = {
      'low': 0,
      'medium': 0,
      'high': 0,
      ...urgencies
    };

    // Generate top recurring issues
    const categoryFrequency = Object.entries(defaultCategories)
      .filter(([_, count]) => count > 0)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([category, count]) => ({ category, count }));

    // Generate insights and weekly summary
    const totalComplaints = stats.total || 0;
    const negativeCount = defaultSentiments.negative || 0;
    const highUrgencyCount = defaultUrgencies.high || 0;
    const negativePercentage = totalComplaints > 0 ? Math.round((negativeCount / totalComplaints) * 100) : 0;
    const urgentPercentage = totalComplaints > 0 ? Math.round((highUrgencyCount / totalComplaints) * 100) : 0;

    let weeklySummary;
    if (totalComplaints === 0) {
      weeklySummary = "No complaints have been submitted yet. The system is ready to receive and analyze grievances.";
    } else {
      const topCategories = categoryFrequency.slice(0, 3).map(item => item.category);
      weeklySummary = `Analysis of ${totalComplaints} complaint${totalComplaints === 1 ? '' : 's'}: ${negativePercentage}% showed negative sentiment and ${urgentPercentage}% were marked as high urgency. ${topCategories.length > 0 ? `Top categories: ${topCategories.join(', ')}.` : ''}`;
    }

    const analyticsData: AnalyticsData = {
      total_complaints: totalComplaints,
      complaint_volume_by_category: defaultCategories,
      sentiment_overview: defaultSentiments,
      urgency_distribution: defaultUrgencies,
      weekly_summary: weeklySummary,
      top_recurring_issues: categoryFrequency.map(item => item.category),
      processed_complaints: processedComplaints,
      insights: {
        total_analyzed: grievancesWithAnalysis.filter(item => item.analysis).length,
        pending_analysis: grievancesWithAnalysis.filter(item => !item.analysis).length,
        negative_percentage: negativePercentage,
        urgent_percentage: urgentPercentage,
        most_common_category: categoryFrequency[0]?.category || 'none',
      },
      database_status: 'connected',
      last_updated: new Date().toISOString(),
    };

    return {
      success: true,
      data: analyticsData
    };

  } catch (error) {
    console.error('Error fetching analytics:', error);
    
    // Provide meaningful error messages based on the error type
    let errorMessage = 'Internal server error';
    let errorDetails = 'An unexpected error occurred while fetching analytics.';
    
    if (error instanceof Error) {
      if (error.message.includes('relation') && error.message.includes('does not exist')) {
        errorMessage = 'Database tables not found';
        errorDetails = 'Please run database migrations: npm run db:push';
      } else if (error.message.includes('connect')) {
        errorMessage = 'Database connection error';
        errorDetails = 'Please check your Neon database connection string.';
      }
    }

    return {
      success: false,
      error: errorMessage,
      details: errorDetails
    };
  }
}

export async function storeBatchSummaryAction(summaryData: {
  batchName?: string;
  totalComplaints: number;
  complaintVolumeByCategory: any;
  sentimentOverview: any;
  urgencyDistribution: any;
  weeklySummary: string;
  topRecurringIssues: any;
  grievanceIds?: any;
}) {
  try {
    const summary = await insertBatchSummary(summaryData);
    return { success: true, summaryId: summary.id };
  } catch (error) {
    console.error('Error storing batch summary:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}
