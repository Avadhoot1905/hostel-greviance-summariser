import { NextResponse } from 'next/server';
import { getAnalyticsAction } from '@/app/actions/analytics-actions';

// This API route now just calls the server action for compatibility
// All database operations are handled via server actions
export async function GET() {
  const result = await getAnalyticsAction();
  
  if (!result.success) {
    return NextResponse.json(
      { 
        error: result.error,
        details: result.details,
        database_status: 'error'
      },
      { status: result.error?.includes('connection') ? 503 : 500 }
    );
  }

  return NextResponse.json(result.data);
}
