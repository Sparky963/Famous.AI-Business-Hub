import React, { useState, useRef } from 'react';
import { Modal } from '@/components/ui/Modal';
import { useApp } from '@/contexts/AppContext';
import { supabase } from '@/lib/supabase';
import { 
  CameraIcon, 
  UploadIcon, 
  LoadingSpinner, 
  CheckIcon,
  SparkleIcon 
} from '@/components/icons/Icons';
import { AIExtractionResult } from '@/types';

export const ScanReceiptModal: React.FC = () => {
  const { 
    showScanReceiptModal, 
    setShowScanReceiptModal, 
    addExpense,
    categories,
    clients
  } = useApp();
  
  const [step, setStep] = useState<'upload' | 'processing' | 'review'>('upload');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<AIExtractionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  
  const [editableData, setEditableData] = useState({
    merchant_name: '',
    transaction_date: '',
    category_name: '',
    total_amount: '',
    tax_amount: '',
    payment_method: '',
    client_id: '',
    notes: '',
    is_tax_deductible: true
  });

  const handleFileSelect = async (file: File) => {
    setError(null);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    
    // Process with AI
    setStep('processing');
    setLoading(true);
    
    try {
      // Convert to base64
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1]);
        };
        reader.readAsDataURL(file);
      });
      
      // Upload to storage
      const fileName = `${Date.now()}-${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('receipts')
        .upload(fileName, file);
      
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from('receipts')
        .getPublicUrl(fileName);
      
      // Call AI extraction
      const { data, error: fnError } = await supabase.functions.invoke('extract-receipt', {
        body: { imageBase64: base64 }
      });
      
      if (fnError) throw fnError;
      
      if (data.success && data.data) {
        setExtractedData({ ...data.data, receipt_url: publicUrl });
        setEditableData({
          merchant_name: data.data.merchant_name || '',
          transaction_date: data.data.transaction_date || new Date().toISOString().split('T')[0],
          category_name: data.data.category_suggestion || '',
          total_amount: data.data.total_amount?.toString() || '',
          tax_amount: data.data.tax_amount?.toString() || '0',
          payment_method: data.data.payment_method || 'other',
          client_id: '',
          notes: '',
          is_tax_deductible: data.data.is_tax_deductible || false
        });
        setStep('review');
      } else {
        throw new Error(data.error || 'Failed to extract receipt data');
      }
    } catch (err: any) {
      console.error('Receipt processing error:', err);
      setError(err.message || 'Failed to process receipt');
      setStep('upload');
    }
    
    setLoading(false);
  };

  const handleSaveExpense = async () => {
    setLoading(true);
    
    const category = categories.find(c => c.name === editableData.category_name);
    
    await addExpense({
      merchant_name: editableData.merchant_name,
      transaction_date: editableData.transaction_date,
      category_name: editableData.category_name,
      category_id: category?.id,
      total_amount: parseFloat(editableData.total_amount) || 0,
      tax_amount: parseFloat(editableData.tax_amount) || 0,
      payment_method: editableData.payment_method,
      client_id: editableData.client_id || undefined,
      notes: editableData.notes,
      is_tax_deductible: editableData.is_tax_deductible,
      is_business: true,
      currency: extractedData?.currency || 'USD',
      country: extractedData?.country || 'US',
      receipt_type: (extractedData?.receipt_type as any) || 'receipt',
      review_status: 'approved',
      line_items: extractedData?.line_items || [],
      receipt_url: (extractedData as any)?.receipt_url,
      ai_confidence: extractedData?.confidence,
      ai_raw_response: extractedData?.raw_response,
      irs_category: extractedData?.irs_category || undefined
    });
    
    setLoading(false);
    handleClose();
  };

  const handleClose = () => {
    setShowScanReceiptModal(false);
    setStep('upload');
    setImagePreview(null);
    setExtractedData(null);
    setError(null);
    setEditableData({
      merchant_name: '',
      transaction_date: '',
      category_name: '',
      total_amount: '',
      tax_amount: '',
      payment_method: '',
      client_id: '',
      notes: '',
      is_tax_deductible: true
    });
  };

  return (
    <Modal
      isOpen={showScanReceiptModal}
      onClose={handleClose}
      title="Scan Receipt"
      size="xl"
    >
      {step === 'upload' && (
        <div className="space-y-6">
          {error && (
            <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400">
              {error}
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => cameraInputRef.current?.click()}
              className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-600 rounded-xl hover:border-purple-500 hover:bg-purple-500/10 transition-all group"
            >
              <CameraIcon size={48} className="text-gray-400 group-hover:text-purple-400 mb-4" />
              <span className="text-lg font-medium text-white">Take Photo</span>
              <span className="text-sm text-gray-400 mt-1">Use your camera</span>
            </button>
            
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-600 rounded-xl hover:border-purple-500 hover:bg-purple-500/10 transition-all group"
            >
              <UploadIcon size={48} className="text-gray-400 group-hover:text-purple-400 mb-4" />
              <span className="text-lg font-medium text-white">Upload File</span>
              <span className="text-sm text-gray-400 mt-1">PDF, JPG, PNG</span>
            </button>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
          />
          
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
          />
          
          <div className="flex items-center gap-3 p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
            <SparkleIcon className="text-purple-400" size={24} />
            <div>
              <p className="text-white font-medium">AI-Powered Extraction</p>
              <p className="text-sm text-gray-400">Automatically detects merchant, date, amount, category, and more</p>
            </div>
          </div>
        </div>
      )}
      
      {step === 'processing' && (
        <div className="flex flex-col items-center justify-center py-12">
          <LoadingSpinner size={48} className="text-purple-500 mb-4" />
          <p className="text-xl font-medium text-white mb-2">Processing Receipt</p>
          <p className="text-gray-400">AI is extracting data from your receipt...</p>
          
          {imagePreview && (
            <div className="mt-6 w-48 h-48 rounded-lg overflow-hidden border border-gray-700">
              <img src={imagePreview} alt="Receipt" className="w-full h-full object-cover" />
            </div>
          )}
        </div>
      )}
      
      {step === 'review' && extractedData && (
        <div className="space-y-6">
          <div className="flex items-center gap-2 p-3 bg-green-500/20 border border-green-500/50 rounded-lg">
            <CheckIcon className="text-green-400" size={20} />
            <span className="text-green-400">
              Data extracted with {Math.round((extractedData.confidence || 0.85) * 100)}% confidence
            </span>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Receipt Preview */}
            <div>
              {imagePreview && (
                <div className="rounded-lg overflow-hidden border border-gray-700">
                  <img src={imagePreview} alt="Receipt" className="w-full" />
                </div>
              )}
              
              {extractedData.line_items && extractedData.line_items.length > 0 && (
                <div className="mt-4 p-4 bg-gray-800 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Line Items Detected</h4>
                  <div className="space-y-2">
                    {extractedData.line_items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-gray-400">{item.name} x{item.quantity}</span>
                        <span className="text-white">${item.total.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Editable Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Merchant</label>
                <input
                  type="text"
                  value={editableData.merchant_name}
                  onChange={(e) => setEditableData({ ...editableData, merchant_name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Date</label>
                  <input
                    type="date"
                    value={editableData.transaction_date}
                    onChange={(e) => setEditableData({ ...editableData, transaction_date: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Total</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={editableData.total_amount}
                      onChange={(e) => setEditableData({ ...editableData, total_amount: e.target.value })}
                      className="w-full pl-8 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Tax</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={editableData.tax_amount}
                      onChange={(e) => setEditableData({ ...editableData, tax_amount: e.target.value })}
                      className="w-full pl-8 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Payment</label>
                  <select
                    value={editableData.payment_method}
                    onChange={(e) => setEditableData({ ...editableData, payment_method: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="credit">Credit Card</option>
                    <option value="debit">Debit Card</option>
                    <option value="cash">Cash</option>
                    <option value="zelle">Zelle</option>
                    <option value="venmo">Venmo</option>
                    <option value="cashapp">Cash App</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Category</label>
                <select
                  value={editableData.category_name}
                  onChange={(e) => setEditableData({ ...editableData, category_name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Link to Client</label>
                <select
                  value={editableData.client_id}
                  onChange={(e) => setEditableData({ ...editableData, client_id: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">No client</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>{client.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="tax_ded"
                  checked={editableData.is_tax_deductible}
                  onChange={(e) => setEditableData({ ...editableData, is_tax_deductible: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-700 bg-gray-800 text-purple-500"
                />
                <label htmlFor="tax_ded" className="text-sm text-gray-300">Tax Deductible</label>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
            <button
              onClick={() => setStep('upload')}
              className="px-6 py-2.5 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            >
              Scan Another
            </button>
            <button
              onClick={handleSaveExpense}
              disabled={loading}
              className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {loading && <LoadingSpinner size={18} />}
              Save Expense
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default ScanReceiptModal;
