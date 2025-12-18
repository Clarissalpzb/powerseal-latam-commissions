import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { updateSubmission } from '@/store/slices/submissionsSlice';
import { CommissionSubmission } from '@/types';
import { formatCurrency } from '@/utils/currency';

interface ReviewSubmissionProps {
  submission: CommissionSubmission;
  isOpen: boolean;
  onClose: () => void;
}

const ReviewSubmission = ({ submission, isOpen, onClose }: ReviewSubmissionProps) => {
  const dispatch = useDispatch();
  const [decision, setDecision] = useState<'approve' | 'reject' | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleSubmit = async () => {
    if (!decision) return;
    
    setIsSubmitting(true);
    try {
      const updatedSubmission: CommissionSubmission = {
        ...submission,
        status: decision === 'approve' ? 'approved' : 'rejected',
        rejection_reason: decision === 'reject' ? rejectionReason : null,
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      dispatch(updateSubmission(updatedSubmission));
      onClose();
    } catch (error) {
      console.error('Failed to update submission:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const isML = submission.is_mercado_libre_sale;
  const commissionBase = submission.client_requires_invoice 
    ? submission.amount_without_iva 
    : submission.amount_with_iva;

  // Generate AI-style summary
  const getSummary = () => {
    const paymentSpeed = submission.payment_days <= 30 ? 'rápido' : 
                        submission.payment_days <= 60 ? 'moderado' : 'tardío';
    const commissionImpact = submission.commission_percentage === 1 ? 'completa' :
                            submission.commission_percentage >= 0.7 ? 'reducida' : 'significativamente reducida';
    
    const baseType = submission.client_requires_invoice ? 'sin IVA' : 'con IVA';
    const mlNote = isML ? ' después de descontar fees de Mercado Libre' : '';
    
    return `Cliente pagó en ${submission.payment_days} días (pago ${paymentSpeed}), resultando en comisión ${commissionImpact}. ` +
           `La comisión se calcula sobre el monto ${baseType}${mlNote}.`;
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" 
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Revisar Solicitud
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {submission.client_name} • {formatDate(submission.created_at)}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* AI Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-blue-900 mb-1">Resumen</h3>
                <p className="text-sm text-blue-700">{getSummary()}</p>
              </div>
            </div>
          </div>

          {/* Document Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Número de OP</p>
              <p className="font-medium">{submission.purchase_order_number || 'Sin OP'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">¿Se emitió factura?</p>
              <div>
                <div className="flex items-center gap-2">
                  <span className={`font-medium ${submission.client_requires_invoice ? 'text-green-700' : 'text-orange-700'}`}>
                    {submission.client_requires_invoice ? 'Sí' : 'No'}
                  </span>
                  {submission.client_requires_invoice && submission.invoice_number && (
                    <span className="text-sm text-gray-600">• {submission.invoice_number}</span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Comisión sobre: {submission.client_requires_invoice ? 'Sin IVA' : 'Con IVA'}
                </p>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500">Fecha de Pago</p>
              <p className="font-medium">{formatDate(submission.client_payment_date)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Días para Pago</p>
              <p className="font-medium">{submission.payment_days} días</p>
            </div>
          </div>

          {/* Amounts */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <h3 className="font-medium text-gray-900">Detalles del Monto</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className={`${!submission.client_requires_invoice && !isML ? 'ring-2 ring-green-500 rounded-lg p-2' : ''}`}>
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  Monto con IVA
                  {!submission.client_requires_invoice && !isML && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Base comisión</span>
                  )}
                </p>
                <p className="text-lg font-semibold">{formatCurrency(submission.amount_with_iva)}</p>
              </div>
              <div className={`${submission.client_requires_invoice && !isML ? 'ring-2 ring-green-500 rounded-lg p-2' : ''}`}>
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  Monto sin IVA
                  {submission.client_requires_invoice && !isML && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Base comisión</span>
                  )}
                </p>
                <p className="text-lg font-semibold">{formatCurrency(submission.amount_without_iva)}</p>
              </div>
            </div>

            {isML && (
              <div className="border-t pt-3 mt-3 space-y-2">
                <p className="text-sm font-medium text-blue-900">Mercado Libre</p>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cargos por venta:</span>
                    <span className="text-red-600">-{formatCurrency(submission.ml_fee_cargos_venta || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Envíos:</span>
                    <span className="text-red-600">-{formatCurrency(submission.ml_fee_envios || 0)}</span>
                  </div>
                  <div className="flex justify-between font-medium pt-1 border-t">
                    <span>Neto después de ML:</span>
                    <span>{formatCurrency(submission.net_amount_after_ml || 0)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Commission Calculation */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-gray-900">Cálculo de Comisión</h3>
              <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                submission.client_requires_invoice 
                  ? 'bg-orange-100 text-orange-800' 
                  : 'bg-green-100 text-green-800'
              }`}>
                Base: Monto {submission.client_requires_invoice ? 'SIN' : 'CON'} IVA
              </span>
            </div>
            
            <div className="space-y-3">
              {/* Visual breakdown */}
              <div className="bg-white rounded p-3 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Monto base:</span>
                  <div className="text-right">
                    <span className="font-semibold">
                      {formatCurrency(isML && submission.net_amount_after_ml ? submission.net_amount_after_ml : commissionBase)}
                    </span>
                    <p className="text-xs text-gray-500">
                      {submission.client_requires_invoice ? 'Sin IVA' : 'Con IVA'}
                      {isML ? ' (neto ML)' : ''}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-gray-400">
                  <div className="flex-1 border-t"></div>
                  <span className="text-xs">×</span>
                  <div className="flex-1 border-t"></div>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Tasa de comisión:</span>
                  <span className="font-medium">{(submission.commission_rate * 100).toFixed(1)}%</span>
                </div>
                
                <div className="flex items-center gap-2 text-gray-400">
                  <div className="flex-1 border-t"></div>
                  <span className="text-xs">×</span>
                  <div className="flex-1 border-t"></div>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Factor por tiempo de pago:</span>
                  <div className="text-right">
                    <span className="font-medium">{Math.round((submission.commission_percentage || 1) * 100)}%</span>
                    <p className="text-xs text-gray-500">{submission.payment_days} días</p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between items-center pt-2 border-t border-green-200">
                <span className="font-semibold">Comisión Total:</span>
                <span className="text-xl font-bold text-green-700">{formatCurrency(submission.commission_amount)}</span>
              </div>
            </div>
          </div>

          {/* Decision Buttons */}
          <div className="border-t pt-6">
            <p className="text-sm font-medium text-gray-700 mb-4">Decisión</p>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <button
                onClick={() => setDecision('approve')}
                className={`p-6 rounded-lg border-2 transition-all ${
                  decision === 'approve' 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <svg className="w-8 h-8 mx-auto mb-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p className="font-medium">Aprobar</p>
              </button>

              <button
                onClick={() => setDecision('reject')}
                className={`p-6 rounded-lg border-2 transition-all ${
                  decision === 'reject' 
                    ? 'border-red-500 bg-red-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <svg className="w-8 h-8 mx-auto mb-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <p className="font-medium">Rechazar</p>
              </button>
            </div>

            {decision === 'reject' && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Razón del Rechazo *
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={3}
                  className="input w-full"
                  placeholder="Por favor explique la razón del rechazo..."
                  required
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className="btn-secondary"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={!decision || (decision === 'reject' && !rejectionReason) || isSubmitting}
                className={`btn ${
                  decision === 'approve' ? 'btn-success' : 
                  decision === 'reject' ? 'btn-danger' : 
                  'btn-primary'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isSubmitting ? 'Procesando...' : 
                 decision === 'approve' ? 'Confirmar Aprobación' :
                 decision === 'reject' ? 'Confirmar Rechazo' :
                 'Seleccionar Decisión'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewSubmission;