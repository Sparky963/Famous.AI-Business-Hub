import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { useApp } from '@/contexts/AppContext';
import { LoadingSpinner, PlusIcon, TrashIcon } from '@/components/icons/Icons';
import { LineItem } from '@/types';

export const AddInvoiceModal: React.FC = () => {
  const { 
    showAddInvoiceModal, 
    setShowAddInvoiceModal, 
    addInvoice,
    updateInvoice,
    selectedInvoice,
    setSelectedInvoice,
    clients
  } = useApp();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    invoice_type: 'invoice' as 'invoice' | 'quote' | 'receipt',
    client_id: '',
    issue_date: new Date().toISOString().split('T')[0],
    due_date: '',
    notes: '',
    terms: 'A non-refundable retainer of $250 is required to secure your date.\nRemaining balance due 14 days before event.\nPlease be advised that personal and business checks are not accepted under any circumstances.\nPayment Methods: Cash | Zelle | Venmo | Cash App | PayPal.'
  });
  
  const [lineItems, setLineItems] = useState<LineItem[]>([]);

  useEffect(() => {
    if (selectedInvoice) {
      setFormData({
        invoice_type: selectedInvoice.invoice_type,
        client_id: selectedInvoice.client_id || '',
        issue_date: selectedInvoice.issue_date,
        due_date: selectedInvoice.due_date || '',
        notes: selectedInvoice.notes || '',
        terms: selectedInvoice.terms || ''
      });
      setLineItems(selectedInvoice.line_items || []);
    } else {
      resetForm();
    }
  }, [selectedInvoice]);

  const resetForm = () => {
    setFormData({
      invoice_type: 'invoice',
      client_id: '',
      issue_date: new Date().toISOString().split('T')[0],
      due_date: '',
      notes: '',
      terms: 'A non-refundable retainer of $250 is required to secure your date.\nRemaining balance due 14 days before event.\nPlease be advised that personal and business checks are not accepted under any circumstances.\nPayment Methods: Cash | Zelle | Venmo | Cash App | PayPal.'
    });
    setLineItems([]);
  };

  const generateInvoiceNumber = () => {
    const date = new Date();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    const suffix = formData.invoice_type === 'quote' ? 'Q' : formData.invoice_type === 'receipt' ? 'R' : 'INV';
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${month}-${day}-${year}-${suffix}-${random}`;
  };

  const addLineItem = () => {
    setLineItems([...lineItems, { name: '', description: '', quantity: 1, rate: 0, amount: 0 }]);
  };

  const updateLineItem = (index: number, field: keyof LineItem, value: any) => {
    const updated = [...lineItems];
    updated[index] = { ...updated[index], [field]: value };
    if (field === 'quantity' || field === 'rate') {
      updated[index].amount = updated[index].quantity * updated[index].rate;
    }
    setLineItems(updated);
  };

  const removeLineItem = (index: number) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
  const total = subtotal;

  // Auto-populate from client services
  const handleClientChange = (clientId: string) => {
    setFormData({ ...formData, client_id: clientId });
    const client = clients.find(c => c.id === clientId);
    if (client && client.services_booked && client.services_booked.length > 0) {
      setLineItems(client.services_booked.map(s => ({
        name: s.name,
        description: s.description || '',
        quantity: s.quantity,
        rate: s.rate,
        amount: s.amount
      })));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const invoiceData = {
      invoice_number: selectedInvoice?.invoice_number || generateInvoiceNumber(),
      invoice_type: formData.invoice_type,
      client_id: formData.client_id || undefined,
      issue_date: formData.issue_date,
      due_date: formData.due_date || undefined,
      line_items: lineItems,
      subtotal,
      tax_rate: 0,
      tax_amount: 0,
      total,
      amount_paid: selectedInvoice?.amount_paid || 0,
      balance_due: total - (selectedInvoice?.amount_paid || 0),
      notes: formData.notes,
      terms: formData.terms,
      status: (selectedInvoice?.status || 'pending') as any,
      payment_methods: ['Cash', 'Zelle', 'Venmo', 'Cash App', 'PayPal']
    };
    
    if (selectedInvoice) {
      await updateInvoice(selectedInvoice.id, invoiceData);
    } else {
      await addInvoice(invoiceData);
    }
    
    setLoading(false);
    handleClose();
  };

  const handleClose = () => {
    setShowAddInvoiceModal(false);
    setSelectedInvoice(null);
    resetForm();
  };

  return (
    <Modal
      isOpen={showAddInvoiceModal}
      onClose={handleClose}
      title={selectedInvoice ? `Edit ${formData.invoice_type.charAt(0).toUpperCase() + formData.invoice_type.slice(1)}` : 'Create Invoice/Quote'}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Type</label>
            <select
              value={formData.invoice_type}
              onChange={(e) => setFormData({ ...formData, invoice_type: e.target.value as any })}
              className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
            >
              <option value="invoice">Invoice</option>
              <option value="quote">Quote</option>
              <option value="receipt">Payment Receipt</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Issue Date</label>
            <input
              type="date"
              value={formData.issue_date}
              onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Due Date</label>
            <input
              type="date"
              value={formData.due_date}
              onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Client</label>
          <select
            value={formData.client_id}
            onChange={(e) => handleClientChange(e.target.value)}
            className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
          >
            <option value="">Select client</option>
            {clients.map(client => (
              <option key={client.id} value={client.id}>{client.name}</option>
            ))}
          </select>
        </div>
        
        {/* Line Items */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-white">Line Items</h3>
            <button
              type="button"
              onClick={addLineItem}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <PlusIcon size={16} />
              Add Item
            </button>
          </div>
          
          {lineItems.length > 0 ? (
            <div className="space-y-3">
              <div className="grid grid-cols-12 gap-3 text-sm text-gray-400 px-4">
                <div className="col-span-5">Service</div>
                <div className="col-span-2">Qty</div>
                <div className="col-span-2">Rate</div>
                <div className="col-span-2">Amount</div>
                <div className="col-span-1"></div>
              </div>
              
              {lineItems.map((item, index) => (
                <div key={index} className="p-4 bg-gray-800 rounded-lg">
                  <div className="grid grid-cols-12 gap-3 items-start">
                    <div className="col-span-12 md:col-span-5">
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => updateLineItem(index, 'name', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm mb-2"
                        placeholder="Service name"
                      />
                      <textarea
                        value={item.description}
                        onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
                        placeholder="Description (optional)"
                        rows={2}
                      />
                    </div>
                    <div className="col-span-4 md:col-span-2">
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateLineItem(index, 'quantity', parseInt(e.target.value) || 1)}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
                        min="1"
                      />
                    </div>
                    <div className="col-span-4 md:col-span-2">
                      <div className="relative">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                        <input
                          type="number"
                          value={item.rate}
                          onChange={(e) => updateLineItem(index, 'rate', parseFloat(e.target.value) || 0)}
                          className="w-full pl-6 pr-2 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
                          step="0.01"
                        />
                      </div>
                    </div>
                    <div className="col-span-3 md:col-span-2 flex items-center">
                      <span className="text-white font-medium">${item.amount.toFixed(2)}</span>
                    </div>
                    <div className="col-span-1 flex items-center justify-end">
                      <button
                        type="button"
                        onClick={() => removeLineItem(index)}
                        className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-colors"
                      >
                        <TrashIcon size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="flex justify-end p-4 bg-purple-500/20 rounded-lg">
                <div className="text-right">
                  <div className="text-gray-400 text-sm">Subtotal: ${subtotal.toFixed(2)}</div>
                  <div className="text-xl font-bold text-white mt-1">Total: ${total.toFixed(2)}</div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-400 text-center py-4">No line items added yet</p>
          )}
        </div>
        
        {/* Notes & Terms */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
              rows={4}
              placeholder="Additional notes for the client..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Terms & Conditions</label>
            <textarea
              value={formData.terms}
              onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
              rows={4}
            />
          </div>
        </div>
        
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
          <button
            type="button"
            onClick={handleClose}
            className="px-6 py-2.5 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {loading && <LoadingSpinner size={18} />}
            {selectedInvoice ? 'Update' : 'Create'} {formData.invoice_type.charAt(0).toUpperCase() + formData.invoice_type.slice(1)}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddInvoiceModal;
