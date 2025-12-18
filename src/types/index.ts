export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'salesperson' | 'manager';
  commission_rate?: number;
  employee_id?: string;
  is_active: boolean;
  is_approved: boolean;
  created_at: string;
}

export interface CommissionSubmission {
  id: string;
  salesperson_id: string;
  document_type: 'factura' | 'orden_compra';
  invoice_number: string;
  purchase_order_number?: string;
  invoice_date: string;
  client_payment_date: string;
  payment_days: number;
  commission_percentage: number;
  client_name: string;
  invoice_amount?: number;
  submitted_amount: number;
  amount_with_iva: number;        // Amount including IVA
  amount_without_iva: number;     // Amount excluding IVA  
  client_requires_invoice: boolean; // Determines which amount to use for commission
  
  // Mercado Libre specific fields
  is_mercado_libre_sale: boolean;
  ml_fee_cargos_venta?: number;  // Cargos por venta
  ml_fee_envios?: number;        // Envíos
  ml_total_fees?: number;        // Total fees (calculated)
  net_amount_after_ml?: number;  // Amount after ML fees (base for commission)
  
  commission_rate: number;
  commission_amount: number;
  base_commission_amount?: number;
  status: 'pending' | 'under_review' | 'flagged' | 'approved' | 'rejected' | 'paid';
  invoice_pdf_path: string;
  payout_receipt_path?: string | null;
  notes?: string | null;
  rejection_reason?: string | null;
  created_at: string;
  updated_at: string;
  reviewed_at?: string | null;
  paid_at?: string | null;
}

export interface SubmissionFilters {
  salesperson_id?: string;
  status?: CommissionSubmission['status'];
  start_date?: string;
  end_date?: string;
  client_name?: string;
  invoice_number?: string;
}

export interface Analytics {
  total_commissions: number;
  pending_amount: number;
  paid_amount: number;
  submission_count: number;
  average_commission: number;
}