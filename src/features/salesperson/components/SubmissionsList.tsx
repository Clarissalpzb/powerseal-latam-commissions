import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { deleteSubmission } from '@/store/slices/submissionsSlice';
import { CommissionSubmission } from '@/types';
import { formatCurrency } from '@/utils/currency';
import EditSubmissionModal from './EditSubmissionModal';
import ReviewSubmission from '../../manager/components/ReviewSubmission';
import MarkAsPaidModal from '../../manager/components/MarkAsPaidModal';
import PDFViewer from '@/components/PDFViewer';
import PaymentReceiptViewer from '@/components/PaymentReceiptViewer';

interface SubmissionsListProps {
  showFilters?: boolean;
  submissions?: CommissionSubmission[];
}

const SubmissionsList = ({ showFilters = true, submissions }: SubmissionsListProps) => {
  const dispatch = useDispatch();
  const { submissions: storeSubmissions } = useSelector((state: RootState) => state.submissions);
  const { user } = useSelector((state: RootState) => state.auth);
  const [filteredSubmissions, setFilteredSubmissions] = useState<CommissionSubmission[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [salespersonFilter, setSalespersonFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [editingSubmission, setEditingSubmission] = useState<CommissionSubmission | null>(null);
  const [reviewingSubmission, setReviewingSubmission] = useState<CommissionSubmission | null>(null);
  const [markingAsPaidSubmission, setMarkingAsPaidSubmission] = useState<CommissionSubmission | null>(null);
  const [viewingPaymentReceipt, setViewingPaymentReceipt] = useState<CommissionSubmission | null>(null);
  const [viewingPDF, setViewingPDF] = useState<{ path: string; title: string } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [openActionMenu, setOpenActionMenu] = useState<string | null>(null);
  const actionMenuRef = useRef<HTMLDivElement>(null);

  // Filter submissions based on user role
  const displaySubmissions = submissions || (
    showFilters 
      ? storeSubmissions // Manager sees all submissions
      : storeSubmissions.filter(s => s.salesperson_id === user?.id) // Salesperson sees only their own
  );

  // Get unique salesperson for filter
  const salespeople = showFilters 
    ? [...new Set(displaySubmissions.map(s => s.salesperson_id))]
    : [];

  useEffect(() => {
    let filtered = displaySubmissions;
    
    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(s => s.status === statusFilter);
    }
    
    // Filter by salesperson (for manager view)
    if (showFilters && salespersonFilter !== 'all') {
      filtered = filtered.filter(s => s.salesperson_id === salespersonFilter);
    }
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(s => 
        s.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.purchase_order_number?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Sort by creation date (newest first)
    filtered = filtered.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    
    setFilteredSubmissions(filtered);
  }, [displaySubmissions, statusFilter, salespersonFilter, searchTerm, showFilters]);

  const getStatusBadge = (status: CommissionSubmission['status']) => {
    const badges = {
      pending: { class: 'status-pending', text: 'Pendiente' },
      under_review: { class: 'status-pending', text: 'En Revisión' },
      flagged: { class: 'status-flagged', text: 'Señalado' },
      approved: { class: 'status-approved', text: 'Aprobado' },
      rejected: { class: 'status-rejected', text: 'Rechazado' },
      paid: { class: 'status-paid', text: 'Pagado' },
    };
    
    const badge = badges[status];
    return (
      <span className={badge.class}>
        {badge.text}
      </span>
    );
  };

  const getStatusCounts = () => {
    const counts = {
      all: displaySubmissions.length,
      pending: displaySubmissions.filter(s => s.status === 'pending').length,
      approved: displaySubmissions.filter(s => s.status === 'approved').length,
      paid: displaySubmissions.filter(s => s.status === 'paid').length,
      rejected: displaySubmissions.filter(s => s.status === 'rejected').length,
    };
    return counts;
  };

  const statusCounts = getStatusCounts();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleEdit = (submission: CommissionSubmission) => {
    if (submission.salesperson_id === user?.id && submission.status === 'pending') {
      setEditingSubmission(submission);
    }
  };

  const handleDelete = async (submissionId: string) => {
    const submission = displaySubmissions.find(s => s.id === submissionId);
    const isManagerDelete = isManager && submission?.salesperson_id !== user?.id;
    
    const confirmMessage = isManagerDelete 
      ? '¿Estás seguro de que deseas eliminar esta solicitud de comisión? Esta acción no se puede deshacer y afectará al vendedor.'
      : '¿Estás seguro de que deseas eliminar esta solicitud? Esta acción no se puede deshacer.';
      
    if (window.confirm(confirmMessage)) {
      setDeletingId(submissionId);
      try {
        await new Promise(resolve => setTimeout(resolve, 500));
        dispatch(deleteSubmission(submissionId));
      } catch (error) {
        console.error('Error deleting submission:', error);
        alert('Error al eliminar la solicitud. Inténtalo de nuevo.');
      } finally {
        setDeletingId(null);
      }
    }
  };

  const canEdit = (submission: CommissionSubmission) => {
    return submission.salesperson_id === user?.id && submission.status === 'pending';
  };

  const canDelete = (submission: CommissionSubmission) => {
    // Salesperson can delete their own pending/under_review submissions
    if (submission.salesperson_id === user?.id && (submission.status === 'pending' || submission.status === 'under_review')) {
      return true;
    }
    // Manager can delete any submission that is not paid
    if (isManager && submission.status !== 'paid') {
      return true;
    }
    return false;
  };

  const handleReview = (submission: CommissionSubmission) => {
    setReviewingSubmission(submission);
  };

  const isManager = user?.role === 'manager';

  const handleViewPDF = (submission: CommissionSubmission) => {
    if (submission.invoice_pdf_path) {
      const title = `${submission.document_type === 'factura' ? 'Factura' : 'Orden de Compra'} - ${submission.client_name}`;
      setViewingPDF({ path: submission.invoice_pdf_path, title });
    }
  };

  const handleMarkAsPaid = (submission: CommissionSubmission) => {
    setMarkingAsPaidSubmission(submission);
  };

  const handleViewPaymentReceipt = (submission: CommissionSubmission) => {
    setViewingPaymentReceipt(submission);
  };

  const canMarkAsPaid = (submission: CommissionSubmission) => {
    return isManager && submission.status === 'approved';
  };

  const canViewPaymentReceipt = (submission: CommissionSubmission) => {
    return submission.status === 'paid' && (submission.payout_receipt_path || submission.paid_at);
  };

  const getSalespersonName = (salespersonId: string) => {
    // Since we only have Roberto, return his name or a fallback
    return salespersonId === user?.id ? user.full_name : 'Roberto Cosio';
  };

  // Close action menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (actionMenuRef.current && !actionMenuRef.current.contains(event.target as Node)) {
        setOpenActionMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            {showFilters ? 'Solicitudes de Comisión' : 'Mis Solicitudes'}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {filteredSubmissions.length} de {displaySubmissions.length} solicitudes
          </p>
        </div>

        {/* Search bar */}
        {showFilters && (
          <div className="relative">
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Buscar cliente, factura, OP..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10 w-64"
            />
          </div>
        )}
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="space-y-4">
          {/* Salesperson Filter for Managers */}
          {isManager && salespeople.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Vendedor</label>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setSalespersonFilter('all')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    salespersonFilter === 'all'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Todos los Vendedores
                </button>
                {salespeople.map(salespersonId => (
                  <button
                    key={salespersonId}
                    onClick={() => setSalespersonFilter(salespersonId)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      salespersonFilter === salespersonId
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {getSalespersonName(salespersonId)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  statusFilter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Todas ({statusCounts.all})
              </button>
              <button
                onClick={() => setStatusFilter('pending')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  statusFilter === 'pending'
                    ? 'bg-yellow-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Pendientes ({statusCounts.pending})
              </button>
              <button
                onClick={() => setStatusFilter('approved')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  statusFilter === 'approved'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Aprobadas ({statusCounts.approved})
              </button>
              <button
                onClick={() => setStatusFilter('paid')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  statusFilter === 'paid'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Pagadas ({statusCounts.paid})
              </button>
              <button
                onClick={() => setStatusFilter('rejected')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  statusFilter === 'rejected'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Rechazadas ({statusCounts.rejected})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      <div className="card overflow-hidden">
        {filteredSubmissions.length === 0 ? (
          <div className="p-12 text-center">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay solicitudes</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              {searchTerm ? 
                `No se encontraron solicitudes que coincidan con "${searchTerm}".` :
                showFilters ? 
                  'No se encontraron solicitudes con los filtros seleccionados.' :
                  'Aún no has enviado ninguna solicitud de comisión.'
              }
            </p>
            {searchTerm || (statusFilter !== 'all') || (salespersonFilter !== 'all') ? (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setSalespersonFilter('all');
                }}
                className="btn-secondary mt-4"
              >
                Limpiar filtros
              </button>
            ) : null}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Documento
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monto
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Comisión
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSubmissions.map((submission) => (
                  <tr key={submission.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          OP: {submission.purchase_order_number || 'Sin OP'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {submission.client_requires_invoice ? (
                            <span className="text-green-600">Con factura: {submission.invoice_number}</span>
                          ) : (
                            <span className="text-orange-600">Sin factura</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm font-medium text-gray-900">{submission.client_name}</div>
                      {showFilters && (
                        <div className="text-xs text-gray-500">{getSalespersonName(submission.salesperson_id)}</div>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(submission.client_requires_invoice ? submission.amount_without_iva : submission.amount_with_iva)}
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <span className={`text-xs px-1.5 py-0.5 rounded ${
                            submission.client_requires_invoice 
                              ? 'bg-orange-100 text-orange-700' 
                              : 'bg-green-100 text-green-700'
                          }`}>
                            {submission.client_requires_invoice ? 'Sin IVA' : 'Con IVA'}
                          </span>
                          {submission.is_mercado_libre_sale && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-medium">ML</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(submission.commission_amount)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {submission.payment_days} días • {Math.round((submission.commission_percentage || 1) * 100)}%
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500">
                      {formatDate(submission.created_at)}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        {/* Status-based action button */}
                        {isManager && submission.status === 'pending' && (
                          <button
                            onClick={() => handleReview(submission)}
                            className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200 hover:bg-yellow-200 transition-colors"
                          >
                            <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                            Revisar
                          </button>
                        )}
                        
                        {isManager && submission.status === 'under_review' && (
                          <button
                            onClick={() => handleReview(submission)}
                            className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200 hover:bg-blue-200 transition-colors"
                          >
                            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                            En Revisión
                          </button>
                        )}
                        
                        {canMarkAsPaid(submission) && (
                          <button
                            onClick={() => handleMarkAsPaid(submission)}
                            className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200 hover:bg-green-200 transition-colors"
                          >
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                            Pagar
                          </button>
                        )}
                        
                        {canViewPaymentReceipt(submission) && (
                          <button
                            onClick={() => handleViewPaymentReceipt(submission)}
                            className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200 hover:bg-emerald-200 transition-colors"
                          >
                            <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
                            Pagado
                          </button>
                        )}
                        
                        {submission.status === 'rejected' && (
                          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                            <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                            Rechazado
                          </span>
                        )}
                        
                        {!isManager && submission.status === 'pending' && (
                          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                            <div className="w-2 h-2 bg-gray-500 rounded-full mr-2"></div>
                            Pendiente
                          </span>
                        )}
                        
                        {!isManager && submission.status === 'under_review' && (
                          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                            En Revisión
                          </span>
                        )}
                        
                        {!isManager && submission.status === 'approved' && (
                          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                            Aprobado
                          </span>
                        )}
                        
                        {!isManager && submission.status === 'paid' && (
                          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
                            Pagado
                          </span>
                        )}
                        
                        {!isManager && submission.status === 'rejected' && (
                          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                            <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                            Rechazado
                          </span>
                        )}

                        {/* Secondary actions */}
                        <button
                          onClick={() => handleViewPDF(submission)}
                          className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200 transition-colors"
                          title={submission.document_type === 'factura' ? 'Ver Factura' : 'Ver Orden de Compra'}
                        >
                          📄 PDF
                        </button>
                        
                        {/* More options dropdown for edit/delete */}
                        {(canEdit(submission) || canDelete(submission)) && (
                          <div className="relative" ref={actionMenuRef}>
                            <button
                              onClick={() => setOpenActionMenu(openActionMenu === submission.id ? null : submission.id)}
                              className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200 transition-colors"
                            >
                              ⋯
                            </button>
                            
                            {openActionMenu === submission.id && (
                              <div className="absolute right-0 mt-2 w-36 rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                                <div className="py-1">                              
                                  {canEdit(submission) && (
                                    <button
                                      onClick={() => {
                                        handleEdit(submission);
                                        setOpenActionMenu(null);
                                      }}
                                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                                    >
                                      ✏️ Editar
                                    </button>
                                  )}
                                  
                                  {canDelete(submission) && (
                                    <>
                                      {canEdit(submission) && <div className="border-t border-gray-100 my-1"></div>}
                                      <button
                                        onClick={() => {
                                          handleDelete(submission.id);
                                          setOpenActionMenu(null);
                                        }}
                                        disabled={deletingId === submission.id}
                                        className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center disabled:opacity-50"
                                      >
                                        {deletingId === submission.id ? '⏳ Eliminando...' : '🗑️ Eliminar'}
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingSubmission && (
        <EditSubmissionModal
          submission={editingSubmission}
          isOpen={true}
          onClose={() => setEditingSubmission(null)}
        />
      )}

      {/* Review Modal */}
      {reviewingSubmission && (
        <ReviewSubmission
          submission={reviewingSubmission}
          isOpen={true}
          onClose={() => setReviewingSubmission(null)}
        />
      )}

      {/* Mark as Paid Modal */}
      {markingAsPaidSubmission && (
        <MarkAsPaidModal
          submission={markingAsPaidSubmission}
          isOpen={true}
          onClose={() => setMarkingAsPaidSubmission(null)}
        />
      )}

      {/* Payment Receipt Viewer Modal */}
      {viewingPaymentReceipt && (
        <PaymentReceiptViewer
          submission={viewingPaymentReceipt}
          isOpen={true}
          onClose={() => setViewingPaymentReceipt(null)}
        />
      )}

      {/* PDF Viewer Modal */}
      {viewingPDF && (
        <PDFViewer
          isOpen={true}
          onClose={() => setViewingPDF(null)}
          pdfPath={viewingPDF.path}
          title={viewingPDF.title}
        />
      )}
    </div>
  );
};

export default SubmissionsList;