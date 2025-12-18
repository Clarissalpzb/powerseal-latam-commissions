import { useState } from 'react';
import { CommissionSubmission } from '@/types';

interface PaymentReceiptViewerProps {
  submission: CommissionSubmission;
  isOpen: boolean;
  onClose: () => void;
}

const PaymentReceiptViewer = ({ submission, isOpen, onClose }: PaymentReceiptViewerProps) => {
  const [imageError, setImageError] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const parsePaymentNotes = (notes: string | null | undefined) => {
    if (!notes) return null;
    
    const lines = notes.split('\n');
    const paymentData: Record<string, string> = {};
    
    lines.forEach(line => {
      if (line.includes(':')) {
        const [key, value] = line.split(':').map(s => s.trim());
        paymentData[key] = value;
      }
    });
    
    return paymentData;
  };

  const isImageFile = (path: string) => {
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(path);
  };

  const isPdfFile = (path: string) => {
    return /\.pdf$/i.test(path);
  };

  if (!isOpen) return null;

  const paymentData = parsePaymentNotes(submission.notes);

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" 
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Comprobante de Pago
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {submission.client_name} • Pagado el {submission.paid_at ? formatDate(submission.paid_at) : 'Fecha no disponible'}
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
          {/* Payment Summary */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-green-900">Comisión Pagada</h3>
                <p className="text-sm text-green-700 mt-1">
                  Solicitud: {submission.id.slice(-8).toUpperCase()} • OP: {submission.purchase_order_number || 'Sin OP'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-900">
                  {new Intl.NumberFormat('es-MX', {
                    style: 'currency',
                    currency: 'MXN',
                  }).format(submission.commission_amount)}
                </p>
                <p className="text-sm text-green-700">
                  {(submission.commission_rate * 100).toFixed(1)}% comisión
                </p>
              </div>
            </div>
          </div>

          {/* Payment Details */}
          {paymentData && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-3">Detalles del Pago</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {paymentData['Método'] && (
                  <div>
                    <span className="text-sm text-gray-500">Método de Pago:</span>
                    <p className="font-medium">{paymentData['Método']}</p>
                  </div>
                )}
                {paymentData['Referencia'] && (
                  <div>
                    <span className="text-sm text-gray-500">Referencia:</span>
                    <p className="font-medium font-mono">{paymentData['Referencia']}</p>
                  </div>
                )}
                {paymentData['Fecha de pago'] && (
                  <div>
                    <span className="text-sm text-gray-500">Fecha de Pago:</span>
                    <p className="font-medium">{paymentData['Fecha de pago']}</p>
                  </div>
                )}
                {paymentData['Notas'] && (
                  <div className="md:col-span-2">
                    <span className="text-sm text-gray-500">Notas:</span>
                    <p className="font-medium">{paymentData['Notas']}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Payment Receipt Display */}
          <div className="border rounded-lg p-6">
            <h3 className="font-medium text-gray-900 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Comprobante de Pago
            </h3>
            
            {submission.payout_receipt_path ? (
              <div className="space-y-4">
                {isPdfFile(submission.payout_receipt_path) ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                    <svg className="w-16 h-16 mx-auto text-red-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">Documento PDF</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      El comprobante es un archivo PDF que no se puede mostrar en esta ventana.
                    </p>
                    <button 
                      onClick={() => window.open(submission.payout_receipt_path!, '_blank')}
                      className="btn-primary"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Abrir PDF
                    </button>
                  </div>
                ) : isImageFile(submission.payout_receipt_path) ? (
                  <div className="text-center">
                    {!imageError ? (
                      <img
                        src={submission.payout_receipt_path}
                        alt="Comprobante de pago"
                        className="max-w-full h-auto rounded-lg shadow-lg mx-auto"
                        onError={() => setImageError(true)}
                      />
                    ) : (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                        <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-gray-500">No se pudo cargar la imagen</p>
                        <button 
                          onClick={() => window.open(submission.payout_receipt_path!, '_blank')}
                          className="btn-secondary mt-2"
                        >
                          Abrir en nueva ventana
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                    <svg className="w-16 h-16 mx-auto text-blue-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">Archivo Adjunto</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Comprobante de pago disponible para descarga.
                    </p>
                    <button 
                      onClick={() => window.open(submission.payout_receipt_path!, '_blank')}
                      className="btn-primary"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Abrir Archivo
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-gray-500">No hay comprobante de pago disponible</p>
                <p className="text-sm text-gray-400 mt-1">El manager no adjuntó un comprobante</p>
              </div>
            )}
          </div>

          {/* Close Button */}
          <div className="flex justify-end pt-4">
            <button
              onClick={onClose}
              className="btn-secondary"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentReceiptViewer;