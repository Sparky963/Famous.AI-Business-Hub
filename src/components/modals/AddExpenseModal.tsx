import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { useApp } from '@/contexts/AppContext';
import { LoadingSpinner } from '@/components/icons/Icons';

export const AddExpenseModal: React.FC = () => {
  const { 
    showAddExpenseModal, 
    setShowAddExpenseModal, 
    addExpense, 
    categories,
    clients 
  } = useApp();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    merchant_name: '',
    transaction_date: new Date().toISOString().split('T')[0],
    category_name: '',
    total_amount: '',
    tax_amount: '',
    payment_method: 'credit',
    client_id: '',
    notes: '',
    is_tax_deductible: true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const category = categories.find(c => c.name === formData.category_name);
    
    await addExpense({
      merchant_name: formData.merchant_name,
      transaction_date: formData.transaction_date,
      category_name: formData.category_name,
      category_id: category?.id,
      total_amount: parseFloat(formData.total_amount) || 0,
      tax_amount: parseFloat(formData.tax_amount) || 0,
      payment_method: formData.payment_method,
      client_id: formData.client_id || undefined,
      notes: formData.notes,
      is_tax_deductible: formData.is_tax_deductible,
      is_business: true,
      currency: 'USD',
      country: 'US',
      receipt_type: 'receipt',
      review_status: 'approved',
      line_items: []
    });
    
    setLoading(false);
    setShowAddExpenseModal(false);
    setFormData({
      merchant_name: '',
      transaction_date: new Date().toISOString().split('T')[0],
      category_name: '',
      total_amount: '',
      tax_amount: '',
      payment_method: 'credit',
      client_id: '',
      notes: '',
      is_tax_deductible: true
    });
  };

  return (
    <Modal
      isOpen={showAddExpenseModal}
      onClose={() => setShowAddExpenseModal(false)}
      title="Add Expense"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Merchant/Vendor</label>
            <input
              type="text"
              value={formData.merchant_name}
              onChange={(e) => setFormData({ ...formData, merchant_name: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="e.g., Office Depot"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Date</label>
            <input
              type="date"
              value={formData.transaction_date}
              onChange={(e) => setFormData({ ...formData, transaction_date: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Category</label>
            <select
              value={formData.category_name}
              onChange={(e) => setFormData({ ...formData, category_name: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            >
              <option value="">Select category</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
              <input
                type="number"
                step="0.01"
                value={formData.total_amount}
                onChange={(e) => setFormData({ ...formData, total_amount: e.target.value })}
                className="w-full pl-8 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="0.00"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Tax Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
              <input
                type="number"
                step="0.01"
                value={formData.tax_amount}
                onChange={(e) => setFormData({ ...formData, tax_amount: e.target.value })}
                className="w-full pl-8 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Payment Method</label>
            <select
              value={formData.payment_method}
              onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="credit">Credit Card</option>
              <option value="debit">Debit Card</option>
              <option value="cash">Cash</option>
              <option value="check">Check</option>
              <option value="zelle">Zelle</option>
              <option value="venmo">Venmo</option>
              <option value="cashapp">Cash App</option>
              <option value="paypal">PayPal</option>
              <option value="transfer">Bank Transfer</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Link to Client (Optional)</label>
            <select
              value={formData.client_id}
              onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">No client</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>{client.name}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center gap-2 pt-6">
            <input
              type="checkbox"
              id="tax_deductible"
              checked={formData.is_tax_deductible}
              onChange={(e) => setFormData({ ...formData, is_tax_deductible: e.target.checked })}
              className="w-4 h-4 rounded border-gray-700 bg-gray-800 text-purple-500 focus:ring-purple-500"
            />
            <label htmlFor="tax_deductible" className="text-sm text-gray-300">Tax Deductible</label>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Notes</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            rows={3}
            placeholder="Additional notes..."
          />
        </div>
        
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => setShowAddExpenseModal(false)}
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
            Add Expense
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddExpenseModal;
