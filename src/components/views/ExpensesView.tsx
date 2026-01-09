import React, { useState, useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import {
  SearchIcon,
  PlusIcon,
  EditIcon,
  TrashIcon,
  FilterIcon,
  DownloadIcon,
  CameraIcon,
  EyeIcon,
  CheckIcon,
  CloseIcon
} from '@/components/icons/Icons';
import { Expense } from '@/types';

export const ExpensesView: React.FC = () => {
  const {
    expenses,
    categories,
    clients,
    deleteExpense,
    updateExpense,
    setShowAddExpenseModal,
    setShowScanReceiptModal,
    setSelectedExpense
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedExpenseDetail, setSelectedExpenseDetail] = useState<Expense | null>(null);

  const filteredExpenses = useMemo(() => {
    let filtered = expenses.filter(expense => {
      const matchesSearch = 
        expense.merchant_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        expense.category_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        expense.notes?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = categoryFilter === 'all' || expense.category_name === categoryFilter;
      const matchesStatus = statusFilter === 'all' || expense.review_status === statusFilter;
      
      let matchesDate = true;
      if (dateRange.start && expense.transaction_date) {
        matchesDate = expense.transaction_date >= dateRange.start;
      }
      if (dateRange.end && expense.transaction_date) {
        matchesDate = matchesDate && expense.transaction_date <= dateRange.end;
      }
      
      return matchesSearch && matchesCategory && matchesStatus && matchesDate;
    });

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'date') {
        const dateA = new Date(a.transaction_date || '').getTime();
        const dateB = new Date(b.transaction_date || '').getTime();
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
      } else {
        return sortOrder === 'desc' ? b.total_amount - a.total_amount : a.total_amount - b.total_amount;
      }
    });

    return filtered;
  }, [expenses, searchQuery, categoryFilter, statusFilter, dateRange, sortBy, sortOrder]);

  // Category totals
  const categoryTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    filteredExpenses.forEach(expense => {
      const cat = expense.category_name || 'Uncategorized';
      totals[cat] = (totals[cat] || 0) + expense.total_amount;
    });
    return Object.entries(totals).sort((a, b) => b[1] - a[1]);
  }, [filteredExpenses]);

  const totalAmount = useMemo(() => {
    return filteredExpenses.reduce((sum, e) => sum + e.total_amount, 0);
  }, [filteredExpenses]);

  const totalTax = useMemo(() => {
    return filteredExpenses.reduce((sum, e) => sum + (e.tax_amount || 0), 0);
  }, [filteredExpenses]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleApprove = async (expense: Expense) => {
    await updateExpense(expense.id, { review_status: 'approved' });
  };

  const handleReject = async (expense: Expense) => {
    await updateExpense(expense.id, { review_status: 'rejected' });
  };

  const handleDelete = async (expense: Expense) => {
    if (confirm('Are you sure you want to delete this expense?')) {
      await deleteExpense(expense.id);
      if (selectedExpenseDetail?.id === expense.id) {
        setSelectedExpenseDetail(null);
      }
    }
  };

  const exportToCSV = () => {
    let csv = 'Date,Merchant,Category,Amount,Tax,Payment Method,Status,Notes\n';
    filteredExpenses.forEach(expense => {
      csv += `${expense.transaction_date},${expense.merchant_name?.replace(/,/g, ' ')},${expense.category_name},${expense.total_amount},${expense.tax_amount || 0},${expense.payment_method},${expense.review_status},"${expense.notes || ''}"\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expenses-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-500/20 text-green-400';
      case 'rejected': return 'bg-red-500/20 text-red-400';
      default: return 'bg-yellow-500/20 text-yellow-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Expenses</h1>
          <p className="text-gray-400">{filteredExpenses.length} expenses • {formatCurrency(totalAmount)} total</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            <DownloadIcon size={18} />
            Export CSV
          </button>
          <button
            onClick={() => setShowScanReceiptModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <CameraIcon size={18} />
            Scan Receipt
          </button>
          <button
            onClick={() => setShowAddExpenseModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all"
          >
            <PlusIcon size={18} />
            Add Expense
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="relative md:col-span-2">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search expenses..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
          />
        </div>
        
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
        >
          <option value="all">All Categories</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.name}>{cat.name}</option>
          ))}
        </select>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            className="flex-1 px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
            placeholder="Start"
          />
          <span className="text-gray-500">-</span>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            className="flex-1 px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
            placeholder="End"
          />
        </div>
      </div>

      {/* Category Summary */}
      {categoryTotals.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {categoryTotals.slice(0, 6).map(([category, total]) => (
            <div
              key={category}
              onClick={() => setCategoryFilter(category)}
              className={`p-3 rounded-lg cursor-pointer transition-all ${
                categoryFilter === category
                  ? 'bg-purple-500/20 border border-purple-500'
                  : 'bg-gray-800/50 border border-gray-700 hover:border-gray-600'
              }`}
            >
              <p className="text-xs text-gray-400 truncate">{category}</p>
              <p className="text-lg font-bold text-white">{formatCurrency(total)}</p>
            </div>
          ))}
        </div>
      )}

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Expense List */}
        <div className={`${selectedExpenseDetail ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
          {filteredExpenses.length > 0 ? (
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-900/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Merchant</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase hidden md:table-cell">Category</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Amount</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase hidden md:table-cell">Status</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {filteredExpenses.map(expense => (
                    <tr
                      key={expense.id}
                      className={`hover:bg-gray-700/50 cursor-pointer transition-colors ${
                        selectedExpenseDetail?.id === expense.id ? 'bg-purple-500/10' : ''
                      }`}
                      onClick={() => setSelectedExpenseDetail(expense)}
                    >
                      <td className="px-4 py-3 text-sm text-gray-300">
                        {formatDate(expense.transaction_date || '')}
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-white font-medium">{expense.merchant_name}</p>
                          <p className="text-xs text-gray-500 md:hidden">{expense.category_name}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-400 hidden md:table-cell">
                        {expense.category_name}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <p className="text-white font-medium">{formatCurrency(expense.total_amount)}</p>
                        {expense.tax_amount > 0 && (
                          <p className="text-xs text-gray-500">Tax: {formatCurrency(expense.tax_amount)}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center hidden md:table-cell">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(expense.review_status)}`}>
                          {expense.review_status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {expense.review_status === 'pending' && (
                            <>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleApprove(expense); }}
                                className="p-1.5 text-green-400 hover:bg-green-500/20 rounded transition-colors"
                                title="Approve"
                              >
                                <CheckIcon size={16} />
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleReject(expense); }}
                                className="p-1.5 text-red-400 hover:bg-red-500/20 rounded transition-colors"
                                title="Reject"
                              >
                                <CloseIcon size={16} />
                              </button>
                            </>
                          )}
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(expense); }}
                            className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/20 rounded transition-colors"
                          >
                            <TrashIcon size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-800/50 border border-gray-700 rounded-xl">
              <ReceiptIcon className="mx-auto text-gray-600 mb-4" size={48} />
              <p className="text-gray-400">No expenses found</p>
              <button
                onClick={() => setShowScanReceiptModal(true)}
                className="mt-4 text-purple-400 hover:text-purple-300"
              >
                Scan your first receipt
              </button>
            </div>
          )}
        </div>

        {/* Expense Detail Panel */}
        {selectedExpenseDetail && (
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5 h-fit sticky top-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Expense Details</h3>
              <button
                onClick={() => setSelectedExpenseDetail(null)}
                className="text-gray-400 hover:text-white"
              >
                ×
              </button>
            </div>
            
            {selectedExpenseDetail.receipt_url && (
              <div className="mb-4 rounded-lg overflow-hidden border border-gray-700">
                <img
                  src={selectedExpenseDetail.receipt_url}
                  alt="Receipt"
                  className="w-full"
                />
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-400">Merchant</p>
                <p className="text-xl font-bold text-white">{selectedExpenseDetail.merchant_name}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400">Date</p>
                  <p className="text-white">{formatDate(selectedExpenseDetail.transaction_date || '')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Category</p>
                  <p className="text-white">{selectedExpenseDetail.category_name}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400">Amount</p>
                  <p className="text-xl font-bold text-red-400">{formatCurrency(selectedExpenseDetail.total_amount)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Tax</p>
                  <p className="text-white">{formatCurrency(selectedExpenseDetail.tax_amount || 0)}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400">Payment Method</p>
                  <p className="text-white capitalize">{selectedExpenseDetail.payment_method}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Status</p>
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(selectedExpenseDetail.review_status)}`}>
                    {selectedExpenseDetail.review_status}
                  </span>
                </div>
              </div>
              
              {selectedExpenseDetail.is_tax_deductible && (
                <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <p className="text-green-400 text-sm font-medium">Tax Deductible</p>
                  {selectedExpenseDetail.irs_category && (
                    <p className="text-xs text-gray-400">IRS: {selectedExpenseDetail.irs_category}</p>
                  )}
                </div>
              )}
              
              {/* Line Items */}
              {selectedExpenseDetail.line_items && selectedExpenseDetail.line_items.length > 0 && (
                <div>
                  <p className="text-sm text-gray-400 mb-2">Line Items</p>
                  <div className="space-y-2">
                    {selectedExpenseDetail.line_items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm p-2 bg-gray-700/50 rounded">
                        <span className="text-gray-300">{item.name} x{item.quantity}</span>
                        <span className="text-white">{formatCurrency(item.total)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedExpenseDetail.notes && (
                <div>
                  <p className="text-sm text-gray-400">Notes</p>
                  <p className="text-gray-300">{selectedExpenseDetail.notes}</p>
                </div>
              )}
              
              {selectedExpenseDetail.ai_confidence && (
                <div className="text-xs text-gray-500">
                  AI Confidence: {Math.round(selectedExpenseDetail.ai_confidence * 100)}%
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Import icon for empty state
const ReceiptIcon: React.FC<{ className?: string; size?: number }> = ({ className = '', size = 24 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1z" />
    <path d="M8 6h8" />
    <path d="M8 10h8" />
    <path d="M8 14h4" />
  </svg>
);

export default ExpensesView;
