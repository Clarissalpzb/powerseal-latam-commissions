import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { formatCurrency } from '@/utils/currency';
import SubmissionsList from '../salesperson/components/SubmissionsList';
import UserManagement from './components/UserManagement';
import ManagerAnalytics from './components/ManagerAnalytics';

const ManagerDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'submissions' | 'users' | 'analytics'>('overview');

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">CommissionHub - Manager</h1>
              <p className="text-sm text-gray-500">Welcome, {user?.full_name}</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 bg-blue-100 px-3 py-1 rounded-full">
                Manager
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
              { id: 'submissions', name: 'Review Submissions' },
              { id: 'users', name: 'Manage Users' },
              { id: 'analytics', name: 'Analytics' },
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
        {activeTab === 'overview' && <ManagerOverview setActiveTab={setActiveTab} />}
        {activeTab === 'submissions' && <SubmissionsList showFilters={true} />}
        {activeTab === 'users' && <UserManagement />}
        {activeTab === 'analytics' && <ManagerAnalytics />}
      </main>
    </div>
  );
};

const ManagerOverview = ({ setActiveTab }: { setActiveTab: (tab: 'overview' | 'submissions' | 'users' | 'analytics') => void }) => {
  const { submissions } = useSelector((state: RootState) => state.submissions);
  
  // Calculate real statistics
  const stats = {
    pendingReview: submissions.filter(s => s.status === 'pending').length,
    flagged: submissions.filter(s => s.status === 'flagged').length,
    approvedToday: submissions.filter(s => {
      const today = new Date().toDateString();
      const reviewedAt = s.reviewed_at ? new Date(s.reviewed_at).toDateString() : null;
      return s.status === 'approved' && reviewedAt === today;
    }).length,
    totalPayouts: submissions
      .filter(s => s.status === 'paid')
      .reduce((sum, s) => sum + s.commission_amount, 0)
  };

  // Get recent submissions (last 3)
  const recentSubmissions = submissions
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 3);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium text-gray-900">Manager Dashboard</h2>
        <p className="text-sm text-gray-500">Manage commissions, users, and review submissions</p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-yellow-50 text-yellow-700 flex items-center justify-center">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Pending Review</dt>
                <dd className="text-lg font-medium text-gray-900">{stats.pendingReview}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-red-50 text-red-700 flex items-center justify-center">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Flagged</dt>
                <dd className="text-lg font-medium text-gray-900">{stats.flagged}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-green-50 text-green-700 flex items-center justify-center">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Approved Today</dt>
                <dd className="text-lg font-medium text-gray-900">{stats.approvedToday}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Total Payouts</dt>
                <dd className="text-lg font-medium text-gray-900">{formatCurrency(stats.totalPayouts)}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Submissions</h3>
          <div className="space-y-3">
            {recentSubmissions.length > 0 ? recentSubmissions.map((submission) => (
              <div key={submission.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {submission.document_type === 'factura' ? 
                      (submission.invoice_number || 'N/A') : 
                      (submission.purchase_order_number || 'N/A')
                    }
                  </p>
                  <p className="text-sm text-gray-500">
                    {submission.client_name} - {formatCurrency(submission.commission_amount)}
                  </p>
                </div>
                <span className={`status-${submission.status}`}>
                  {submission.status === 'paid' ? 'Pagado' :
                   submission.status === 'approved' ? 'Aprobado' :
                   submission.status === 'rejected' ? 'Rechazado' :
                   submission.status === 'under_review' ? 'En Revisión' :
                   submission.status === 'flagged' ? 'Señalado' :
                   'Pendiente'}
                </span>
              </div>
            )) : (
              <div className="text-center p-4 text-gray-500">
                <p>No hay solicitudes recientes</p>
              </div>
            )}
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button 
              onClick={() => setActiveTab('submissions')}
              className="w-full btn-primary flex items-center justify-between group"
            >
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                </svg>
                <span>Review Flagged Submissions</span>
              </div>
              <span className="text-sm bg-white/20 px-2 py-1 rounded">
                {stats.flagged} pending
              </span>
            </button>
            <button 
              onClick={() => setActiveTab('analytics')}
              className="w-full btn-secondary flex items-center group hover:bg-gray-100"
            >
              <svg className="w-5 h-5 mr-3 text-gray-400 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Generate Commission Report</span>
            </button>
            <button 
              onClick={() => alert('Export feature coming soon!')}
              className="w-full btn-secondary flex items-center group hover:bg-gray-100"
            >
              <svg className="w-5 h-5 mr-3 text-gray-400 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Export Payment Data</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;