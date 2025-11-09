import { NextRequest, NextResponse } from 'next/server';
import { submitGrievanceWithAnalysisAction, storeAnalysisResultAction } from '@/app/actions/grievance-actions';

// This API route handles Python script analysis requests only
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { raw_text, user_info } = body;

    if (!raw_text) {
      return NextResponse.json({ error: 'raw_text is required' }, { status: 400 });
    }

    // Store the grievance using server action
    const grievanceResult = await submitGrievanceWithAnalysisAction(raw_text, user_info);
    
    if (!grievanceResult.success) {
      return NextResponse.json({ 
        error: grievanceResult.error,
        details: grievanceResult.details 
      }, { status: 503 });
    }

    // Call the Python backend for AI analysis
    let analysisData = null;
    const backendUrl = process.env.PYTHON_BACKEND_URL || 'http://localhost:8000';
    
    try {
      const analysisResponse = await fetch(`${backendUrl}/analyze/single`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ raw_text }),
      });

      if (analysisResponse.ok) {
        analysisData = await analysisResponse.json();
        console.log('[SUCCESS] AI analysis completed successfully');

        // Store the analysis result using server action
        if (analysisData && grievanceResult.grievanceId) {
          await storeAnalysisResultAction(grievanceResult.grievanceId, {
            category: analysisData.category,
            sentiment: analysisData.sentiment,
            urgency: analysisData.urgency,
            cleanText: analysisData.clean_text,
            confidence: analysisData.confidence || null,
          });
        }
      } else {
        console.warn('[WARNING] AI analysis service returned error status:', analysisResponse.status);
      }
    } catch (analysisError) {
      console.warn('[WARNING] AI analysis service unavailable:', analysisError instanceof Error ? analysisError.message : 'Unknown error');
      // Continue without analysis - grievance is already stored
    }

    return NextResponse.json({
      id: grievanceResult.grievanceId,
      complaint: raw_text,
      category: analysisData?.category || 'uncategorized',
      sentiment: analysisData?.sentiment || 'neutral',
      urgency: analysisData?.urgency || 'low',
      clean_text: analysisData?.clean_text || raw_text,
      analysis_available: !!analysisData,
      message: analysisData ? 'Grievance submitted and analyzed successfully' : 'Grievance submitted successfully (analysis unavailable)',
    });

  } catch (error) {
    console.error('Error processing grievance:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
