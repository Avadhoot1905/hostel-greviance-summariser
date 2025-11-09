import { NextRequest, NextResponse } from 'next/server';
import { submitGrievanceWithAnalysisAction, storeAnalysisResultAction } from '@/app/actions/grievance-actions';
import { storeBatchSummaryAction } from '@/app/actions/analytics-actions';
import type { UserGrievance, AnalysisResult } from '@/db/schema';

// This API route handles CSV uploads with Python script analysis
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    if (!file.name.endsWith('.csv')) {
      return NextResponse.json({ error: 'File must be a CSV' }, { status: 400 });
    }

    // Forward the file to the Python backend for processing
    const backendFormData = new FormData();
    backendFormData.append('file', file);
    const backendUrl = process.env.PYTHON_BACKEND_URL || 'http://localhost:8000';

    let analysisData = null;
    try {
      const analysisResponse = await fetch(`${backendUrl}/analyze/csv`, {
        method: 'POST',
        body: backendFormData,
      });

      if (!analysisResponse.ok) {
        throw new Error(`Backend analysis service returned status: ${analysisResponse.status}`);
      }

      analysisData = await analysisResponse.json();
    } catch (error) {
      console.error('Backend analysis error:', error);
      return NextResponse.json(
        { 
          error: 'AI analysis service is not available. Please ensure the Python backend is running.',
          details: `Start the backend with: cd backend && ./start_backend.sh`,
          backend_url: backendUrl
        }, 
        { status: 503 }
      );
    }

    // Store each processed complaint in the database using server actions
    const storedGrievances: { id: number }[] = [];
    const storedAnalyses: { id: number }[] = [];

    if (analysisData.processed_complaints) {
      for (const complaint of analysisData.processed_complaints) {
        // Store grievance using server action
        const grievanceResult = await submitGrievanceWithAnalysisAction(
          complaint.raw_text,
          { source: 'csv_upload', filename: file.name }
        );

        if (grievanceResult.success && grievanceResult.grievanceId) {
          storedGrievances.push({ id: grievanceResult.grievanceId });

          // Store analysis using server action
          const analysisResult = await storeAnalysisResultAction(grievanceResult.grievanceId, {
            category: complaint.category,
            sentiment: complaint.sentiment,
            urgency: complaint.urgency,
            cleanText: complaint.clean_text,
          });

          if (analysisResult.success && analysisResult.analysisId) {
            storedAnalyses.push({ id: analysisResult.analysisId });
          }
        }
      }
    }

    // Store batch summary using server action
    const batchSummaryResult = await storeBatchSummaryAction({
      batchName: file.name,
      totalComplaints: analysisData.total_complaints,
      complaintVolumeByCategory: analysisData.complaint_volume_by_category,
      sentimentOverview: analysisData.sentiment_overview,
      urgencyDistribution: analysisData.urgency_distribution,
      weeklySummary: analysisData.weekly_summary,
      topRecurringIssues: analysisData.top_recurring_issues,
      grievanceIds: storedGrievances.map(g => g.id),
    });

    // Return the analysis data with database IDs
    const responseData = {
      ...analysisData,
      batch_id: batchSummaryResult.success ? batchSummaryResult.summaryId : null,
      stored_grievances: storedGrievances.length,
      processed_complaints: analysisData.processed_complaints?.map((complaint: any, index: number) => ({
        ...complaint,
        id: storedGrievances[index]?.id,
        analysis_id: storedAnalyses[index]?.id,
      })),
    };

    return NextResponse.json(responseData);

  } catch (error) {
    console.error('Error processing CSV upload:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
