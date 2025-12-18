import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { formatCurrency } from '@/utils/currency';

const ManagerAnalytics = () => {
  const { submissions, isLoading } = useSelector((state: RootState) => state.submissions);
  const { user } = useSelector((state: RootState) => state.auth);

  // Calculate comprehensive analytics from actual data
  const analytics = useMemo(() => {
    // All status counts
    const pendingSubmissions = submissions.filter(s => s.status === 'pending').length;
    const underReviewSubmissions = submissions.filter(s => s.status === 'under_review').length;
    const approvedSubmissions = submissions.filter(s => s.status === 'approved').length;
    const paidSubmissions = submissions.filter(s => s.status === 'paid').length;
    const rejectedSubmissions = submissions.filter(s => s.status === 'rejected').length;
    const flaggedSubmissions = submissions.filter(s => s.status === 'flagged').length;
    
    // Financial metrics
    const totalSalesValue = submissions.reduce((sum, s) => 
      sum + (s.client_requires_invoice ? s.amount_without_iva : s.amount_with_iva), 0);
    
    const totalCommissionsEarned = submissions.reduce((sum, s) => sum + s.commission_amount, 0);
    const totalCommissionsPaid = submissions
      .filter(s => s.status === 'paid')
      .reduce((sum, s) => sum + s.commission_amount, 0);
    
    const pendingCommissions = submissions
      .filter(s => ['pending', 'under_review', 'approved'].includes(s.status))
      .reduce((sum, s) => sum + s.commission_amount, 0);
    
    const rejectedCommissions = submissions
      .filter(s => s.status === 'rejected')
      .reduce((sum, s) => sum + s.commission_amount, 0);

    // Performance metrics
    const totalSubmissions = submissions.length;
    const processedSubmissions = submissions.filter(s => !['pending', 'under_review'].includes(s.status)).length;
    const approvalRate = processedSubmissions > 0 
      ? ((approvedSubmissions + paidSubmissions) / processedSubmissions) * 100 
      : 0;
      
    // Average metrics
    const avgCommissionRate = submissions.length > 0 
      ? submissions.reduce((sum, s) => sum + s.commission_rate, 0) / submissions.length * 100
      : 0;
      
    const avgPaymentDays = submissions.length > 0
      ? submissions.reduce((sum, s) => sum + s.payment_days, 0) / submissions.length
      : 0;
      
    const avgDealSize = submissions.length > 0
      ? totalSalesValue / submissions.length
      : 0;

    // Salesperson performance analysis
    const salespersonStats = submissions.reduce((acc, submission) => {
      const salespersonId = submission.salesperson_id;
      if (!acc[salespersonId]) {
        acc[salespersonId] = {
          id: salespersonId,
          name: salespersonId === 'user-1' ? 'Roberto Cosio' : 'Unknown User',
          totalCommissions: 0,
          paidCommissions: 0,
          pendingCommissions: 0,
          totalSubmissions: 0,
          approvedSubmissions: 0,
          rejectedSubmissions: 0,
          totalSales: 0,
          avgPaymentDays: 0
        };
      }
      
      const stat = acc[salespersonId];
      stat.totalCommissions += submission.commission_amount;
      stat.totalSubmissions += 1;
      stat.totalSales += (submission.client_requires_invoice ? submission.amount_without_iva : submission.amount_with_iva);
      
      if (submission.status === 'paid') {
        stat.paidCommissions += submission.commission_amount;
      } else if (['pending', 'under_review', 'approved'].includes(submission.status)) {
        stat.pendingCommissions += submission.commission_amount;
      }
      
      if (['approved', 'paid'].includes(submission.status)) {
        stat.approvedSubmissions += 1;
      } else if (submission.status === 'rejected') {
        stat.rejectedSubmissions += 1;
      }
      
      return acc;
    }, {} as Record<string, any>);

    // Calculate averages for each salesperson
    Object.values(salespersonStats).forEach((stat: any) => {
      const salespersonSubmissions = submissions.filter(s => s.salesperson_id === stat.id);
      stat.avgPaymentDays = salespersonSubmissions.length > 0
        ? salespersonSubmissions.reduce((sum, s) => sum + s.payment_days, 0) / salespersonSubmissions.length
        : 0;
      stat.approvalRate = (stat.approvedSubmissions + stat.rejectedSubmissions) > 0
        ? (stat.approvedSubmissions / (stat.approvedSubmissions + stat.rejectedSubmissions)) * 100
        : 0;
    });

    const topPerformers = Object.values(salespersonStats)
      .sort((a: any, b: any) => b.totalCommissions - a.totalCommissions)
      .slice(0, 5);

    // Monthly analysis (last 6 months)
    const monthlyData = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthSubmissions = submissions.filter(s => {
        const submissionDate = new Date(s.created_at);
        return submissionDate.getMonth() === monthDate.getMonth() && 
               submissionDate.getFullYear() === monthDate.getFullYear();
      });
      
      monthlyData.push({
        month: monthDate.toLocaleDateString('es-MX', { month: 'short', year: 'numeric' }),
        submissions: monthSubmissions.length,
        commissions: monthSubmissions.reduce((sum, s) => sum + s.commission_amount, 0),
        sales: monthSubmissions.reduce((sum, s) => sum + (s.client_requires_invoice ? s.amount_without_iva : s.amount_with_iva), 0),
        paid: monthSubmissions.filter(s => s.status === 'paid').reduce((sum, s) => sum + s.commission_amount, 0),
        pending: monthSubmissions.filter(s => ['pending', 'under_review', 'approved'].includes(s.status)).reduce((sum, s) => sum + s.commission_amount, 0)
      });
    }
    
    // Recent activity
    const recentSubmissions = submissions
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 10);

    return {
      // Counts
      totalSubmissions,
      pendingSubmissions,
      underReviewSubmissions,
      approvedSubmissions,
      paidSubmissions,
      rejectedSubmissions,
      flaggedSubmissions,
      processedSubmissions,
      
      // Financial
      totalSalesValue,
      totalCommissionsEarned,
      totalCommissionsPaid,
      pendingCommissions,
      rejectedCommissions,
      
      // Performance
      approvalRate,
      avgCommissionRate,
      avgPaymentDays,
      avgDealSize,
      
      // Data
      topPerformers,
      salespersonStats,
      monthlyData,
      recentSubmissions
    };
  }, [submissions, user]);

  // Handle report generation
  const handleGenerateReport = (reportType: string) => {
    // TODO: Implement actual report generation
    console.log(`Generating ${reportType} report...`);
    alert(`${reportType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} report will be generated.\n\nThis feature is coming soon!`);
  };

  // Show loading state if data is still loading
  if (isLoading && submissions.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium text-gray-900">Analytics Dashboard</h2>
        <p className="text-sm text-gray-500">Commission performance and insights</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-green-50 text-green-700 flex items-center justify-center">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Total Paid</dt>
                <dd className="text-lg font-medium text-gray-900">
                  {formatCurrency(analytics.totalCommissionsPaid)}
                </dd>
              </dl>
            </div>
          </div>
        </div>

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
                <dt className="text-sm font-medium text-gray-500 truncate">Pending Payouts</dt>
                <dd className="text-lg font-medium text-gray-900">
                  {formatCurrency(analytics.pendingCommissions)}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm1 3a1 1 0 000 2h12a1 1 0 100-2H4z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Avg Commission Rate</dt>
                <dd className="text-lg font-medium text-gray-900">
                  {analytics.avgCommissionRate.toFixed(2)}%
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-700 flex items-center justify-center">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Approval Rate</dt>
                <dd className="text-lg font-medium text-gray-900">
                  {analytics.approvalRate.toFixed(2)}%
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performers */}
        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Top Performers</h3>
          <div className="space-y-4">
            {analytics.topPerformers && analytics.topPerformers.length > 0 ? (
              analytics.topPerformers.map((performer: any, index) => (
              <div key={performer.id} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    index === 0 ? 'bg-yellow-100 text-yellow-800' :
                    index === 1 ? 'bg-gray-100 text-gray-800' :
                    'bg-amber-100 text-amber-800'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">{performer.name}</p>
                    <p className="text-sm text-gray-500">{performer.totalSubmissions} submissions</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {formatCurrency(performer.totalCommissions)}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center p-4 text-gray-500">
              <p>No performance data available yet</p>
            </div>
          )}
          </div>
        </div>

        {/* Monthly Trends */}
        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Commission Trends</h3>
          <div className="space-y-3">
            {analytics.monthlyData && analytics.monthlyData.length > 0 ? (
              analytics.monthlyData.map((month) => {
              const maxAmount = Math.max(...(analytics.monthlyData || []).map(m => m.commissions));
              const progressPercentage = maxAmount > 0 ? (month.commissions / maxAmount) * 100 : 0;
              
              return (
                <div key={month.month} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {month.month}
                  </span>
                  <div className="flex items-center">
                    <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                      <div 
                        className="bg-primary-600 h-2 rounded-full" 
                        style={{ width: `${progressPercentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {formatCurrency(month.commissions)}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center p-4 text-gray-500">
              <p>No monthly data available yet</p>
            </div>
          )}
          </div>
        </div>
      </div>

      {/* Reports Section */}
      <div className="card p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Generate Reports</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button 
            onClick={() => handleGenerateReport('commission-summary')}
            className="btn-primary flex items-center justify-center group transition-all duration-200 hover:shadow-lg"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Commission Summary</span>
          </button>
          <button 
            onClick={() => handleGenerateReport('salesperson-performance')}
            className="btn-secondary flex items-center justify-center group hover:bg-gray-100 transition-all duration-200"
          >
            <svg className="w-5 h-5 mr-2 text-gray-500 group-hover:text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span>Performance Report</span>
          </button>
          <button 
            onClick={() => handleGenerateReport('payment-history')}
            className="btn-secondary flex items-center justify-center group hover:bg-gray-100 transition-all duration-200"
          >
            <svg className="w-5 h-5 mr-2 text-gray-500 group-hover:text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Payment Export</span>
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="card p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Statistics</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{analytics.totalSubmissions}</p>
            <p className="text-sm text-gray-500">Total Submissions</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              {analytics.approvedSubmissions}
            </p>
            <p className="text-sm text-gray-500">Approved</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">
              {analytics.rejectedSubmissions}
            </p>
            <p className="text-sm text-gray-500">Rejected</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-600">
              {analytics.pendingSubmissions}
            </p>
            <p className="text-sm text-gray-500">Pending Review</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerAnalytics;