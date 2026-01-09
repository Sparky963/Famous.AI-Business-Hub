import React, { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { IncomeEntry, DEFAULT_CATEGORIES } from '@/types';
import { DollarIcon, CalendarIcon } from '@/components/icons/Icons';

interface IncomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (income: Partial<IncomeEntry>) => Promise<void>;
  income?: IncomeEntry;
}

const IncomeModal: React.FC<IncomeModalProps> = ({ isOpen, onClose, onSave, income }) => {
  const [formData, setFormData] = useState({
    source_name: income?.source_name || '',
    description: income?.description || '',
    amount: income?.amount || 0,
    currency: income?.currency || 'USD',
    income_date: income?.income_date || new Date().toISOString().split('T')[0],
    category_id: income?.category_id || 'cat-12',
    is_recurring: income?.is_recurring || false,
    notes: income?.notes || '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const incomeCategories = DEFAULT_CATEGORIES
    .filter(c => c.type === 'income')
    .map((c, idx) => ({
      value: `cat-${12 + idx}`,
      label: c.name,
    }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.source_name.trim()) {
      setError('Source name is required');
      return;
    }
    if (formData.amount <= 0) {
      setError('Amount must be greater than 0');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await onSave(formData);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={income ? 'Edit Income' : 'Add Income'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Source Name"
          value={formData.source_name}
          onChange={(e) => setFormData({ ...formData, source_name: e.target.value })}
          placeholder="e.g., Client Name, Salary, etc."
          required
        />

        <Input
          label="Description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Brief description..."
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Amount"
            type="number"
            step="0.01"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
            icon={<DollarIcon size={18} />}
            required
          />
          <Select
            label="Currency"
            value={formData.currency}
            options={[
              { value: 'USD', label: 'USD' },
              { value: 'EUR', label: 'EUR' },
              { value: 'GBP', label: 'GBP' },
              { value: 'CAD', label: 'CAD' },
            ]}
            onChange={(value) => setFormData({ ...formData, currency: value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Date"
            type="date"
            value={formData.income_date}
            onChange={(e) => setFormData({ ...formData, income_date: e.target.value })}
            icon={<CalendarIcon size={18} />}
            required
          />
          <Select
            label="Category"
            value={formData.category_id}
            options={incomeCategories}
            onChange={(value) => setFormData({ ...formData, category_id: value })}
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setFormData({ ...formData, is_recurring: !formData.is_recurring })}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              formData.is_recurring ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'
            }`}
          >
            <span 
              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                formData.is_recurring ? 'translate-x-6' : ''
              }`}
            />
          </button>
          <span className="text-sm text-slate-700 dark:text-slate-300">
            Recurring income
          </span>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Notes
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500"
            placeholder="Additional notes..."
          />
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" variant="secondary" loading={isSaving} className="flex-1">
            {income ? 'Update Income' : 'Add Income'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default IncomeModal;
