# Hostel Portal - Frontend

This is the frontend Next.js application for the Hostel Grievance Management System.

## Features

- **Home Page**: Overview of the system with navigation
- **Submit Grievance**: User-friendly form for submitting complaints
- **Admin Dashboard**: Comprehensive analytics and complaint management
- **About Page**: Information about the system and how it works

## Getting Started

### Prerequisites

- Node.js 18+ installed
- The backend API server running on `http://localhost:8000`

### Installation

1. Navigate to the hostel-portal directory:
```bash
cd hostel-portal
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Pages

### `/` - Home Page
- Landing page with system overview
- Navigation to all other pages
- Feature highlights and capabilities

### `/submit` - Submit Grievance
- Form for users to submit complaints
- Real-time AI analysis and feedback
- Submission confirmation with categorization results

### `/admin` - Admin Dashboard
- Upload CSV files for batch processing
- View analytics and statistics
- Load demo data for testing
- Comprehensive complaint management

### `/about` - About Page
- System information and documentation
- Technology stack details
- How-to guides for users and administrators

## API Integration

The frontend connects to the FastAPI backend running on `http://localhost:8000`. Make sure the backend is running before using the frontend.

### Available Endpoints Used:
- `POST /analyze/single` - Single complaint analysis
- `POST /analyze/csv` - CSV file upload and batch processing
- `GET /demo` - Load demo data for testing

## Technology Stack

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Lucide React** - Icons

## Development

To run in development mode:
```bash
npm run dev
```

To build for production:
```bash
npm run build
npm start
```

## Notes

- Make sure the backend API is running on port 8000
- The system is configured for development with CORS enabled
- All API calls assume the backend is available at `http://localhost:8000`
