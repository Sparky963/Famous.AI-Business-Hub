import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { IncomeEntry } from '@/types';

export function useIncome() {
  const [incomeEntries, setIncomeEntries] = useState<IncomeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load income entries
  const loadIncome = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: queryError } = await supabase
        .from('income_entries')
        .select('*')
        .order('income_date', { ascending: false });

      if (queryError) throw queryError;
      setIncomeEntries(data || []);
    } catch (err: any) {
      console.error('Error loading income:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Add income entry
  const addIncome = useCallback(async (incomeData: Partial<IncomeEntry>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('income_entries')
        .insert({
          ...incomeData,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      
      setIncomeEntries(prev => [data, ...prev]);
      return data;
    } catch (err: any) {
      console.error('Error adding income:', err);
      throw err;
    }
  }, []);

  // Update income entry
  const updateIncome = useCallback(async (id: string, updates: Partial<IncomeEntry>) => {
    try {
      const { data, error } = await supabase
        .from('income_entries')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setIncomeEntries(prev => prev.map(i => i.id === id ? { ...i, ...data } : i));
      return data;
    } catch (err: any) {
      console.error('Error updating income:', err);
      throw err;
    }
  }, []);

  // Delete income entry
  const deleteIncome = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('income_entries')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setIncomeEntries(prev => prev.filter(i => i.id !== id));
    } catch (err: any) {
      console.error('Error deleting income:', err);
      throw err;
    }
  }, []);

  useEffect(() => {
    loadIncome();
  }, [loadIncome]);

  return {
    incomeEntries,
    loading,
    error,
    loadIncome,
    addIncome,
    updateIncome,
    deleteIncome,
  };
}
