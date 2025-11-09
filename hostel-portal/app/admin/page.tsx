'use client'

import { useState, useEffect } from 'react'
import { FileUp, TrendingUp, AlertTriangle, BarChart3, Users, MessageSquare } from 'lucide-react'

interface DashboardData {
  total_complaints: number
  complaint_volume_by_category: Record<string, number>
  sentiment_overview: Record<string, number>
  urgency_distribution: Record<string, number>
  weekly_summary: string
  top_recurring_issues: string[]
  processed_complaints?: Array<{
    id?: number
    raw_text: string
    clean_text: string
    category: string
    sentiment: string
    urgency: string
  }>
}

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)

  const loadDemoData = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/analytics')
      if (!response.ok) throw new Error('Failed to load analytics data')
      const data = await response.json()
      setDashboardData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith('.csv')) {
      setError('Please upload a CSV file')
      return
    }

    setUploadedFile(file)
    setLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/grievances/csv', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) throw new Error('Failed to analyze CSV file')
      const data = await response.json()
      setDashboardData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setLoading(false)
    }
  }

  const StatCard = ({ title, value, icon: Icon, color }: {
    title: string
    value: string | number
    icon: any
    color: string
  }) => (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4" style={{ borderLeftColor: color }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <Icon className="h-8 w-8" style={{ color }} />
      </div>
    </div>
  )

  const CategoryChart = ({ data }: { data: Record<string, number> }) => {
    const maxValue = Math.max(...Object.values(data))
    return (
      <div className="space-y-3">
        {Object.entries(data).map(([category, count]) => (
          <div key={category} className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 capitalize">{category}</span>
            <div className="flex items-center space-x-2">
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${(count / maxValue) * 100}%` }}
                />
              </div>
              <span className="text-sm text-gray-600 w-8">{count}</span>
            </div>
          </div>
        ))}
      </div>
    )
  }

  useEffect(() => {
    loadDemoData()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Hostel Grievance Analysis & Summary</p>
        </div>

        {/* File Upload Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload Grievances CSV</h2>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
            <div className="text-center">
              <FileUp className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4">
                <label htmlFor="file-upload" className="cursor-pointer">
                  <span className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                    Choose CSV File
                  </span>
                  <input
                    id="file-upload"
                    type="file"
                    accept=".csv"
                    className="sr-only"
                    onChange={handleFileUpload}
                  />
                </label>
                <button
                  onClick={loadDemoData}
                  className="ml-3 inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Load Demo Data
                </button>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Upload a CSV file with grievances or use demo data
              </p>
              {uploadedFile && (
                <p className="mt-2 text-sm text-green-600">
                  Uploaded: {uploadedFile.name}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Analyzing grievances...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="mt-1 text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard Content */}
        {dashboardData && !loading && (
          <div className="space-y-8">
            {/* Key Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Complaints"
                value={dashboardData.total_complaints}
                icon={MessageSquare}
                color="#3B82F6"
              />
              <StatCard
                title="Categories"
                value={Object.keys(dashboardData.complaint_volume_by_category).length}
                icon={BarChart3}
                color="#10B981"
              />
              <StatCard
                title="High Urgency"
                value={dashboardData.urgency_distribution?.high || 0}
                icon={AlertTriangle}
                color="#EF4444"
              />
              <StatCard
                title="Negative Sentiment"
                value={dashboardData.sentiment_overview?.negative || 0}
                icon={TrendingUp}
                color="#F59E0B"
              />
            </div>

            {/* Charts and Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Category Distribution */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Complaints by Category</h3>
                <CategoryChart data={dashboardData.complaint_volume_by_category} />
              </div>

              {/* Sentiment Analysis */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Sentiment Distribution</h3>
                <CategoryChart data={dashboardData.sentiment_overview} />
              </div>

              {/* Urgency Distribution */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Urgency Levels</h3>
                <CategoryChart data={dashboardData.urgency_distribution} />
              </div>

              {/* Top Issues */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Recurring Issues</h3>
                <div className="space-y-2">
                  {dashboardData.top_recurring_issues.map((issue, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                        #{index + 1}
                      </span>
                      <span className="text-sm text-gray-700">{issue}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Weekly Summary */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Summary</h3>
              <p className="text-gray-700 leading-relaxed">{dashboardData.weekly_summary}</p>
            </div>

            {/* Detailed Complaints Table */}
            {dashboardData.processed_complaints && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Processed Complaints</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Original Text
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Sentiment
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Urgency
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {dashboardData.processed_complaints.slice(0, 10).map((complaint, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                            {complaint.raw_text}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                              {complaint.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                              complaint.sentiment === 'positive' ? 'bg-green-100 text-green-800' :
                              complaint.sentiment === 'negative' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {complaint.sentiment}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                              complaint.urgency === 'high' ? 'bg-red-100 text-red-800' :
                              complaint.urgency === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {complaint.urgency}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {dashboardData.processed_complaints.length > 10 && (
                    <p className="mt-4 text-sm text-gray-500 text-center">
                      Showing first 10 of {dashboardData.processed_complaints.length} complaints
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
