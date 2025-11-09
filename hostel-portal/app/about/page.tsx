import Image from "next/image";
import Link from "next/link";

export default function About() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <Image
                src="/next.svg"
                alt="Logo"
                width={80}
                height={16}
                className="dark:invert"
              />
              <span className="text-xl font-bold text-gray-900">Hostel Portal</span>
            </Link>
            <nav className="flex space-x-6">
              <Link href="/" className="text-gray-600 hover:text-gray-900">
                Home
              </Link>
              <Link href="/submit" className="text-gray-600 hover:text-gray-900">
                Submit Grievance
              </Link>
              <Link href="/admin" className="text-gray-600 hover:text-gray-900">
                Admin Dashboard
              </Link>
              <Link href="/about" className="text-blue-600 font-medium">
                About
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">About the System</h1>
          
          <div className="prose prose-lg max-w-none">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">What is the Hostel Grievance Management System?</h2>
            <p className="text-gray-600 mb-6">
              Our AI-powered Hostel Grievance Management System is designed to streamline the process of reporting, 
              analyzing, and addressing hostel-related complaints. By leveraging advanced natural language processing 
              and machine learning techniques, we can automatically categorize complaints, analyze sentiment, and 
              determine urgency levels to ensure faster resolution times.
            </p>

            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Key Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">🤖 AI-Powered Analysis</h3>
                <p className="text-blue-700">
                  Automatic categorization of complaints into relevant categories like maintenance, food, security, etc.
                </p>
              </div>
              
              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-green-800 mb-2">📊 Sentiment Analysis</h3>
                <p className="text-green-700">
                  Real-time sentiment analysis to understand the emotional tone of each complaint.
                </p>
              </div>
              
              <div className="bg-purple-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-purple-800 mb-2">⚡ Priority Detection</h3>
                <p className="text-purple-700">
                  Automatic urgency level detection to prioritize critical issues that need immediate attention.
                </p>
              </div>
              
              <div className="bg-yellow-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">📈 Analytics Dashboard</h3>
                <p className="text-yellow-700">
                  Comprehensive analytics and reporting for administrators to track trends and patterns.
                </p>
              </div>
            </div>

            <h2 className="text-2xl font-semibold text-gray-800 mb-4">How It Works</h2>
            <div className="space-y-4 mb-8">
              <div className="flex items-start space-x-4">
                <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">1</div>
                <div>
                  <h4 className="font-semibold text-gray-800">Submit Your Complaint</h4>
                  <p className="text-gray-600">Students can easily submit their grievances through the user-friendly form.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">2</div>
                <div>
                  <h4 className="font-semibold text-gray-800">AI Processing</h4>
                  <p className="text-gray-600">Our AI system automatically analyzes the complaint text and extracts key information.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">3</div>
                <div>
                  <h4 className="font-semibold text-gray-800">Categorization & Routing</h4>
                  <p className="text-gray-600">Complaints are automatically categorized and routed to the appropriate department.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">4</div>
                <div>
                  <h4 className="font-semibold text-gray-800">Resolution & Follow-up</h4>
                  <p className="text-gray-600">Administrators can track progress and ensure timely resolution of all issues.</p>
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Technology Stack</h2>
            <div className="bg-gray-50 p-6 rounded-lg mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Frontend</h4>
                  <ul className="text-gray-600 space-y-1">
                    <li>• Next.js 14 with React</li>
                    <li>• TypeScript for type safety</li>
                    <li>• Tailwind CSS for styling</li>
                    <li>• Lucide React for icons</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Backend</h4>
                  <ul className="text-gray-600 space-y-1">
                    <li>• FastAPI Python framework</li>
                    <li>• Transformers for NLP processing</li>
                    <li>• Pandas for data analysis</li>
                    <li>• Uvicorn ASGI server</li>
                  </ul>
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Getting Started</h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h4 className="font-semibold text-blue-800 mb-2">For Students:</h4>
              <p className="text-blue-700 mb-4">
                Simply visit the <Link href="/submit" className="underline">Submit Grievance</Link> page and describe your concern. 
                The system will automatically process your complaint and provide you with a confirmation and tracking information.
              </p>
              
              <h4 className="font-semibold text-blue-800 mb-2">For Administrators:</h4>
              <p className="text-blue-700">
                Access the <Link href="/admin" className="underline">Admin Dashboard</Link> to view analytics, 
                upload CSV files for batch processing, and monitor complaint resolution progress.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
