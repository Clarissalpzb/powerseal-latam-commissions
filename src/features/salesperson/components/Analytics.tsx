import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { formatCurrency } from '@/utils/currency';
import { useMemo } from 'react';

const Analytics = () => {
  const { submissions } = useSelector((state: RootState) => state.submissions);
  const { user } = useSelector((state: RootState) => state.auth);
  
  // Filter submissions to only show current user's submissions for salesperson
  const userSubmissions = submissions.filter(s => s.salesperson_id === user?.id);
  
  // Calculate comprehensive analytics
  const analytics = useMemo(() => {
    const totalAmount = userSubmissions.reduce((sum, s) => sum + (s.client_requires_invoice ? s.amount_without_iva : s.amount_with_iva), 0);
    const totalCommissions = userSubmissions.reduce((sum, s) => sum + s.commission_amount, 0);
    const paidCommissions = userSubmissions.filter(s => s.status === 'paid').reduce((sum, s) => sum + s.commission_amount, 0);
    const pendingCommissions = userSubmissions.filter(s => ['pending', 'under_review', 'approved'].includes(s.status)).reduce((sum, s) => sum + s.commission_amount, 0);
    const rejectedCommissions = userSubmissions.filter(s => s.status === 'rejected').reduce((sum, s) => sum + s.commission_amount, 0);
    
    // Average commission percentage
    const avgCommissionRate = userSubmissions.length > 0 ? 
      userSubmissions.reduce((sum, s) => sum + s.commission_rate, 0) / userSubmissions.length * 100 : 0;
      
    // Average days to payment
    const avgPaymentDays = userSubmissions.length > 0 ?
      userSubmissions.reduce((sum, s) => sum + s.payment_days, 0) / userSubmissions.length : 0;
      
    // Performance metrics
    const approvalRate = userSubmissions.length > 0 ?
      (userSubmissions.filter(s => ['approved', 'paid'].includes(s.status)).length / userSubmissions.length) * 100 : 0;
      
    // Monthly breakdown (last 6 months)
    const now = new Date();
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthSubmissions = userSubmissions.filter(s => {
        const submissionDate = new Date(s.created_at);
        return submissionDate.getMonth() === monthDate.getMonth() && 
               submissionDate.getFullYear() === monthDate.getFullYear();
      });
      
      monthlyData.push({
        month: monthDate.toLocaleDateString('es-MX', { month: 'short', year: 'numeric' }),
        submissions: monthSubmissions.length,
        commissions: monthSubmissions.reduce((sum, s) => sum + s.commission_amount, 0),
        sales: monthSubmissions.reduce((sum, s) => sum + (s.client_requires_invoice ? s.amount_without_iva : s.amount_with_iva), 0)
      });
    }
    
    return {
      totalSubmissions: userSubmissions.length,
      pendingSubmissions: userSubmissions.filter(s => ['pending', 'under_review'].includes(s.status)).length,
      approvedSubmissions: userSubmissions.filter(s => ['approved', 'paid'].includes(s.status)).length,
      rejectedSubmissions: userSubmissions.filter(s => s.status === 'rejected').length,
      totalAmount,
      totalCommissions,
      paidCommissions,
      pendingCommissions,
      rejectedCommissions,
      avgCommissionRate,
      avgPaymentDays,
      approvalRate,
      monthlyData
    };
  }, [userSubmissions]);

  // Get recent submissions for activity feed (only user's submissions)
  const recentSubmissions = userSubmissions
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  const StatCard = ({ title, value, subvalue, color, icon }: {
    title: string;
    value: string | number;
    subvalue?: string;
    color: 'blue' | 'green' | 'yellow' | 'purple';
    icon: 'chart' | 'money' | 'clock' | 'check';
  }) => {
    const colorClasses = {
      blue: 'bg-blue-50 text-blue-600',
      green: 'bg-green-50 text-green-600',
      yellow: 'bg-yellow-50 text-yellow-600',
      purple: 'bg-purple-50 text-purple-600',
    };
    
    const borderClasses = {
      blue: 'border-blue-200',
      green: 'border-green-200',
      yellow: 'border-yellow-200',
      purple: 'border-purple-200',
    };
    
    const icons = {
      chart: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      ),
      money: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
      ),
      clock: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      ),
      check: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      ),
    };

    return (
      <div className={`bg-white rounded-lg p-6 border-l-4 ${borderClasses[color]} shadow-sm`}>
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className={`w-10 h-10 rounded-lg ${colorClasses[color]} flex items-center justify-center`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {icons[icon]}
              </svg>
            </div>
          </div>
          <div className="ml-4 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd>
                <div className="text-xl font-semibold text-gray-900">{value}</div>
                {subvalue && <div className="text-sm text-gray-500">{subvalue}</div>}
              </dd>
            </dl>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Análisis de Rendimiento</h2>
        <p className="text-sm text-gray-500">Tu rendimiento de comisiones y estadísticas detalladas</p>
      </div>

      {/* Main KPI Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Ventas"
          value={formatCurrency(analytics.totalAmount)}
          subvalue={`${analytics.totalSubmissions} solicitudes`}
          color="blue"
          icon="chart"
        />
        <StatCard
          title="Comisiones Ganadas"
          value={formatCurrency(analytics.totalCommissions)}
          subvalue={`${analytics.avgCommissionRate.toFixed(1)}% promedio`}
          color="green"
          icon="money"
        />
        <StatCard
          title="Pendientes"
          value={formatCurrency(analytics.pendingCommissions)}
          subvalue={`${analytics.pendingSubmissions} en proceso`}
          color="yellow"
          icon="clock"
        />
        <StatCard
          title="Tasa de Aprobación"
          value={`${analytics.approvalRate.toFixed(1)}%`}
          subvalue={`${analytics.avgPaymentDays.toFixed(0)} días promedio`}
          color="purple"
          icon="check"
        />
      </div>

      {/* Commission Breakdown */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="card p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Tendencia Mensual</h3>
            <div className="space-y-4">
              {analytics.monthlyData.map((month, idx) => {
                const maxCommissions = Math.max(...analytics.monthlyData.map(m => m.commissions));
                const percentage = maxCommissions > 0 ? (month.commissions / maxCommissions) * 100 : 0;
                
                return (
                  <div key={idx} className="flex items-center space-x-4">
                    <div className="w-16 text-sm text-gray-500 font-medium">{month.month}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-600">{month.submissions} solicitudes</span>
                        <span className="text-sm font-medium text-gray-900">{formatCurrency(month.commissions)}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-primary-600 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        
        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Desglose de Comisiones</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Pagadas</span>
              </div>
              <span className="text-sm font-medium text-green-600">
                {formatCurrency(analytics.paidCommissions)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Pendientes</span>
              </div>
              <span className="text-sm font-medium text-yellow-600">
                {formatCurrency(analytics.pendingCommissions)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Rechazadas</span>
              </div>
              <span className="text-sm font-medium text-red-600">
                {formatCurrency(analytics.rejectedCommissions)}
              </span>
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-900">Total</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatCurrency(analytics.totalCommissions)}
                </span>
              </div>
            </div>
            
            {/* Visual breakdown */}
            <div className="mt-4">
              <div className="flex rounded-lg overflow-hidden h-3">
                {analytics.totalCommissions > 0 && (
                  <>
                    {analytics.paidCommissions > 0 && (
                      <div 
                        className="bg-green-500" 
                        style={{ width: `${(analytics.paidCommissions / analytics.totalCommissions) * 100}%` }}
                      />
                    )}
                    {analytics.pendingCommissions > 0 && (
                      <div 
                        className="bg-yellow-500" 
                        style={{ width: `${(analytics.pendingCommissions / analytics.totalCommissions) * 100}%` }}
                      />
                    )}
                    {analytics.rejectedCommissions > 0 && (
                      <div 
                        className="bg-red-500" 
                        style={{ width: `${(analytics.rejectedCommissions / analytics.totalCommissions) * 100}%` }}
                      />
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      
      {/* Performance Insights & Recent Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Performance Insights */}
        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Insights de Rendimiento</h3>
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-blue-900">
                    {analytics.approvalRate >= 80 ? '¡Excelente trabajo!' : 
                     analytics.approvalRate >= 60 ? 'Buen rendimiento' : 
                     'Oportunidad de mejora'}
                  </p>
                  <p className="text-xs text-blue-700 mt-1">
                    {analytics.approvalRate >= 80 ? 
                      'Tu tasa de aprobación está por encima del 80%. Sigue así.' :
                     analytics.approvalRate >= 60 ?
                      'Tu tasa de aprobación es sólida. Busca optimizar los tiempos de pago.' :
                      'Revisa la documentación y tiempos de pago para mejorar la tasa de aprobación.'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-900">
                    Estrategia de Pagos
                  </p>
                  <p className="text-xs text-green-700 mt-1">
                    {analytics.avgPaymentDays <= 30 ? 
                      'Tus clientes pagan rápido. Excelente gestión de cobranza.' :
                     analytics.avgPaymentDays <= 60 ?
                      'Tiempos de pago moderados. Considera incentivos por pago anticipado.' :
                      'Los pagos tardíos afectan tus comisiones. Considera políticas de crédito más estrictas.'}
                  </p>
                </div>
              </div>
            </div>
            
            {analytics.rejectedCommissions > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="w-5 h-5 text-red-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-red-900">
                      Comisiones Rechazadas
                    </p>
                    <p className="text-xs text-red-700 mt-1">
                      Tienes {formatCurrency(analytics.rejectedCommissions)} en comisiones rechazadas. 
                      Revisa los comentarios del manager para mejorar futuras solicitudes.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Actividad Reciente</h3>
          <div className="flow-root">
            <ul className="-mb-8">
              {recentSubmissions.map((submission, idx) => (
                <li key={submission.id}>
                  <div className="relative pb-8">
                    {idx !== recentSubmissions.length - 1 && (
                      <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" />
                    )}
                    <div className="relative flex space-x-3">
                      <div>
                        <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                          submission.status === 'paid' ? 'bg-green-500' :
                          submission.status === 'approved' ? 'bg-blue-500' :
                          submission.status === 'rejected' ? 'bg-red-500' :
                          'bg-yellow-500'
                        }`}>
                          <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {submission.status === 'paid' ? (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            ) : submission.status === 'approved' ? (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            ) : submission.status === 'rejected' ? (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            ) : (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            )}
                          </svg>
                        </span>
                      </div>
                      <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {submission.client_name}
                          </p>
                          <p className="text-xs text-gray-500">
                            OP: {submission.purchase_order_number || 'Sin OP'} • {formatCurrency(submission.commission_amount)}
                            {submission.commission_percentage !== undefined && submission.commission_percentage < 1 && (
                              <span className="ml-1 text-yellow-600">
                                ({Math.round(submission.commission_percentage * 100)}%)
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(submission.created_at).toLocaleDateString('es-MX', { 
                              month: 'short', 
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        <div className="text-right text-sm whitespace-nowrap">
                          <span className={`status-${submission.status}`}>
                            {submission.status === 'paid' ? 'Pagado' :
                             submission.status === 'approved' ? 'Aprobado' :
                             submission.status === 'rejected' ? 'Rechazado' :
                             submission.status === 'under_review' ? 'En Revisión' :
                             submission.status === 'flagged' ? 'Señalado' :
                             'Pendiente'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          {recentSubmissions.length === 0 && (
            <div className="text-center py-6">
              <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-sm text-gray-500">No hay solicitudes aún</p>
              <p className="text-xs text-gray-400 mt-1">Envía tu primera solicitud de comisión</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;