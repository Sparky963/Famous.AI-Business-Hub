import React from 'react';
import { Receipt, Category } from '@/types';
import { CheckIcon, AlertIcon, EyeIcon } from '@/components/icons/Icons';

interface ReceiptCardProps {
  receipt: Receipt;
  category?: Category;
  onClick: () => void;
}

const ReceiptCard: React.FC<ReceiptCardProps> = ({ receipt, category, onClick }) => {
  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'No date';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusBadge = () => {
    switch (receipt.review_status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
            <CheckIcon size={12} />
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
            <AlertIcon size={12} />
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
            <EyeIcon size={12} />
            Pending
          </span>
        );
    }
  };

  return (
    <div
      onClick={onClick}
      className="group bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 cursor-pointer"
    >
      <div className="flex items-start gap-4">
        {/* Thumbnail */}
        <div className="flex-shrink-0 w-16 h-20 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-700">
          {receipt.file_url ? (
            <img 
              src={receipt.file_url} 
              alt="Receipt" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1z" />
                <path d="M8 6h8M8 10h8M8 14h4" />
              </svg>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white truncate">
                {receipt.merchant_name || 'Unknown Merchant'}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {formatDate(receipt.transaction_date)}
              </p>
            </div>
            <p className="font-bold text-lg text-slate-900 dark:text-white whitespace-nowrap">
              {formatCurrency(receipt.total_amount, receipt.currency)}
            </p>
          </div>

          <div className="mt-3 flex items-center gap-2 flex-wrap">
            {/* Category Badge */}
            {category && (
              <span 
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                style={{ 
                  backgroundColor: `${category.color}20`,
                  color: category.color,
                }}
              >
                <span 
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                {category.name}
              </span>
            )}
            
            {/* Status Badge */}
            {getStatusBadge()}
            
            {/* Payment Method */}
            {receipt.payment_method && (
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                {receipt.payment_method}
              </span>
            )}
          </div>

          {/* Tags */}
          {receipt.tags && receipt.tags.length > 0 && (
            <div className="mt-2 flex gap-1 flex-wrap">
              {receipt.tags.slice(0, 3).map((tag, idx) => (
                <span 
                  key={idx}
                  className="px-2 py-0.5 rounded text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                >
                  #{tag}
                </span>
              ))}
              {receipt.tags.length > 3 && (
                <span className="text-xs text-slate-400">
                  +{receipt.tags.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReceiptCard;
