import React, { useState } from 'react';
import { Receipt, Category, DEFAULT_CATEGORIES } from '@/types';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { EditIcon, TrashIcon, CheckIcon, XIcon, TagIcon } from '@/components/icons/Icons';

interface ReceiptDetailProps {
  receipt: Receipt;
  onUpdate: (updates: Partial<Receipt>) => Promise<void>;
  onDelete: () => Promise<void>;
  onClose: () => void;
}

const ReceiptDetail: React.FC<ReceiptDetailProps> = ({ receipt, onUpdate, onDelete, onClose }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editData, setEditData] = useState({
    merchant_name: receipt.merchant_name || '',
    transaction_date: receipt.transaction_date || '',
    total_amount: receipt.total_amount,
    tax_amount: receipt.tax_amount || 0,
    currency: receipt.currency,
    payment_method: receipt.payment_method || '',
    category_id: receipt.category_id || '',
    notes: receipt.notes || '',
    review_status: receipt.review_status,
    is_business: receipt.is_business,
  });
  const [newTag, setNewTag] = useState('');
  const [tags, setTags] = useState<string[]>(receipt.tags || []);

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onUpdate({
        ...editData,
        tags,
      });
      setIsEditing(false);
    } catch (err) {
      console.error('Error saving:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this receipt?')) return;
    
    setIsDeleting(true);
    try {
      await onDelete();
      onClose();
    } catch (err) {
      console.error('Error deleting:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const categoryOptions = DEFAULT_CATEGORIES
    .filter(c => c.type === 'expense')
    .map((c, idx) => ({
      value: `cat-${idx}`,
      label: c.name,
    }));

  const paymentOptions = [
    { value: '', label: 'Select payment method' },
    { value: 'credit_card', label: 'Credit Card' },
    { value: 'debit_card', label: 'Debit Card' },
    { value: 'cash', label: 'Cash' },
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'paypal', label: 'PayPal' },
    { value: 'other', label: 'Other' },
  ];

  const statusOptions = [
    { value: 'pending', label: 'Pending Review' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
  ];

  return (
    <div className="space-y-6">
      {/* Receipt Image */}
      {receipt.file_url && (
        <div className="rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-700">
          <img 
            src={receipt.file_url} 
            alt="Receipt" 
            className="w-full max-h-80 object-contain"
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        {isEditing ? (
          <>
            <Button
              variant="primary"
              onClick={handleSave}
              loading={isSaving}
              icon={<CheckIcon size={16} />}
              className="flex-1"
            >
              Save Changes
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsEditing(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="outline"
              onClick={() => setIsEditing(true)}
              icon={<EditIcon size={16} />}
              className="flex-1"
            >
              Edit
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              loading={isDeleting}
              icon={<TrashIcon size={16} />}
            >
              Delete
            </Button>
          </>
        )}
      </div>

      {/* Details Form */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Merchant"
            value={editData.merchant_name}
            onChange={(e) => setEditData({ ...editData, merchant_name: e.target.value })}
            disabled={!isEditing}
          />
          <Input
            label="Date"
            type="date"
            value={editData.transaction_date}
            onChange={(e) => setEditData({ ...editData, transaction_date: e.target.value })}
            disabled={!isEditing}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Total Amount"
            type="number"
            step="0.01"
            value={editData.total_amount}
            onChange={(e) => setEditData({ ...editData, total_amount: parseFloat(e.target.value) || 0 })}
            disabled={!isEditing}
          />
          <Input
            label="Tax Amount"
            type="number"
            step="0.01"
            value={editData.tax_amount}
            onChange={(e) => setEditData({ ...editData, tax_amount: parseFloat(e.target.value) || 0 })}
            disabled={!isEditing}
          />
          <Select
            label="Currency"
            value={editData.currency}
            options={[
              { value: 'USD', label: 'USD' },
              { value: 'EUR', label: 'EUR' },
              { value: 'GBP', label: 'GBP' },
              { value: 'CAD', label: 'CAD' },
              { value: 'AUD', label: 'AUD' },
            ]}
            onChange={(value) => setEditData({ ...editData, currency: value })}
            disabled={!isEditing}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Category"
            value={editData.category_id}
            options={[{ value: '', label: 'Select category' }, ...categoryOptions]}
            onChange={(value) => setEditData({ ...editData, category_id: value })}
            disabled={!isEditing}
          />
          <Select
            label="Payment Method"
            value={editData.payment_method}
            options={paymentOptions}
            onChange={(value) => setEditData({ ...editData, payment_method: value })}
            disabled={!isEditing}
          />
        </div>

        <Select
          label="Review Status"
          value={editData.review_status}
          options={statusOptions}
          onChange={(value) => setEditData({ ...editData, review_status: value as any })}
          disabled={!isEditing}
        />

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Tags
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map((tag) => (
              <span 
                key={tag}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
              >
                <TagIcon size={12} />
                {tag}
                {isEditing && (
                  <button
                    onClick={() => removeTag(tag)}
                    className="ml-1 hover:text-blue-900"
                  >
                    <XIcon size={12} />
                  </button>
                )}
              </span>
            ))}
          </div>
          {isEditing && (
            <div className="flex gap-2">
              <Input
                placeholder="Add tag..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTag()}
              />
              <Button variant="outline" onClick={addTag}>
                Add
              </Button>
            </div>
          )}
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Notes
          </label>
          <textarea
            value={editData.notes}
            onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
            disabled={!isEditing}
            rows={3}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 disabled:opacity-60"
            placeholder="Add notes..."
          />
        </div>

        {/* Business/Personal Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => isEditing && setEditData({ ...editData, is_business: !editData.is_business })}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              editData.is_business 
                ? 'bg-blue-500' 
                : 'bg-slate-300 dark:bg-slate-600'
            } ${!isEditing ? 'opacity-60' : ''}`}
            disabled={!isEditing}
          >
            <span 
              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                editData.is_business ? 'translate-x-6' : ''
              }`}
            />
          </button>
          <span className="text-sm text-slate-700 dark:text-slate-300">
            {editData.is_business ? 'Business Expense' : 'Personal Expense'}
          </span>
        </div>

        {/* Line Items */}
        {receipt.line_items && receipt.line_items.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Line Items
            </label>
            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 space-y-2">
              {receipt.line_items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-300">
                    {item.quantity}x {item.name}
                  </span>
                  <span className="font-medium text-slate-900 dark:text-white">
                    {formatCurrency(item.price, receipt.currency)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Confidence */}
        {receipt.ai_confidence !== null && (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span>AI Confidence:</span>
            <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-emerald-500"
                style={{ width: `${(receipt.ai_confidence || 0) * 100}%` }}
              />
            </div>
            <span>{Math.round((receipt.ai_confidence || 0) * 100)}%</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReceiptDetail;
