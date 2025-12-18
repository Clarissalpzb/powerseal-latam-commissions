import { CommissionSubmission } from '@/types';

// Generate sample submissions for testing analytics
export const generateSampleSubmissions = (): CommissionSubmission[] => {
  const statuses: CommissionSubmission['status'][] = ['pending', 'under_review', 'approved', 'rejected', 'paid', 'flagged'];
  const clients = ['ABC Corporation', 'XYZ Industries', 'Tech Solutions Ltd', 'Global Trading Co', 'Innovation Partners'];
  const salespeople = ['user-1', 'user-2', 'user-3'];
  
  const submissions: CommissionSubmission[] = [];
  const now = new Date();
  
  // Generate submissions for the past 6 months
  for (let monthOffset = 5; monthOffset >= 0; monthOffset--) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1);
    const submissionsInMonth = Math.floor(Math.random() * 10) + 5; // 5-15 submissions per month
    
    for (let i = 0; i < submissionsInMonth; i++) {
      const created = new Date(monthDate);
      created.setDate(Math.floor(Math.random() * 28) + 1); // Random day in month
      
      const amount = Math.floor(Math.random() * 50000) + 10000; // 10k-60k
      const commissionRate = Math.random() * 0.05 + 0.02; // 2-7%
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const isInvoiced = Math.random() > 0.3;
      
      const submission: CommissionSubmission = {
        id: `sub-${created.getTime()}-${i}`,
        salesperson_id: salespeople[Math.floor(Math.random() * salespeople.length)],
        document_type: Math.random() > 0.5 ? 'factura' : 'orden_compra',
        invoice_number: `INV-${created.getFullYear()}${String(created.getMonth() + 1).padStart(2, '0')}-${String(i + 1).padStart(4, '0')}`,
        purchase_order_number: `PO-${created.getFullYear()}-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`,
        invoice_date: created.toISOString(),
        client_payment_date: new Date(created.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days later
        payment_days: 30,
        commission_percentage: commissionRate * 100,
        client_name: clients[Math.floor(Math.random() * clients.length)],
        submitted_amount: amount,
        amount_with_iva: amount * 1.16,
        amount_without_iva: amount,
        client_requires_invoice: isInvoiced,
        is_mercado_libre_sale: Math.random() > 0.8,
        commission_rate: commissionRate,
        commission_amount: amount * commissionRate,
        status: status,
        invoice_pdf_path: `/invoices/${created.getFullYear()}/${created.getMonth() + 1}/invoice-${i}.pdf`,
        created_at: created.toISOString(),
        updated_at: created.toISOString(),
        reviewed_at: ['approved', 'rejected', 'paid'].includes(status) ? new Date(created.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString() : undefined,
        paid_at: status === 'paid' ? new Date(created.getTime() + 35 * 24 * 60 * 60 * 1000).toISOString() : undefined,
      };
      
      submissions.push(submission);
    }
  }
  
  return submissions.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
};

// Initialize sample data if none exists
export const initializeSampleData = () => {
  const existingData = localStorage.getItem('commissionhub_submissions');
  if (!existingData || JSON.parse(existingData).length === 0) {
    const sampleData = generateSampleSubmissions();
    localStorage.setItem('commissionhub_submissions', JSON.stringify(sampleData));
    console.log(`Initialized ${sampleData.length} sample submissions`);
    return true;
  }
  return false;
};