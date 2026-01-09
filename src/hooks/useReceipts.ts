import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Receipt, FilterOptions, Category, DEFAULT_CATEGORIES } from '@/types';

const initialFilters: FilterOptions = {
  dateFrom: null,
  dateTo: null,
  categories: [],
  merchants: [],
  paymentMethods: [],
  tags: [],
  reviewStatus: null,
  minAmount: null,
  maxAmount: null,
  currency: null,
  searchQuery: '',
};

export function useReceipts() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterOptions>(initialFilters);
  const [error, setError] = useState<string | null>(null);

  // Load categories
  const loadCategories = useCallback(async () => {
    // Use default categories for now (can be enhanced to load from DB)
    const defaultCats: Category[] = DEFAULT_CATEGORIES.map((cat, idx) => ({
      ...cat,
      id: `cat-${idx}`,
      user_id: null,
      created_at: new Date().toISOString(),
    }));
    setCategories(defaultCats);
  }, []);

  // Load receipts
  const loadReceipts = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      let query = supabase
        .from('receipts')
        .select('*')
        .order('transaction_date', { ascending: false });

      // Apply filters
      if (filters.dateFrom) {
        query = query.gte('transaction_date', filters.dateFrom);
      }
      if (filters.dateTo) {
        query = query.lte('transaction_date', filters.dateTo);
      }
      if (filters.categories.length > 0) {
        query = query.in('category_id', filters.categories);
      }
      if (filters.reviewStatus) {
        query = query.eq('review_status', filters.reviewStatus);
      }
      if (filters.minAmount !== null) {
        query = query.gte('total_amount', filters.minAmount);
      }
      if (filters.maxAmount !== null) {
        query = query.lte('total_amount', filters.maxAmount);
      }
      if (filters.searchQuery) {
        query = query.ilike('merchant_name', `%${filters.searchQuery}%`);
      }

      const { data, error: queryError } = await query;

      if (queryError) throw queryError;
      
      // Map categories to receipts
      const receiptsWithCategories = (data || []).map(receipt => ({
        ...receipt,
        category: categories.find(c => c.id === receipt.category_id),
      }));
      
      setReceipts(receiptsWithCategories);
    } catch (err: any) {
      console.error('Error loading receipts:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters, categories]);

  // Add receipt
  const addReceipt = useCallback(async (receiptData: Partial<Receipt>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('receipts')
        .insert({
          ...receiptData,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      
      setReceipts(prev => [data, ...prev]);
      return data;
    } catch (err: any) {
      console.error('Error adding receipt:', err);
      throw err;
    }
  }, []);

  // Update receipt
  const updateReceipt = useCallback(async (id: string, updates: Partial<Receipt>) => {
    try {
      const { data, error } = await supabase
        .from('receipts')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setReceipts(prev => prev.map(r => r.id === id ? { ...r, ...data } : r));
      return data;
    } catch (err: any) {
      console.error('Error updating receipt:', err);
      throw err;
    }
  }, []);

  // Delete receipt
  const deleteReceipt = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('receipts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setReceipts(prev => prev.filter(r => r.id !== id));
    } catch (err: any) {
      console.error('Error deleting receipt:', err);
      throw err;
    }
  }, []);

  // Upload receipt file
  const uploadReceiptFile = useCallback(async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('receipts')
      .upload(fileName, file);

    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage
      .from('receipts')
      .getPublicUrl(fileName);
    
    return publicUrl;
  }, []);

  // Extract receipt data using AI
  const extractReceiptData = useCallback(async (imageUrl: string) => {
    const { data, error } = await supabase.functions.invoke('extract-receipt', {
      body: { image_url: imageUrl },
    });

    if (error) throw error;
    return data;
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    if (categories.length > 0) {
      loadReceipts();
    }
  }, [loadReceipts, categories.length]);

  return {
    receipts,
    categories,
    loading,
    error,
    filters,
    setFilters,
    loadReceipts,
    addReceipt,
    updateReceipt,
    deleteReceipt,
    uploadReceiptFile,
    extractReceiptData,
  };
}
