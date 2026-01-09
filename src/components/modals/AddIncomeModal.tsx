import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { useApp } from '@/contexts/AppContext';
import { LoadingSpinner } from '@/components/icons/Icons';

export const AddIncomeModal: React.FC = () => {
  const { 
    showAddIncomeModal, 
    setShowAddIncomeModal, 
    addIncome, 
    clients,
    invoices 
  } = useApp();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    income_date: new Date().toISOString().split('T')[0],
    category: 'Service',
    client_id: '',
    invoice_id: '',
    payment_method: 'zelle',
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    await addIncome({
      description: formData.description,
      amount: parseFloat(formData.amount) || 0,
      income_date: formData.income_date,
      category: formData.category,
      client_id: formData.client_id || undefined,
      invoice_id: formData.invoice_id || undefined,
      payment_method: formData.payment_method,
      notes: formData.notes
    });
    
    setLoading(false);
    setShowAddIncomeModal(false);
    setFormData({
      description: '',
      amount: '',
      income_date: new Date().toISOString().split('T')[0],
      category: 'Service',
      client_id: '',
      invoice_id: '',
      payment_method: 'zelle',
      notes: ''
    });
  };

  const clientInvoices = formData.client_id 
    ? invoices.filter(i => i.client_id === formData.client_id)
    : invoices;

  return (
    <Modal
      isOpen={showAddIncomeModal}
      onClose={() => setShowAddIncomeModal(false)}
      title="Add Income"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="e.g., Wedding DJ Package"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full pl-8 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="0.00"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Date</label>
            <input
              type="date"
              value={formData.income_date}
              onChange={(e) => setFormData({ ...formData, income_date: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="Service">Service</option>
              <option value="Product">Product</option>
              <option value="Retainer">Retainer</option>
              <option value="Deposit">Deposit</option>
              <option value="Final Payment">Final Payment</option>
              <option value="Tip">Tip</option>
              <option value="Other">Other</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Payment Method</label>
            <select
              value={formData.payment_method}
              onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="zelle">Zelle</option>
              <option value="venmo">Venmo</option>
              <option value="cashapp">Cash App</option>
              <option value="paypal">PayPal</option>
              <option value="cash">Cash</option>
              <option value="check">Check</option>
              <option value="credit">Credit Card</option>
              <option value="transfer">Bank Transfer</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Client (Optional)</label>
            <select
              value={formData.client_id}
              onChange={(e) => setFormData({ ...formData, client_id: e.target.value, invoice_id: '' })}
              className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">No client</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>{client.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Invoice (Optional)</label>
            <select
              value={formData.invoice_id}
              onChange={(e) => setFormData({ ...formData, invoice_id: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">No invoice</option>
              {clientInvoices.map(invoice => (
                <option key={invoice.id} value={invoice.id}>
                  {invoice.invoice_number} - ${invoice.total.toFixed(2)}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Notes</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
            rows={3}
            placeholder="Additional notes..."
          />
        </div>
        
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => setShowAddIncomeModal(false)}
            className="px-6 py-2.5 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {loading && <LoadingSpinner size={18} />}
            Add Income
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddIncomeModal;
