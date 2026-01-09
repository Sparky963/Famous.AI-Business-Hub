import React, { useState, useMemo, useRef } from 'react';
import { useApp } from '@/contexts/AppContext';
import {
  SearchIcon,
  PlusIcon,
  EditIcon,
  TrashIcon,
  EyeIcon,
  PrintIcon,
  SendIcon,
  DownloadIcon,
  DollarIcon
} from '@/components/icons/Icons';
import { Invoice, Client } from '@/types';

export const InvoicesView: React.FC = () => {
  const {
    invoices,
    clients,
    businessProfile,
    deleteInvoice,
    addPayment,
    setShowAddInvoiceModal,
    setSelectedInvoice
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('zelle');
  const printRef = useRef<HTMLDivElement>(null);

  const filteredInvoices = useMemo(() => {
    return invoices.filter(invoice => {
      const client = clients.find(c => c.id === invoice.client_id);
      const matchesSearch = 
        invoice.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client?.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesType = typeFilter === 'all' || invoice.invoice_type === typeFilter;
      const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
      
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [invoices, clients, searchQuery, typeFilter, statusFilter]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-500/20 text-green-400';
      case 'partial': return 'bg-yellow-500/20 text-yellow-400';
      case 'overdue': return 'bg-red-500/20 text-red-400';
      case 'cancelled': return 'bg-gray-500/20 text-gray-400';
      default: return 'bg-blue-500/20 text-blue-400';
    }
  };

  const handleEdit = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowAddInvoiceModal(true);
  };

  const handleDelete = async (invoice: Invoice) => {
    if (confirm('Are you sure you want to delete this invoice?')) {
      await deleteInvoice(invoice.id);
      if (previewInvoice?.id === invoice.id) {
        setPreviewInvoice(null);
      }
    }
  };

  const handleRecordPayment = async () => {
    if (!previewInvoice || !paymentAmount) return;
    
    await addPayment({
      invoice_id: previewInvoice.id,
      client_id: previewInvoice.client_id,
      amount: parseFloat(paymentAmount),
      payment_date: new Date().toISOString().split('T')[0],
      payment_method: paymentMethod
    });
    
    setShowPaymentModal(false);
    setPaymentAmount('');
    setPreviewInvoice(null);
  };

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice ${previewInvoice?.invoice_number}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 40px; }
            .invoice-header { background: linear-gradient(135deg, #7C3AED 0%, #9333EA 100%); color: white; padding: 30px; margin: -40px -40px 30px; }
            .invoice-title { font-size: 32px; font-weight: bold; margin-bottom: 10px; }
            .invoice-meta { display: flex; justify-content: space-between; margin-top: 20px; }
            .invoice-meta div { }
            .invoice-meta p { margin: 5px 0; }
            .invoice-body { padding: 20px 0; }
            .line-items { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .line-items th { background: #7C3AED; color: white; padding: 12px; text-align: left; }
            .line-items td { padding: 12px; border-bottom: 1px solid #eee; }
            .line-items .amount { text-align: right; }
            .totals { text-align: right; margin-top: 20px; }
            .totals .total { font-size: 24px; font-weight: bold; }
            .notes { margin-top: 30px; padding: 20px; background: #f9f9f9; border-radius: 8px; }
            .footer { margin-top: 40px; text-align: center; color: #666; }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const getClient = (clientId?: string): Client | undefined => {
    return clients.find(c => c.id === clientId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Invoices & Quotes</h1>
          <p className="text-gray-400">{invoices.length} total documents</p>
        </div>
        
        <button
          onClick={() => {
            setSelectedInvoice(null);
            setShowAddInvoiceModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all"
        >
          <PlusIcon size={20} />
          Create Invoice
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search invoices..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
          />
        </div>
        
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
        >
          <option value="all">All Types</option>
          <option value="invoice">Invoice</option>
          <option value="quote">Quote</option>
          <option value="receipt">Receipt</option>
        </select>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="pending">Pending</option>
          <option value="partial">Partial</option>
          <option value="paid">Paid</option>
          <option value="overdue">Overdue</option>
        </select>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Invoice List */}
        <div className="space-y-4">
          {filteredInvoices.length > 0 ? (
            filteredInvoices.map(invoice => {
              const client = getClient(invoice.client_id);
              return (
                <div
                  key={invoice.id}
                  className={`p-5 bg-gray-800/50 border rounded-xl transition-all cursor-pointer ${
                    previewInvoice?.id === invoice.id
                      ? 'border-purple-500'
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                  onClick={() => setPreviewInvoice(invoice)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 uppercase">{invoice.invoice_type}</span>
                        <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusColor(invoice.status)}`}>
                          {invoice.status}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-white mt-1">{invoice.invoice_number}</h3>
                      {client && <p className="text-sm text-gray-400">{client.name}</p>}
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-white">{formatCurrency(invoice.total)}</p>
                      {invoice.balance_due > 0 && invoice.status !== 'paid' && (
                        <p className="text-sm text-red-400">Due: {formatCurrency(invoice.balance_due)}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <span>Issued: {formatDate(invoice.issue_date)}</span>
                    {invoice.due_date && <span>Due: {formatDate(invoice.due_date)}</span>}
                  </div>
                  
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-700">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleEdit(invoice); }}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <EditIcon size={14} />
                      Edit
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setPreviewInvoice(invoice); }}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <EyeIcon size={14} />
                      Preview
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(invoice); }}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-colors ml-auto"
                    >
                      <TrashIcon size={14} />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 bg-gray-800/50 border border-gray-700 rounded-xl">
              <InvoiceIcon className="mx-auto text-gray-600 mb-4" size={48} />
              <p className="text-gray-400">No invoices found</p>
              <button
                onClick={() => setShowAddInvoiceModal(true)}
                className="mt-4 text-purple-400 hover:text-purple-300"
              >
                Create your first invoice
              </button>
            </div>
          )}
        </div>

        {/* Invoice Preview */}
        {previewInvoice && (
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden sticky top-4">
            {/* Preview Actions */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h3 className="text-lg font-semibold text-white">Preview</h3>
              <div className="flex items-center gap-2">
                {previewInvoice.status !== 'paid' && (
                  <button
                    onClick={() => setShowPaymentModal(true)}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <DollarIcon size={14} />
                    Record Payment
                  </button>
                )}
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <PrintIcon size={14} />
                  Print
                </button>
              </div>
            </div>
            
            {/* Invoice Document */}
            <div ref={printRef} className="bg-white text-gray-900 max-h-[70vh] overflow-auto">
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-3xl font-bold uppercase">{previewInvoice.invoice_type}</h1>
                    <p className="mt-2">{previewInvoice.invoice_type === 'quote' ? 'Quote' : 'Invoice'} # {previewInvoice.invoice_number}</p>
                    <p>Date: {formatDate(previewInvoice.issue_date)}</p>
                  </div>
                  <div className="text-right">
                    {/* Logo placeholder */}
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold">
                      WS
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-8 mt-6">
                  <div>
                    <p className="text-purple-200 text-sm">Issued By</p>
                    <p className="font-bold">{businessProfile?.business_name}</p>
                    <p className="text-sm">{businessProfile?.address}</p>
                    <p className="text-sm">{businessProfile?.city}, {businessProfile?.state} {businessProfile?.zip}</p>
                  </div>
                  {getClient(previewInvoice.client_id) && (
                    <div>
                      <p className="text-purple-200 text-sm">Issued To</p>
                      <p className="font-bold">{getClient(previewInvoice.client_id)?.name}</p>
                      <p className="text-sm">{getClient(previewInvoice.client_id)?.email}</p>
                      <p className="text-sm">{getClient(previewInvoice.client_id)?.phone}</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Line Items */}
              <div className="p-6">
                <table className="w-full">
                  <thead>
                    <tr className="bg-purple-600 text-white">
                      <th className="px-4 py-3 text-left">Service</th>
                      <th className="px-4 py-3 text-center">Qty</th>
                      <th className="px-4 py-3 text-right">Rate</th>
                      <th className="px-4 py-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewInvoice.line_items.map((item, idx) => (
                      <tr key={idx} className="border-b border-gray-200">
                        <td className="px-4 py-4">
                          <p className="font-medium">{item.name}</p>
                          {item.description && (
                            <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                          )}
                        </td>
                        <td className="px-4 py-4 text-center">{item.quantity}</td>
                        <td className="px-4 py-4 text-right">{formatCurrency(item.rate)}</td>
                        <td className="px-4 py-4 text-right font-medium">{formatCurrency(item.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {/* Totals */}
                <div className="flex justify-end mt-6">
                  <div className="w-64">
                    <div className="flex justify-between py-2 border-b">
                      <span>Subtotal</span>
                      <span>{formatCurrency(previewInvoice.subtotal)}</span>
                    </div>
                    {previewInvoice.tax_amount > 0 && (
                      <div className="flex justify-between py-2 border-b">
                        <span>Tax ({previewInvoice.tax_rate}%)</span>
                        <span>{formatCurrency(previewInvoice.tax_amount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between py-3 text-xl font-bold">
                      <span>Total</span>
                      <span>{formatCurrency(previewInvoice.total)}</span>
                    </div>
                    {previewInvoice.amount_paid > 0 && (
                      <>
                        <div className="flex justify-between py-2 text-green-600">
                          <span>Paid</span>
                          <span>-{formatCurrency(previewInvoice.amount_paid)}</span>
                        </div>
                        <div className="flex justify-between py-2 text-red-600 font-bold">
                          <span>Balance Due</span>
                          <span>{formatCurrency(previewInvoice.balance_due)}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                
                {/* Status Badge */}
                {previewInvoice.status === 'paid' && (
                  <div className="mt-6 text-center">
                    <span className="inline-block px-8 py-2 text-2xl font-bold text-red-500 border-4 border-red-500 rounded-lg transform -rotate-12">
                      PAID IN FULL
                    </span>
                  </div>
                )}
                
                {/* Terms */}
                {previewInvoice.terms && (
                  <div className="mt-6 p-4 bg-purple-50 rounded-lg">
                    <p className="text-sm font-medium text-purple-800 mb-2">Notes</p>
                    <p className="text-sm text-gray-600 whitespace-pre-line">{previewInvoice.terms}</p>
                  </div>
                )}
                
                {/* Footer */}
                <div className="mt-8 text-center text-gray-500 text-sm">
                  <p>{businessProfile?.website}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {showPaymentModal && previewInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setShowPaymentModal(false)} />
          <div className="relative w-full max-w-md bg-gray-900 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Record Payment</h3>
            <p className="text-gray-400 mb-4">
              Invoice: {previewInvoice.invoice_number}<br />
              Balance Due: {formatCurrency(previewInvoice.balance_due)}
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Amount</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    placeholder={previewInvoice.balance_due.toString()}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white"
                >
                  <option value="zelle">Zelle</option>
                  <option value="venmo">Venmo</option>
                  <option value="cashapp">Cash App</option>
                  <option value="paypal">PayPal</option>
                  <option value="cash">Cash</option>
                  <option value="check">Check</option>
                  <option value="transfer">Bank Transfer</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="px-4 py-2 text-gray-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleRecordPayment}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Record Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const InvoiceIcon: React.FC<{ className?: string; size?: number }> = ({ className = '', size = 24 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
  </svg>
);

export default InvoicesView;
