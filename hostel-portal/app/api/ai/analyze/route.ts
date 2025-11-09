import { NextRequest, NextResponse } from 'next/server';

// This API route is specifically for triggering AI analysis on existing grievances
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { grievance_id, raw_text } = body;

    if (!grievance_id || !raw_text) {
      return NextResponse.json({ 
        error: 'grievance_id and raw_text are required' 
      }, { status: 400 });
    }

    const backendUrl = process.env.PYTHON_BACKEND_URL || 'http://localhost:8000';
    
    // Call Python backend for analysis
    const analysisResponse = await fetch(`${backendUrl}/analyze/single`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ raw_text }),
    });

    if (!analysisResponse.ok) {
      return NextResponse.json({
        error: 'AI analysis service unavailable',
        details: `Backend returned status: ${analysisResponse.status}`,
        backend_url: backendUrl
      }, { status: 503 });
    }

    const analysisData = await analysisResponse.json();

    return NextResponse.json({
      grievance_id,
      analysis: analysisData,
      status: 'completed'
    });

  } catch (error) {
    console.error('Error processing AI analysis:', error);
    return NextResponse.json({
      error: 'AI analysis failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// GET endpoint to check AI service status
export async function GET() {
  try {
    const backendUrl = process.env.PYTHON_BACKEND_URL || 'http://localhost:8000';
    
    const healthResponse = await fetch(`${backendUrl}/health`, {
      method: 'GET',
    });

    const isHealthy = healthResponse.ok;

    return NextResponse.json({
      ai_service_status: isHealthy ? 'online' : 'offline',
      backend_url: backendUrl,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return NextResponse.json({
      ai_service_status: 'offline',
      backend_url: process.env.PYTHON_BACKEND_URL || 'http://localhost:8000',
      error: 'Service unreachable',
      timestamp: new Date().toISOString()
    });
  }
}
