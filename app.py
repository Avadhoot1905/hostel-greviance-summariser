"""
FastAPI application for AI Grievance Summarizer API
Provides REST endpoints for complaint analysis and summarization.
"""

from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional
import pandas as pd
import io
import uvicorn
from grievance_summarizer import GrievanceSummarizer

# Initialize FastAPI app
app = FastAPI(
    title="AI Grievance Summarizer API",
    description="AI-powered system for analyzing and summarizing hostel grievances",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize the summarizer
summarizer = GrievanceSummarizer()

# Pydantic models for request/response
class ComplaintInput(BaseModel):
    raw_text: str

class ComplaintsBatch(BaseModel):
    complaints: List[ComplaintInput]

class DashboardResponse(BaseModel):
    total_complaints: int
    complaint_volume_by_category: Dict[str, int]
    sentiment_overview: Dict[str, int]
    urgency_distribution: Dict[str, int]
    weekly_summary: str
    top_recurring_issues: List[str]
    processed_complaints: Optional[List[Dict]] = None

class HealthResponse(BaseModel):
    status: str
    message: str

@app.get("/", response_model=HealthResponse)
async def root():
    """Root endpoint - API health check."""
    return HealthResponse(
        status="healthy",
        message="AI Grievance Summarizer API is running"
    )

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint."""
    return HealthResponse(
        status="healthy",
        message="Service is operational"
    )

@app.post("/analyze/batch", response_model=DashboardResponse)
async def analyze_complaints_batch(batch: ComplaintsBatch):
    """
    Analyze a batch of complaints and return dashboard insights.
    
    Args:
        batch: ComplaintsBatch object containing list of complaints
        
    Returns:
        DashboardResponse with analysis results
    """
    try:
        # Convert to list of dictionaries
        complaints_data = [{"raw_text": complaint.raw_text} for complaint in batch.complaints]
        
        if not complaints_data:
            raise HTTPException(status_code=400, detail="No complaints provided")
        
        # Process complaints
        results = summarizer.process_complaints(data=complaints_data)
        
        if not results:
            raise HTTPException(status_code=500, detail="Failed to process complaints")
        
        return DashboardResponse(**results)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Processing error: {str(e)}")

@app.post("/analyze/csv", response_model=DashboardResponse)
async def analyze_complaints_csv(file: UploadFile = File(...)):
    """
    Analyze complaints from uploaded CSV file.
    
    Args:
        file: CSV file with complaints (must have 'raw_text' column)
        
    Returns:
        DashboardResponse with analysis results
    """
    try:
        # Validate file type
        if not file.filename.endswith('.csv'):
            raise HTTPException(status_code=400, detail="File must be a CSV")
        
        # Read CSV content
        content = await file.read()
        df = pd.read_csv(io.StringIO(content.decode('utf-8')))
        
        # Validate CSV structure
        if 'raw_text' not in df.columns and len(df.columns) > 0:
            # Assume first column contains complaints
            df.rename(columns={df.columns[0]: 'raw_text'}, inplace=True)
        
        if 'raw_text' not in df.columns:
            raise HTTPException(status_code=400, detail="CSV must contain 'raw_text' column")
        
        # Convert to list of dictionaries
        complaints_data = df[['raw_text']].to_dict('records')
        
        if not complaints_data:
            raise HTTPException(status_code=400, detail="No valid complaints found in CSV")
        
        # Process complaints
        results = summarizer.process_complaints(data=complaints_data)
        
        if not results:
            raise HTTPException(status_code=500, detail="Failed to process complaints")
        
        return DashboardResponse(**results)
        
    except pd.errors.EmptyDataError:
        raise HTTPException(status_code=400, detail="CSV file is empty")
    except pd.errors.ParserError:
        raise HTTPException(status_code=400, detail="Invalid CSV format")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Processing error: {str(e)}")

@app.post("/analyze/single")
async def analyze_single_complaint(complaint: ComplaintInput):
    """
    Analyze a single complaint.
    
    Args:
        complaint: Single complaint text
        
    Returns:
        Analysis results for the single complaint
    """
    try:
        # Process single complaint
        results = summarizer.process_complaints(data=[{"raw_text": complaint.raw_text}])
        
        if not results:
            raise HTTPException(status_code=500, detail="Failed to process complaint")
        
        # Return simplified response for single complaint
        return {
            "complaint": complaint.raw_text,
            "category": results['processed_complaints'][0]['category'],
            "sentiment": results['processed_complaints'][0]['sentiment'],
            "urgency": results['processed_complaints'][0]['urgency'],
            "clean_text": results['processed_complaints'][0]['clean_text']
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Processing error: {str(e)}")

@app.get("/categories")
async def get_categories():
    """Get available complaint categories."""
    return {"categories": summarizer.categories}

@app.get("/demo")
async def demo_analysis():
    """
    Demo endpoint with sample data for testing.
    
    Returns:
        DashboardResponse with analysis of sample complaints
    """
    try:
        from grievance_summarizer import create_sample_data
        
        sample_data = create_sample_data()
        results = summarizer.process_complaints(data=sample_data)
        
        if not results:
            raise HTTPException(status_code=500, detail="Failed to process demo data")
        
        return DashboardResponse(**results)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Demo processing error: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
