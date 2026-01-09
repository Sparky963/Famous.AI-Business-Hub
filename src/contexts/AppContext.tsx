import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  BusinessProfile, 
  Client, 
  Invoice, 
  Expense, 
  IncomeEntry, 
  CalendarEvent, 
  ExpenseCategory,
  Payment,
  DashboardStats 
} from '@/types';

interface AppContextType {
  // Data
  businessProfile: BusinessProfile | null;
  clients: Client[];
  invoices: Invoice[];
  expenses: Expense[];
  incomeEntries: IncomeEntry[];
  events: CalendarEvent[];
  categories: ExpenseCategory[];
  payments: Payment[];
  
  // Stats
  stats: DashboardStats;
  
  // Loading states
  loading: boolean;
  
  // Current view
  currentView: string;
  setCurrentView: (view: string) => void;
  
  // CRUD operations
  refreshData: () => Promise<void>;
  addClient: (client: Partial<Client>) => Promise<Client | null>;
  updateClient: (id: string, data: Partial<Client>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  addInvoice: (invoice: Partial<Invoice>) => Promise<Invoice | null>;
  updateInvoice: (id: string, data: Partial<Invoice>) => Promise<void>;
  deleteInvoice: (id: string) => Promise<void>;
  addExpense: (expense: Partial<Expense>) => Promise<Expense | null>;
  updateExpense: (id: string, data: Partial<Expense>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  addIncome: (income: Partial<IncomeEntry>) => Promise<IncomeEntry | null>;
  updateIncome: (id: string, data: Partial<IncomeEntry>) => Promise<void>;
  deleteIncome: (id: string) => Promise<void>;
  addEvent: (event: Partial<CalendarEvent>) => Promise<CalendarEvent | null>;
  updateEvent: (id: string, data: Partial<CalendarEvent>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  addPayment: (payment: Partial<Payment>) => Promise<Payment | null>;
  updateBusinessProfile: (data: Partial<BusinessProfile>) => Promise<void>;
  
  // Modals
  showAddExpenseModal: boolean;
  setShowAddExpenseModal: (show: boolean) => void;
  showAddIncomeModal: boolean;
  setShowAddIncomeModal: (show: boolean) => void;
  showScanReceiptModal: boolean;
  setShowScanReceiptModal: (show: boolean) => void;
  showAddClientModal: boolean;
  setShowAddClientModal: (show: boolean) => void;
  showAddInvoiceModal: boolean;
  setShowAddInvoiceModal: (show: boolean) => void;
  showAddEventModal: boolean;
  setShowAddEventModal: (show: boolean) => void;
  
  // Selected items for editing
  selectedClient: Client | null;
  setSelectedClient: (client: Client | null) => void;
  selectedInvoice: Invoice | null;
  setSelectedInvoice: (invoice: Invoice | null) => void;
  selectedExpense: Expense | null;
  setSelectedExpense: (expense: Expense | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [incomeEntries, setIncomeEntries] = useState<IncomeEntry[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('dashboard');
  
  // Modal states
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [showAddIncomeModal, setShowAddIncomeModal] = useState(false);
  const [showScanReceiptModal, setShowScanReceiptModal] = useState(false);
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [showAddInvoiceModal, setShowAddInvoiceModal] = useState(false);
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  
  // Selected items
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  // Calculate stats
  const stats: DashboardStats = React.useMemo(() => {
    const now = new Date();
    const thisMonth = now.toISOString().substring(0, 7);
    
    const totalIncome = incomeEntries.reduce((sum, i) => sum + i.amount, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.total_amount, 0);
    const pendingInvoices = invoices.filter(i => i.status === 'pending' || i.status === 'partial').length;
    const pendingAmount = invoices
      .filter(i => i.status === 'pending' || i.status === 'partial')
      .reduce((sum, i) => sum + i.balance_due, 0);
    const upcomingEvents = events.filter(e => new Date(e.event_date) >= now).length;
    const receiptsThisMonth = expenses.filter(e => e.transaction_date?.startsWith(thisMonth)).length;
    
    return {
      totalIncome,
      totalExpenses,
      netProfit: totalIncome - totalExpenses,
      pendingInvoices,
      pendingAmount,
      upcomingEvents,
      receiptsThisMonth
    };
  }, [incomeEntries, expenses, invoices, events]);

  const refreshData = async () => {
    setLoading(true);
    try {
      const [
        profileRes,
        clientsRes,
        invoicesRes,
        expensesRes,
        incomeRes,
        eventsRes,
        categoriesRes,
        paymentsRes
      ] = await Promise.all([
        supabase.from('business_profile').select('*').single(),
        supabase.from('clients').select('*').order('created_at', { ascending: false }),
        supabase.from('invoices').select('*').order('created_at', { ascending: false }),
        supabase.from('expenses').select('*').order('transaction_date', { ascending: false }),
        supabase.from('income_entries').select('*').order('income_date', { ascending: false }),
        supabase.from('events').select('*').order('event_date', { ascending: true }),
        supabase.from('expense_categories').select('*').order('name'),
        supabase.from('payments').select('*').order('payment_date', { ascending: false })
      ]);

      if (profileRes.data) setBusinessProfile(profileRes.data);
      if (clientsRes.data) setClients(clientsRes.data);
      if (invoicesRes.data) setInvoices(invoicesRes.data);
      if (expensesRes.data) setExpenses(expensesRes.data);
      if (incomeRes.data) setIncomeEntries(incomeRes.data);
      if (eventsRes.data) setEvents(eventsRes.data);
      if (categoriesRes.data) setCategories(categoriesRes.data);
      if (paymentsRes.data) setPayments(paymentsRes.data);
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    refreshData();
  }, []);

  // CRUD Operations
  const addClient = async (client: Partial<Client>): Promise<Client | null> => {
    const { data, error } = await supabase.from('clients').insert([client]).select().single();
    if (error) { console.error(error); return null; }
    setClients(prev => [data, ...prev]);
    return data;
  };

  const updateClient = async (id: string, data: Partial<Client>) => {
    const { error } = await supabase.from('clients').update(data).eq('id', id);
    if (error) { console.error(error); return; }
    setClients(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
  };

  const deleteClient = async (id: string) => {
    const { error } = await supabase.from('clients').delete().eq('id', id);
    if (error) { console.error(error); return; }
    setClients(prev => prev.filter(c => c.id !== id));
  };

  const addInvoice = async (invoice: Partial<Invoice>): Promise<Invoice | null> => {
    const { data, error } = await supabase.from('invoices').insert([invoice]).select().single();
    if (error) { console.error(error); return null; }
    setInvoices(prev => [data, ...prev]);
    return data;
  };

  const updateInvoice = async (id: string, data: Partial<Invoice>) => {
    const { error } = await supabase.from('invoices').update(data).eq('id', id);
    if (error) { console.error(error); return; }
    setInvoices(prev => prev.map(i => i.id === id ? { ...i, ...data } : i));
  };

  const deleteInvoice = async (id: string) => {
    const { error } = await supabase.from('invoices').delete().eq('id', id);
    if (error) { console.error(error); return; }
    setInvoices(prev => prev.filter(i => i.id !== id));
  };

  const addExpense = async (expense: Partial<Expense>): Promise<Expense | null> => {
    const { data, error } = await supabase.from('expenses').insert([expense]).select().single();
    if (error) { console.error(error); return null; }
    setExpenses(prev => [data, ...prev]);
    return data;
  };

  const updateExpense = async (id: string, data: Partial<Expense>) => {
    const { error } = await supabase.from('expenses').update(data).eq('id', id);
    if (error) { console.error(error); return; }
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, ...data } : e));
  };

  const deleteExpense = async (id: string) => {
    const { error } = await supabase.from('expenses').delete().eq('id', id);
    if (error) { console.error(error); return; }
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  const addIncome = async (income: Partial<IncomeEntry>): Promise<IncomeEntry | null> => {
    const { data, error } = await supabase.from('income_entries').insert([income]).select().single();
    if (error) { console.error(error); return null; }
    setIncomeEntries(prev => [data, ...prev]);
    return data;
  };

  const updateIncome = async (id: string, data: Partial<IncomeEntry>) => {
    const { error } = await supabase.from('income_entries').update(data).eq('id', id);
    if (error) { console.error(error); return; }
    setIncomeEntries(prev => prev.map(i => i.id === id ? { ...i, ...data } : i));
  };

  const deleteIncome = async (id: string) => {
    const { error } = await supabase.from('income_entries').delete().eq('id', id);
    if (error) { console.error(error); return; }
    setIncomeEntries(prev => prev.filter(i => i.id !== id));
  };

  const addEvent = async (event: Partial<CalendarEvent>): Promise<CalendarEvent | null> => {
    const { data, error } = await supabase.from('events').insert([event]).select().single();
    if (error) { console.error(error); return null; }
    setEvents(prev => [...prev, data].sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime()));
    return data;
  };

  const updateEvent = async (id: string, data: Partial<CalendarEvent>) => {
    const { error } = await supabase.from('events').update(data).eq('id', id);
    if (error) { console.error(error); return; }
    setEvents(prev => prev.map(e => e.id === id ? { ...e, ...data } : e));
  };

  const deleteEvent = async (id: string) => {
    const { error } = await supabase.from('events').delete().eq('id', id);
    if (error) { console.error(error); return; }
    setEvents(prev => prev.filter(e => e.id !== id));
  };

  const addPayment = async (payment: Partial<Payment>): Promise<Payment | null> => {
    const { data, error } = await supabase.from('payments').insert([payment]).select().single();
    if (error) { console.error(error); return null; }
    setPayments(prev => [data, ...prev]);
    
    // Update invoice if linked
    if (payment.invoice_id) {
      const invoice = invoices.find(i => i.id === payment.invoice_id);
      if (invoice) {
        const newAmountPaid = invoice.amount_paid + (payment.amount || 0);
        const newBalanceDue = invoice.total - newAmountPaid;
        const newStatus = newBalanceDue <= 0 ? 'paid' : newAmountPaid > 0 ? 'partial' : 'pending';
        await updateInvoice(payment.invoice_id, {
          amount_paid: newAmountPaid,
          balance_due: newBalanceDue,
          status: newStatus as any
        });
      }
    }
    
    return data;
  };

  const updateBusinessProfile = async (data: Partial<BusinessProfile>) => {
    if (!businessProfile) return;
    const { error } = await supabase.from('business_profile').update(data).eq('id', businessProfile.id);
    if (error) { console.error(error); return; }
    setBusinessProfile(prev => prev ? { ...prev, ...data } : null);
  };

  return (
    <AppContext.Provider value={{
      businessProfile,
      clients,
      invoices,
      expenses,
      incomeEntries,
      events,
      categories,
      payments,
      stats,
      loading,
      currentView,
      setCurrentView,
      refreshData,
      addClient,
      updateClient,
      deleteClient,
      addInvoice,
      updateInvoice,
      deleteInvoice,
      addExpense,
      updateExpense,
      deleteExpense,
      addIncome,
      updateIncome,
      deleteIncome,
      addEvent,
      updateEvent,
      deleteEvent,
      addPayment,
      updateBusinessProfile,
      showAddExpenseModal,
      setShowAddExpenseModal,
      showAddIncomeModal,
      setShowAddIncomeModal,
      showScanReceiptModal,
      setShowScanReceiptModal,
      showAddClientModal,
      setShowAddClientModal,
      showAddInvoiceModal,
      setShowAddInvoiceModal,
      showAddEventModal,
      setShowAddEventModal,
      selectedClient,
      setSelectedClient,
      selectedInvoice,
      setSelectedInvoice,
      selectedExpense,
      setSelectedExpense
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
