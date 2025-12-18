import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { updateSubmission } from '@/store/slices/submissionsSlice';
import { CommissionSubmission } from '@/types';
import { formatCurrency } from '@/utils/currency';

interface MarkAsPaidModalProps {
  submission: CommissionSubmission;
  isOpen: boolean;
  onClose: () => void;
}

const MarkAsPaidModal = ({ submission, isOpen, onClose }: MarkAsPaidModalProps) => {
  const dispatch = useDispatch();
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentReference, setPaymentReference] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'transfer' | 'check' | 'cash'>('transfer');
  const [paymentReceipt, setPaymentReceipt] = useState<File | null>(null);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.includes('pdf') && !file.type.includes('image')) {
        alert('Por favor selecciona un archivo PDF o imagen');
        return;
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('El archivo debe ser menor a 10MB');
        return;
      }
      
      setPaymentReceipt(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!paymentDate || !paymentReference) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate file upload
      const receiptPath = paymentReceipt 
        ? `/uploads/payment-receipts/${Date.now()}-${paymentReceipt.name}`
        : null;

      const updatedSubmission: CommissionSubmission = {
        ...submission,
        status: 'paid',
        paid_at: new Date(paymentDate).toISOString(),
        payout_receipt_path: receiptPath,
        notes: notes || null,
        updated_at: new Date().toISOString(),
      };

      // Add payment metadata to notes
      const paymentInfo = [
        `Método: ${paymentMethod === 'transfer' ? 'Transferencia' : paymentMethod === 'check' ? 'Cheque' : 'Efectivo'}`,
        `Referencia: ${paymentReference}`,
        `Fecha de pago: ${formatDate(paymentDate)}`,
        notes ? `Notas: ${notes}` : ''
      ].filter(Boolean).join('\n');

      updatedSubmission.notes = paymentInfo;

      dispatch(updateSubmission(updatedSubmission));
      onClose();
    } catch (error) {
      console.error('Failed to mark as paid:', error);
      alert('Error al marcar como pagado. Inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" 
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Marcar como Pagado
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {submission.client_name} • {formatCurrency(submission.commission_amount)}
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
        <div className="p-6">
          {/* Commission Summary */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-green-900">Comisión a Pagar</h3>
                <p className="text-sm text-green-700 mt-1">
                  Solicitud ID: {submission.id.slice(-6)} • OP: {submission.purchase_order_number || 'Sin OP'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-900">
                  {formatCurrency(submission.commission_amount)}
                </p>
                <p className="text-sm text-green-700">
                  {submission.commission_rate * 100}% • {submission.payment_days} días
                </p>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Pago *
                </label>
                <input
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="input w-full"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Método de Pago *
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as 'transfer' | 'check' | 'cash')}
                  className="input w-full"
                  required
                >
                  <option value="transfer">Transferencia Bancaria</option>
                  <option value="check">Cheque</option>
                  <option value="cash">Efectivo</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número de Referencia / Folio *
              </label>
              <input
                type="text"
                value={paymentReference}
                onChange={(e) => setPaymentReference(e.target.value)}
                className="input w-full"
                placeholder="Ej: SPEI12345, CHQ001, etc."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comprobante de Pago
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="flex text-sm text-gray-600">
                    <label className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500">
                      <span>Subir archivo</span>
                      <input
                        type="file"
                        className="sr-only"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleFileChange}
                      />
                    </label>
                    <p className="pl-1">o arrastra aquí</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PDF, PNG, JPG hasta 10MB
                  </p>
                  {paymentReceipt && (
                    <div className="mt-2">
                      <p className="text-sm text-green-600 font-medium">
                        📄 {paymentReceipt.name}
                      </p>
                      <button
                        type="button"
                        onClick={() => setPaymentReceipt(null)}
                        className="text-xs text-red-600 hover:text-red-800"
                      >
                        Remover archivo
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notas Adicionales
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="input w-full"
                placeholder="Notas sobre el pago (opcional)..."
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-blue-900">
                    Importante
                  </p>
                  <p className="text-xs text-blue-700 mt-1">
                    Al marcar como pagado, el vendedor recibirá una notificación y podrá ver el comprobante de pago.
                    Esta acción no se puede deshacer.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !paymentDate || !paymentReference}
                className="btn-success disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Procesando...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                    Marcar como Pagado
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MarkAsPaidModal;