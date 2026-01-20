import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import SubmissionForm from './components/SubmissionForm';
import SubmissionsList from './components/SubmissionsList';
import Analytics from './components/Analytics';

const SalespersonDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'submit' | 'history'>('overview');

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white p-6 rounded-lg shadow">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100">
              <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="mt-2 text-lg font-medium text-gray-900">Not Logged In</h3>
            <p className="mt-1 text-sm text-gray-500">
              Please log in to access the dashboard.
            </p>
            <button
              onClick={logout}
              className="mt-4 btn-secondary"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-xl font-medium text-gray-800">CommissionHub</h1>
              <p className="text-sm text-gray-500">Welcome, {user.full_name}</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Commission Rate: {((user.commission_rate || 0) * 100).toFixed(1)}%
              </span>
              <button
                onClick={logout}
                className="btn-secondary text-sm"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: 'overview', name: 'Overview' },
              { id: 'submit', name: 'Submit Commission' },
              { id: 'history', name: 'My Submissions' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && <Analytics />}
        {activeTab === 'submit' && <SubmissionForm />}
        {activeTab === 'history' && <SubmissionsList showFilters={false} />}
      </main>
    </div>
  );
};

export default SalespersonDashboard;