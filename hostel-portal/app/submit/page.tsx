'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { submitGrievanceAction } from '@/app/actions/grievance-actions';

export default function SubmitPage() {
  const [grievanceText, setGrievanceText] = useState('');
  const [userInfo, setUserInfo] = useState({
    name: '',
    roomNumber: '',
    email: '',
  });
  const [isPending, startTransition] = useTransition();
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!grievanceText.trim()) {
      setErrorMessage('Please enter your grievance');
      setSubmitStatus('error');
      return;
    }

    setSubmitStatus('idle');
    setErrorMessage('');

    // Use server action with transition
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append('raw_text', grievanceText);
        formData.append('name', userInfo.name);
        formData.append('roomNumber', userInfo.roomNumber);
        formData.append('email', userInfo.email);

        const result = await submitGrievanceAction(formData);

        if (result.success) {
          setSubmitStatus('success');
          setGrievanceText('');
          setUserInfo({ name: '', roomNumber: '', email: '' });
          
          // Redirect to home page after 2 seconds
          setTimeout(() => {
            router.push('/');
          }, 2000);
        } else {
          setErrorMessage(result.error || 'Failed to submit grievance');
          setSubmitStatus('error');
        }
      } catch (error) {
        console.error('Error submitting grievance:', error);
        setErrorMessage('An unexpected error occurred');
        setSubmitStatus('error');
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Submit a Grievance</h1>
            <p className="mt-2 text-gray-600">
              Share your concerns and we'll analyze and address them appropriately
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* User Information (Optional) */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Your Information (Optional)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={userInfo.name}
                    onChange={(e) => setUserInfo({ ...userInfo, name: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label htmlFor="roomNumber" className="block text-sm font-medium text-gray-700">
                    Room Number
                  </label>
                  <input
                    type="text"
                    id="roomNumber"
                    value={userInfo.roomNumber}
                    onChange={(e) => setUserInfo({ ...userInfo, roomNumber: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., A-101"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={userInfo.email}
                  onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="your.email@example.com"
                />
              </div>
            </div>

            {/* Grievance Text */}
            <div>
              <label htmlFor="grievance" className="block text-sm font-medium text-gray-700 mb-2">
                Your Grievance *
              </label>
              <textarea
                id="grievance"
                required
                value={grievanceText}
                onChange={(e) => setGrievanceText(e.target.value)}
                rows={8}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
                placeholder="Please describe your issue, concern, or complaint in detail..."
              />
              <p className="mt-1 text-sm text-gray-500">
                Be as specific as possible to help us understand and address your concern.
              </p>
            </div>

            {/* Status Messages */}
            {submitStatus === 'success' && (
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-800">
                      Grievance submitted successfully! Redirecting you to the home page...
                    </p>
                  </div>
                </div>
              </div>
            )}

            {submitStatus === 'error' && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-red-800">
                      {errorMessage || 'There was an error submitting your grievance. Please try again.'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isPending || !grievanceText.trim()}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-200"
            >
              {isPending ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </>
              ) : (
                'Submit Grievance'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => router.push('/')}
              className="text-blue-600 hover:text-blue-500 text-sm font-medium"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}