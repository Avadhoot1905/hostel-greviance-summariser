'use server'

import { revalidatePath } from 'next/cache';
import { insertGrievance, insertAnalysisResult } from '@/db/queries';
import { testDatabaseConnection } from '@/db/index';

export interface SubmitGrievanceResult {
  success: boolean;
  grievanceId?: number;
  error?: string;
  details?: string;
}

export async function submitGrievanceAction(formData: FormData): Promise<SubmitGrievanceResult> {
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

    // Extract form data
    const rawText = formData.get('raw_text') as string;
    const name = formData.get('name') as string;
    const roomNumber = formData.get('roomNumber') as string;
    const email = formData.get('email') as string;

    if (!rawText?.trim()) {
      return {
        success: false,
        error: 'Grievance text is required'
      };
    }

    // Prepare user info
    const userInfo = (name || roomNumber || email) ? {
      name: name || undefined,
      roomNumber: roomNumber || undefined,
      email: email || undefined,
    } : null;

    // Store the grievance in database
    const grievance = await insertGrievance({
      rawText: rawText.trim(),
      userInfo,
      ipAddress: 'server-action', // Server actions don't have access to IP
    });

    // Revalidate paths that might display this data
    revalidatePath('/admin');
    revalidatePath('/api/analytics');

    return {
      success: true,
      grievanceId: grievance.id
    };

  } catch (error) {
    console.error('Error submitting grievance:', error);
    return {
      success: false,
      error: 'Failed to submit grievance',
      details: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function submitGrievanceWithAnalysisAction(
  rawText: string,
  userInfo: any = null
): Promise<SubmitGrievanceResult & { analysisData?: any }> {
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

    if (!rawText?.trim()) {
      return {
        success: false,
        error: 'Grievance text is required'
      };
    }

    // Store the grievance in database first
    const grievance = await insertGrievance({
      rawText: rawText.trim(),
      userInfo,
      ipAddress: 'api-action',
    });

    // Revalidate paths that might display this data
    revalidatePath('/admin');

    return {
      success: true,
      grievanceId: grievance.id
    };

  } catch (error) {
    console.error('Error submitting grievance with analysis:', error);
    return {
      success: false,
      error: 'Failed to submit grievance',
      details: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function storeAnalysisResultAction(
  grievanceId: number,
  analysisData: {
    category: string;
    sentiment: string;
    urgency: string;
    cleanText: string;
    confidence?: any;
  }
) {
  try {
    const analysis = await insertAnalysisResult({
      grievanceId,
      category: analysisData.category,
      sentiment: analysisData.sentiment,
      urgency: analysisData.urgency,
      cleanText: analysisData.cleanText,
      confidence: analysisData.confidence || null,
    });

    // Revalidate paths that might display this data
    revalidatePath('/admin');

    return { success: true, analysisId: analysis.id };
  } catch (error) {
    console.error('Error storing analysis result:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}
