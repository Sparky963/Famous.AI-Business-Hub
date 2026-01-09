import React, { useState, useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import {
  SearchIcon,
  CameraIcon,
  FilterIcon,
  EyeIcon,
  TrashIcon,
  CheckIcon,
  CloseIcon,
  DownloadIcon
} from '@/components/icons/Icons';
import { Expense } from '@/types';

export const ReceiptsView: React.FC = () => {
  const {
    expenses,
    categories,
    deleteExpense,
    updateExpense,
    setShowScanReceiptModal
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedReceipt, setSelectedReceipt] = useState<Expense | null>(null);

  // Only show expenses with receipts
  const receipts = useMemo(() => {
    return expenses.filter(e => e.receipt_url);
  }, [expenses]);

  const filteredReceipts = useMemo(() => {
    return receipts.filter(receipt => {
      const matchesSearch = 
        receipt.merchant_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        receipt.category_name?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = categoryFilter === 'all' || receipt.category_name === categoryFilter;
      const matchesStatus = statusFilter === 'all' || receipt.review_status === statusFilter;
      
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [receipts, searchQuery, categoryFilter, statusFilter]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleApprove = async (receipt: Expense) => {
    await updateExpense(receipt.id, { review_status: 'approved' });
  };

  const handleReject = async (receipt: Expense) => {
    await updateExpense(receipt.id, { review_status: 'rejected' });
  };

  const handleDelete = async (receipt: Expense) => {
    if (confirm('Are you sure you want to delete this receipt?')) {
      await deleteExpense(receipt.id);
      if (selectedReceipt?.id === receipt.id) {
        setSelectedReceipt(null);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'rejected': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Receipts</h1>
          <p className="text-gray-400">{filteredReceipts.length} receipts with images</p>
        </div>
        
        <button
          onClick={() => setShowScanReceiptModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all"
        >
          <CameraIcon size={20} />
          Scan Receipt
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
            placeholder="Search receipts..."
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
          <option value="pending">Pending Review</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>

        <div className="flex items-center gap-1 bg-gray-800 border border-gray-700 rounded-lg p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1.5 rounded text-sm ${viewMode === 'grid' ? 'bg-purple-600 text-white' : 'text-gray-400'}`}
          >
            Grid
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 rounded text-sm ${viewMode === 'list' ? 'bg-purple-600 text-white' : 'text-gray-400'}`}
          >
            List
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Receipt Grid/List */}
        <div className={`${selectedReceipt ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
          {filteredReceipts.length > 0 ? (
            viewMode === 'grid' ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredReceipts.map(receipt => (
                  <div
                    key={receipt.id}
                    onClick={() => setSelectedReceipt(receipt)}
                    className={`group relative bg-gray-800/50 border rounded-xl overflow-hidden cursor-pointer transition-all ${
                      selectedReceipt?.id === receipt.id
                        ? 'border-purple-500 ring-2 ring-purple-500/50'
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    {/* Receipt Image */}
                    <div className="aspect-[3/4] overflow-hidden">
                      <img
                        src={receipt.receipt_url}
                        alt={receipt.merchant_name || 'Receipt'}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    
                    {/* Status Badge */}
                    <div className={`absolute top-2 right-2 px-2 py-0.5 text-xs rounded-full border ${getStatusColor(receipt.review_status)}`}>
                      {receipt.review_status}
                    </div>
                    
                    {/* Info Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 to-transparent">
                      <p className="text-white font-medium text-sm truncate">{receipt.merchant_name}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-gray-400 text-xs">{formatDate(receipt.transaction_date || '')}</span>
                        <span className="text-white font-medium text-sm">{formatCurrency(receipt.total_amount)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-900/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Receipt</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Merchant</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Date</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Amount</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase">Status</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {filteredReceipts.map(receipt => (
                      <tr
                        key={receipt.id}
                        className={`hover:bg-gray-700/50 cursor-pointer transition-colors ${
                          selectedReceipt?.id === receipt.id ? 'bg-purple-500/10' : ''
                        }`}
                        onClick={() => setSelectedReceipt(receipt)}
                      >
                        <td className="px-4 py-3">
                          <div className="w-12 h-16 rounded overflow-hidden">
                            <img
                              src={receipt.receipt_url}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-white font-medium">{receipt.merchant_name}</p>
                          <p className="text-xs text-gray-500">{receipt.category_name}</p>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-300">
                          {formatDate(receipt.transaction_date || '')}
                        </td>
                        <td className="px-4 py-3 text-right text-white font-medium">
                          {formatCurrency(receipt.total_amount)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(receipt.review_status)}`}>
                            {receipt.review_status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            {receipt.review_status === 'pending' && (
                              <>
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleApprove(receipt); }}
                                  className="p-1.5 text-green-400 hover:bg-green-500/20 rounded"
                                >
                                  <CheckIcon size={16} />
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleReject(receipt); }}
                                  className="p-1.5 text-red-400 hover:bg-red-500/20 rounded"
                                >
                                  <CloseIcon size={16} />
                                </button>
                              </>
                            )}
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDelete(receipt); }}
                              className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/20 rounded"
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
            )
          ) : (
            <div className="text-center py-12 bg-gray-800/50 border border-gray-700 rounded-xl">
              <CameraIcon className="mx-auto text-gray-600 mb-4" size={48} />
              <p className="text-gray-400">No receipts found</p>
              <button
                onClick={() => setShowScanReceiptModal(true)}
                className="mt-4 text-purple-400 hover:text-purple-300"
              >
                Scan your first receipt
              </button>
            </div>
          )}
        </div>

        {/* Receipt Detail Panel */}
        {selectedReceipt && (
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden h-fit sticky top-4">
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Receipt Details</h3>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="text-gray-400 hover:text-white"
              >
                ×
              </button>
            </div>
            
            {/* Receipt Image */}
            <div className="p-4">
              <div className="rounded-lg overflow-hidden border border-gray-700 mb-4">
                <img
                  src={selectedReceipt.receipt_url}
                  alt="Receipt"
                  className="w-full"
                />
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-400">Merchant</p>
                  <p className="text-xl font-bold text-white">{selectedReceipt.merchant_name}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-400">Date</p>
                    <p className="text-white">{formatDate(selectedReceipt.transaction_date || '')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Category</p>
                    <p className="text-white">{selectedReceipt.category_name}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-400">Amount</p>
                    <p className="text-xl font-bold text-red-400">{formatCurrency(selectedReceipt.total_amount)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Tax</p>
                    <p className="text-white">{formatCurrency(selectedReceipt.tax_amount || 0)}</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-400">Status</p>
                  <span className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusColor(selectedReceipt.review_status)}`}>
                    {selectedReceipt.review_status}
                  </span>
                </div>
                
                {selectedReceipt.line_items && selectedReceipt.line_items.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-400 mb-2">Line Items</p>
                    <div className="space-y-2">
                      {selectedReceipt.line_items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm p-2 bg-gray-700/50 rounded">
                          <span className="text-gray-300">{item.name}</span>
                          <span className="text-white">{formatCurrency(item.total)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {selectedReceipt.ai_confidence && (
                  <div className="text-xs text-gray-500">
                    AI Confidence: {Math.round(selectedReceipt.ai_confidence * 100)}%
                  </div>
                )}
                
                {/* Actions */}
                {selectedReceipt.review_status === 'pending' && (
                  <div className="flex gap-2 pt-4 border-t border-gray-700">
                    <button
                      onClick={() => handleApprove(selectedReceipt)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      <CheckIcon size={18} />
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(selectedReceipt)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      <CloseIcon size={18} />
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReceiptsView;
