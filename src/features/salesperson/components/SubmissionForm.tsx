import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addSubmission } from '@/store/slices/submissionsSlice';
import { RootState } from '@/store';
import { v4 as uuidv4 } from 'uuid';
import { storeUploadedFile } from '@/utils/fileUtils';

const SubmissionForm = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [formData, setFormData] = useState({
    purchase_order_number: '',
    has_invoice: true, // Whether there's an invoice or not
    invoice_number: '',
    invoice_date: '',
    client_payment_date: '',
    client_name: '',
    amount_with_iva: '',
    amount_without_iva: '',
    is_mercado_libre_sale: false,
    ml_fee_cargos_venta: '',
    ml_fee_envios: '',
  });
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    let updatedData = {
      ...formData,
      [name]: newValue,
    };
    
    // Auto-calculate IVA amounts (16% IVA rate)
    const IVA_RATE = 0.16;
    
    if (name === 'amount_with_iva' && value) {
      const withIva = parseFloat(value);
      const withoutIva = withIva / (1 + IVA_RATE);
      updatedData.amount_without_iva = withoutIva.toFixed(2);
    } else if (name === 'amount_without_iva' && value) {
      const withoutIva = parseFloat(value);
      const withIva = withoutIva * (1 + IVA_RATE);
      updatedData.amount_with_iva = withIva.toFixed(2);
    }
    
    
    setFormData(updatedData);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        setError('Por favor suba solo archivos PDF');
        return;
      }
      if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
        setError('El archivo debe ser menor a 10MB');
        return;
      }
      setFile(selectedFile);
      setError('');
    }
  };

  // Calculate commission percentage based on payment days
  const calculateCommissionPercentage = (invoiceDate: string, paymentDate: string): number => {
    if (!invoiceDate || !paymentDate) return 1; // Default to 100% if dates not provided
    
    const invoice = new Date(invoiceDate);
    const payment = new Date(paymentDate);
    const daysDiff = Math.floor((payment.getTime() - invoice.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff <= 45) return 1.0; // 100%
    if (daysDiff <= 60) return 0.7; // 70%
    if (daysDiff <= 90) return 0.5; // 50%
    return 0; // 0% after 90 days
  };

  const getCommissionPercentageInfo = () => {
    if (!formData.invoice_date || !formData.client_payment_date) {
      return { percentage: 100, days: 0, color: 'text-secondary-500' };
    }
    
    const invoice = new Date(formData.invoice_date);
    const payment = new Date(formData.client_payment_date);
    const daysDiff = Math.floor((payment.getTime() - invoice.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff <= 45) return { percentage: 100, days: daysDiff, color: 'text-success-600' };
    if (daysDiff <= 60) return { percentage: 70, days: daysDiff, color: 'text-warning-600' };
    if (daysDiff <= 90) return { percentage: 50, days: daysDiff, color: 'text-warning-700' };
    return { percentage: 0, days: daysDiff, color: 'text-error-600' };
  };

  const commissionInfo = getCommissionPercentageInfo();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    try {
      if (!file) {
        setError('Por favor suba el documento PDF');
        return;
      }

      if (!user) {
        setError('Usuario no autenticado');
        return;
      }

      if (!formData.purchase_order_number) {
        setError('Por favor ingrese el número de orden de compra');
        return;
      }

      if (formData.has_invoice && !formData.invoice_number) {
        setError('Por favor ingrese el número de factura');
        return;
      }

      if (!formData.client_payment_date) {
        setError('Por favor ingrese la fecha de pago del cliente');
        return;
      }

      // Check if payment date is after invoice date
      const invoiceDate = new Date(formData.invoice_date);
      const paymentDate = new Date(formData.client_payment_date);
      if (paymentDate < invoiceDate) {
        setError('La fecha de pago no puede ser anterior a la fecha de la factura');
        return;
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Determine which amount to use for commission based on client requirements
      const amountWithIva = parseFloat(formData.amount_with_iva);
      const amountWithoutIva = parseFloat(formData.amount_without_iva);
      
      // Commission base calculation logic
      let mlTotalFees = 0;
      let commissionBaseAmount = 0;
      
      if (formData.is_mercado_libre_sale) {
        // For Mercado Libre sales:
        const cargosFee = parseFloat(formData.ml_fee_cargos_venta) || 0;
        const enviosFee = parseFloat(formData.ml_fee_envios) || 0;
        mlTotalFees = cargosFee + enviosFee;
        
        // 1. Start with amount WITH IVA (what customer paid to ML)
        // 2. Subtract ML fees
        const netAfterMLFees = amountWithIva - mlTotalFees;
        
        // 3. If client requires invoice, subtract 16% IVA from the net amount
        if (formData.has_invoice) {
          commissionBaseAmount = netAfterMLFees - (netAfterMLFees * 0.16); // Subtract 16%
        } else {
          commissionBaseAmount = netAfterMLFees; // Keep with IVA
        }
      } else {
        // For regular sales (non-ML):
        // - Has invoice → use amount WITHOUT IVA
        // - No invoice → use amount WITH IVA
        commissionBaseAmount = formData.has_invoice ? amountWithoutIva : amountWithIva;
      }
      

      const baseCommissionAmount = commissionBaseAmount * (user.commission_rate || 0.03);
      const commissionPercentage = calculateCommissionPercentage(formData.invoice_date, formData.client_payment_date);
      const finalCommissionAmount = baseCommissionAmount * commissionPercentage;

      // Store the uploaded file and get the path
      const filePath = `/uploads/${file.name}`;
      storeUploadedFile(filePath, file);

      // Create new submission
      const newSubmission = {
        id: uuidv4(),
        salesperson_id: user.id,
        document_type: formData.has_invoice ? 'factura' as const : 'orden_compra' as const,
        invoice_number: formData.has_invoice ? formData.invoice_number : '',
        purchase_order_number: formData.purchase_order_number,
        invoice_date: formData.invoice_date,
        client_payment_date: formData.client_payment_date,
        payment_days: Math.floor((paymentDate.getTime() - invoiceDate.getTime()) / (1000 * 60 * 60 * 24)),
        commission_percentage: commissionPercentage,
        client_name: formData.client_name,
        amount_with_iva: amountWithIva,
        amount_without_iva: amountWithoutIva,
        client_requires_invoice: formData.has_invoice,
        invoice_amount: formData.has_invoice ? amountWithoutIva : amountWithIva,
        submitted_amount: formData.has_invoice ? amountWithoutIva : amountWithIva,
        
        // Mercado Libre fields
        is_mercado_libre_sale: formData.is_mercado_libre_sale,
        ml_fee_cargos_venta: formData.is_mercado_libre_sale ? parseFloat(formData.ml_fee_cargos_venta) || 0 : undefined,
        ml_fee_envios: formData.is_mercado_libre_sale ? parseFloat(formData.ml_fee_envios) || 0 : undefined,
        ml_total_fees: formData.is_mercado_libre_sale ? mlTotalFees : undefined,
        net_amount_after_ml: formData.is_mercado_libre_sale ? (amountWithIva - mlTotalFees) : undefined,
        
        
        commission_rate: user.commission_rate || 0.03,
        commission_amount: finalCommissionAmount,
        base_commission_amount: baseCommissionAmount,
        status: 'pending' as const,
        invoice_pdf_path: filePath,
        payout_receipt_path: null,
        notes: null,
        rejection_reason: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        reviewed_at: null,
        paid_at: null,
      };

      // Add to Redux store
      dispatch(addSubmission(newSubmission));

      setSuccess('¡Solicitud de comisión enviada exitosamente!');
      setFormData({
        purchase_order_number: '',
        has_invoice: true,
        invoice_number: '',
        invoice_date: '',
        client_payment_date: '',
        client_name: '',
        amount_with_iva: '',
        amount_without_iva: '',
        is_mercado_libre_sale: false,
        ml_fee_cargos_venta: '',
        ml_fee_envios: '',
      });
      setFile(null);
      const fileInput = document.getElementById('document_pdf') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al enviar la solicitud');
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="max-w-2xl">
      <div className="card p-8">
        <h2 className="text-xl font-semibold text-secondary-900 mb-6">Nueva Solicitud de Comisión</h2>
        

        {/* Commission Percentage Info */}
        {formData.invoice_date && formData.client_payment_date && (
          <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <svg className="w-5 h-5 text-primary-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div>
                <h4 className="text-sm font-semibold text-primary-800">Porcentaje de Comisión</h4>
                <p className="text-sm text-primary-700 mt-1">
                  Pago en <strong>{commissionInfo.days} días</strong> = 
                  <span className={`font-bold ml-1 ${commissionInfo.color}`}>
                    {commissionInfo.percentage}% de comisión
                  </span>
                </p>
                <p className="text-xs text-primary-600 mt-1">
                  0-45 días: 100% • 46-60 días: 70% • 61-90 días: 50% • +90 días: 0%
                </p>
              </div>
            </div>
          </div>
        )}
        
        {error && (
          <div className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-success-50 border border-success-200 text-success-700 px-4 py-3 rounded-lg mb-4">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="purchase_order_number" className="block text-sm font-semibold text-secondary-900 mb-2">
              Número de Orden de Compra *
            </label>
            <input
              type="text"
              name="purchase_order_number"
              id="purchase_order_number"
              required
              className="input w-full"
              value={formData.purchase_order_number}
              onChange={handleInputChange}
              placeholder="OC-2024-001"
            />
            <p className="text-xs text-secondary-500 mt-1">
              Toda venta inicia con una orden de compra del cliente.
            </p>
          </div>

          <div>
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                name="has_invoice"
                id="has_invoice"
                checked={formData.has_invoice}
                onChange={handleInputChange}
                className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <label htmlFor="has_invoice" className="ml-2 text-sm font-semibold text-secondary-900">
                ¿Se emitió factura para esta venta?
              </label>
            </div>
            
            <div className={`p-3 rounded-lg border ${formData.has_invoice ? 'bg-blue-50 border-blue-200' : 'bg-green-50 border-green-200'}`}>
              <div className="flex items-start">
                <svg className={`w-4 h-4 mr-2 flex-shrink-0 mt-0.5 ${formData.has_invoice ? 'text-blue-500' : 'text-green-500'}`} fill="currentColor" viewBox="0 0 20 20">
                  {formData.has_invoice ? (
                    <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  ) : (
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  )}
                </svg>
                <div>
                  <p className={`text-sm font-semibold ${formData.has_invoice ? 'text-blue-800' : 'text-green-800'}`}>
                    {formData.has_invoice ? 'Con Factura' : 'Sin Factura'}
                  </p>
                  <p className={`text-xs mt-1 ${formData.has_invoice ? 'text-blue-700' : 'text-green-700'}`}>
                    {formData.has_invoice 
                      ? 'La comisión se calcula sobre el monto sin IVA (monto base de la factura)'
                      : 'La comisión se calcula sobre el monto total pagado (incluye IVA)'
                    }
                  </p>
                </div>
              </div>
            </div>
            
            {formData.has_invoice && (
              <div className="mt-4">
                <label htmlFor="invoice_number" className="block text-sm font-semibold text-secondary-900 mb-2">
                  Número de Factura *
                </label>
                <input
                  type="text"
                  name="invoice_number"
                  id="invoice_number"
                  required
                  className="input w-full"
                  value={formData.invoice_number}
                  onChange={handleInputChange}
                  placeholder="FAC-2024-001"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="invoice_date" className="block text-sm font-semibold text-secondary-900 mb-2">
                Fecha del {formData.has_invoice ? 'Factura' : 'Documento'} *
              </label>
              <input
                type="date"
                name="invoice_date"
                id="invoice_date"
                required
                className="input w-full"
                value={formData.invoice_date}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label htmlFor="client_payment_date" className="block text-sm font-semibold text-secondary-900 mb-2">
                Fecha de Pago del Cliente *
              </label>
              <input
                type="date"
                name="client_payment_date"
                id="client_payment_date"
                required
                className="input w-full"
                value={formData.client_payment_date}
                onChange={handleInputChange}
              />
              <p className="text-xs text-secondary-500 mt-1">
                Esta fecha determina el porcentaje de comisión que recibirás.
              </p>
            </div>
          </div>

          <div>
            <label htmlFor="client_name" className="block text-sm font-semibold text-secondary-900 mb-2">
              Nombre del Cliente *
            </label>
            <input
              type="text"
              name="client_name"
              id="client_name"
              required
              className="input w-full"
              value={formData.client_name}
              onChange={handleInputChange}
              placeholder="Acme Corp"
            />
          </div>

          {/* Dual Amount Inputs */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-secondary-900 mb-3">
                Montos de Venta {formData.is_mercado_libre_sale ? '(Brutos antes de comisiones ML)' : ''}
              </label>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="amount_with_iva" className="block text-sm font-medium text-secondary-700 mb-2">
                    Monto con IVA (16%) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-500">$</span>
                    <input
                      type="number"
                      name="amount_with_iva"
                      id="amount_with_iva"
                      required
                      min="0"
                      step="0.01"
                      className="input w-full pl-8"
                      value={formData.amount_with_iva}
                      onChange={handleInputChange}
                      placeholder="11,600.00"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="amount_without_iva" className="block text-sm font-medium text-secondary-700 mb-2">
                    Monto sin IVA *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-500">$</span>
                    <input
                      type="number"
                      name="amount_without_iva"
                      id="amount_without_iva"
                      required
                      min="0"
                      step="0.01"
                      className="input w-full pl-8"
                      value={formData.amount_without_iva}
                      onChange={handleInputChange}
                      placeholder="10,000.00"
                    />
                  </div>
                </div>
              </div>
              
              <p className="text-xs text-secondary-500 mt-2">
                Los montos se calculan automáticamente entre sí usando la tasa de IVA del 16%
              </p>
            </div>
            
            {/* Commission Base Information */}
            <div className="mt-3 p-3 rounded-lg border">
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-secondary-700">Base inicial:</span>
                  <span className="font-medium">
                    {formData.has_invoice ? (
                      <>Monto sin IVA: ${parseFloat(formData.amount_without_iva || '0').toLocaleString('es-MX', { minimumFractionDigits: 2 })}</>
                    ) : (
                      <>Monto con IVA: ${parseFloat(formData.amount_with_iva || '0').toLocaleString('es-MX', { minimumFractionDigits: 2 })}</>
                    )}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-1 font-semibold">
                  <span className="text-secondary-900">Base para comisión:</span>
                  <span className="text-green-600">
                    ${(
                      (formData.has_invoice ? parseFloat(formData.amount_without_iva || '0') : parseFloat(formData.amount_with_iva || '0'))
                    ).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                  </span>
                </div>
                <p className="text-xs text-secondary-600">
                  {formData.has_invoice ? (
                    'Con factura: la comisión se calcula sobre el monto sin IVA (base fiscal)'
                  ) : (
                    'Sin factura: la comisión se calcula sobre el monto total pagado'
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Mercado Libre Section */}
          <div className="border-t pt-6">
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                name="is_mercado_libre_sale"
                id="is_mercado_libre_sale"
                checked={formData.is_mercado_libre_sale}
                onChange={handleInputChange}
                className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <label htmlFor="is_mercado_libre_sale" className="ml-2 text-sm font-semibold text-secondary-900">
                ¿Es una venta de Mercado Libre?
              </label>
            </div>
            
            {formData.is_mercado_libre_sale && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-4">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h4 className="text-sm font-semibold text-blue-800">Comisiones de Mercado Libre</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Ingrese las comisiones que Mercado Libre descontó de esta venta. La comisión se calculará sobre el monto neto.
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="ml_fee_cargos_venta" className="block text-sm font-medium text-blue-800 mb-1">
                      Cargos por Venta (MXN)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-500">$</span>
                      <input
                        type="number"
                        name="ml_fee_cargos_venta"
                        id="ml_fee_cargos_venta"
                        min="0"
                        step="0.01"
                        className="input w-full pl-8"
                        value={formData.ml_fee_cargos_venta}
                        onChange={handleInputChange}
                        placeholder="194.40"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="ml_fee_envios" className="block text-sm font-medium text-blue-800 mb-1">
                      Envíos (MXN)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-500">$</span>
                      <input
                        type="number"
                        name="ml_fee_envios"
                        id="ml_fee_envios"
                        min="0"
                        step="0.01"
                        className="input w-full pl-8"
                        value={formData.ml_fee_envios}
                        onChange={handleInputChange}
                        placeholder="228.00"
                      />
                    </div>
                  </div>
                </div>
                
                {(formData.ml_fee_cargos_venta || formData.ml_fee_envios) && (formData.amount_with_iva || formData.amount_without_iva) && (
                  <div className="bg-white border border-blue-200 rounded p-3">
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span className="text-blue-700">
                          Monto total con IVA (base ML):
                        </span>
                        <span className="font-medium">
                          ${parseFloat(formData.amount_with_iva || '0').toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">Cargos por venta ML:</span>
                        <span className="text-red-600">-${parseFloat(formData.ml_fee_cargos_venta || '0').toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">Envíos ML:</span>
                        <span className="text-red-600">-${parseFloat(formData.ml_fee_envios || '0').toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN</span>
                      </div>
                      <div className="flex justify-between border-t pt-1">
                        <span className="text-blue-800">Subtotal después de fees ML:</span>
                        <span className="font-medium">
                          ${(
                            parseFloat(formData.amount_with_iva || '0') - 
                            parseFloat(formData.ml_fee_cargos_venta || '0') - 
                            parseFloat(formData.ml_fee_envios || '0')
                          ).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                        </span>
                      </div>
                      {formData.has_invoice && (
                        <div className="flex justify-between">
                          <span className="text-blue-700">Menos IVA (16%):</span>
                          <span className="text-red-600">
                            -${(
                              (parseFloat(formData.amount_with_iva || '0') - 
                              parseFloat(formData.ml_fee_cargos_venta || '0') - 
                              parseFloat(formData.ml_fee_envios || '0')) * 0.16
                            ).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between border-t pt-1 font-semibold">
                        <span className="text-blue-800">Base final para comisión:</span>
                        <span className="text-green-600">
                          ${(
                            formData.has_invoice ? 
                              (parseFloat(formData.amount_with_iva || '0') - 
                              parseFloat(formData.ml_fee_cargos_venta || '0') - 
                              parseFloat(formData.ml_fee_envios || '0')) * 0.84 :
                              (parseFloat(formData.amount_with_iva || '0') - 
                              parseFloat(formData.ml_fee_cargos_venta || '0') - 
                              parseFloat(formData.ml_fee_envios || '0'))
                          ).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                        </span>
                      </div>
                      <div className="text-xs text-blue-600 mt-2 italic">
                        {formData.has_invoice 
                          ? '*ML: Total - fees ML - IVA = Base comisión'
                          : '*ML: Total - fees ML = Base comisión'
                        }
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <label htmlFor="document_pdf" className="block text-sm font-semibold text-secondary-900 mb-2">
              {formData.has_invoice ? 'Factura' : 'Orden de Compra'} PDF *
            </label>
            <input
              type="file"
              name="document_pdf"
              id="document_pdf"
              accept=".pdf"
              required
              className="input w-full"
              onChange={handleFileChange}
            />
            <p className="mt-2 text-xs text-secondary-500">
              Suba el archivo PDF del documento (máximo 10MB). El sistema validará automáticamente el monto.
            </p>
            {file && (
              <p className="mt-2 text-sm text-primary-600 font-medium">
                ✓ Seleccionado: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary"
            >
              {isSubmitting ? 'Enviando...' : 'Enviar Solicitud'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubmissionForm;