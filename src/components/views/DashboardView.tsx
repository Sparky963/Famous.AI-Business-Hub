import React, { useState, useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import {
  DollarIcon,
  TrendUpIcon,
  TrendDownIcon,
  CalendarIcon,
  ReceiptIcon,
  InvoiceIcon,
  ClientsIcon,
  PlusIcon,
  CameraIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@/components/icons/Icons';

export const DashboardView: React.FC = () => {
  const {
    stats,
    expenses,
    incomeEntries,
    events,
    invoices,
    clients,
    setShowAddExpenseModal,
    setShowAddIncomeModal,
    setShowScanReceiptModal,
    setShowAddClientModal,
    setCurrentView
  } = useApp();

  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Calendar logic
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPadding = firstDay.getDay();
    const days: { date: Date; isCurrentMonth: boolean; events: any[] }[] = [];

    // Previous month padding
    for (let i = startPadding - 1; i >= 0; i--) {
      const date = new Date(year, month, -i);
      days.push({ date, isCurrentMonth: false, events: [] });
    }

    // Current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const date = new Date(year, month, i);
      const dateStr = date.toISOString().split('T')[0];
      const dayEvents = events.filter(e => e.event_date === dateStr);
      const dayInvoices = invoices.filter(i => i.due_date === dateStr);
      days.push({
        date,
        isCurrentMonth: true,
        events: [...dayEvents, ...dayInvoices.map(inv => ({
          ...inv,
          title: `Payment Due: ${inv.invoice_number}`,
          color: inv.status === 'paid' ? '#10B981' : inv.status === 'partial' ? '#F59E0B' : '#EF4444',
          is_payment_due: true
        }))]
      });
    }

    // Next month padding
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      const date = new Date(year, month + 1, i);
      days.push({ date, isCurrentMonth: false, events: [] });
    }

    return days;
  }, [currentMonth, events, invoices]);

  const monthlyData = useMemo(() => {
    const monthStr = currentMonth.toISOString().substring(0, 7);
    const monthExpenses = expenses.filter(e => e.transaction_date?.startsWith(monthStr));
    const monthIncome = incomeEntries.filter(i => i.income_date?.startsWith(monthStr));
    
    return {
      expenses: monthExpenses.reduce((sum, e) => sum + e.total_amount, 0),
      income: monthIncome.reduce((sum, i) => sum + i.amount, 0),
      expenseCount: monthExpenses.length,
      incomeCount: monthIncome.length
    };
  }, [currentMonth, expenses, incomeEntries]);

  const upcomingEvents = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return events
      .filter(e => e.event_date >= today)
      .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime())
      .slice(0, 5);
  }, [events]);

  const recentExpenses = useMemo(() => {
    return [...expenses]
      .sort((a, b) => new Date(b.transaction_date || '').getTime() - new Date(a.transaction_date || '').getTime())
      .slice(0, 5);
  }, [expenses]);

  const pendingInvoicesList = useMemo(() => {
    return invoices
      .filter(i => i.status === 'pending' || i.status === 'partial')
      .slice(0, 5);
  }, [invoices]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          onClick={() => setShowAddExpenseModal(true)}
          className="flex items-center gap-3 p-4 bg-gradient-to-br from-red-500/20 to-red-600/20 border border-red-500/30 rounded-xl hover:from-red-500/30 hover:to-red-600/30 transition-all group"
        >
          <div className="p-2 bg-red-500/20 rounded-lg group-hover:bg-red-500/30 transition-colors">
            <PlusIcon className="text-red-400" size={20} />
          </div>
          <span className="text-white font-medium">Add Expense</span>
        </button>
        
        <button
          onClick={() => setShowAddIncomeModal(true)}
          className="flex items-center gap-3 p-4 bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-xl hover:from-green-500/30 hover:to-green-600/30 transition-all group"
        >
          <div className="p-2 bg-green-500/20 rounded-lg group-hover:bg-green-500/30 transition-colors">
            <PlusIcon className="text-green-400" size={20} />
          </div>
          <span className="text-white font-medium">Add Income</span>
        </button>
        
        <button
          onClick={() => setShowScanReceiptModal(true)}
          className="flex items-center gap-3 p-4 bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-xl hover:from-purple-500/30 hover:to-purple-600/30 transition-all group"
        >
          <div className="p-2 bg-purple-500/20 rounded-lg group-hover:bg-purple-500/30 transition-colors">
            <CameraIcon className="text-purple-400" size={20} />
          </div>
          <span className="text-white font-medium">Scan Receipt</span>
        </button>
        
        <button
          onClick={() => setShowAddClientModal(true)}
          className="flex items-center gap-3 p-4 bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-xl hover:from-blue-500/30 hover:to-blue-600/30 transition-all group"
        >
          <div className="p-2 bg-blue-500/20 rounded-lg group-hover:bg-blue-500/30 transition-colors">
            <ClientsIcon className="text-blue-400" size={20} />
          </div>
          <span className="text-white font-medium">New Client</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-5 bg-gray-800/50 border border-gray-700 rounded-xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <TrendUpIcon className="text-green-400" size={20} />
            </div>
            <span className="text-gray-400 text-sm">Total Income</span>
          </div>
          <p className="text-2xl font-bold text-green-400">{formatCurrency(stats.totalIncome)}</p>
        </div>
        
        <div className="p-5 bg-gray-800/50 border border-gray-700 rounded-xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-red-500/20 rounded-lg">
              <TrendDownIcon className="text-red-400" size={20} />
            </div>
            <span className="text-gray-400 text-sm">Total Expenses</span>
          </div>
          <p className="text-2xl font-bold text-red-400">{formatCurrency(stats.totalExpenses)}</p>
        </div>
        
        <div className="p-5 bg-gray-800/50 border border-gray-700 rounded-xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <DollarIcon className="text-purple-400" size={20} />
            </div>
            <span className="text-gray-400 text-sm">Net Profit</span>
          </div>
          <p className={`text-2xl font-bold ${stats.netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {formatCurrency(stats.netProfit)}
          </p>
        </div>
        
        <div className="p-5 bg-gray-800/50 border border-gray-700 rounded-xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-yellow-500/20 rounded-lg">
              <InvoiceIcon className="text-yellow-400" size={20} />
            </div>
            <span className="text-gray-400 text-sm">Pending Invoices</span>
          </div>
          <p className="text-2xl font-bold text-yellow-400">{stats.pendingInvoices}</p>
          <p className="text-sm text-gray-500">{formatCurrency(stats.pendingAmount)} outstanding</p>
        </div>
        
        <div className="p-5 bg-gray-800/50 border border-gray-700 rounded-xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <CalendarIcon className="text-blue-400" size={20} />
            </div>
            <span className="text-gray-400 text-sm">Upcoming Events</span>
          </div>
          <p className="text-2xl font-bold text-blue-400">{stats.upcomingEvents}</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 bg-gray-800/50 border border-gray-700 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">
              {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ChevronLeftIcon className="text-gray-400" size={20} />
              </button>
              <button
                onClick={() => setCurrentMonth(new Date())}
                className="px-3 py-1.5 text-sm text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              >
                Today
              </button>
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ChevronRightIcon className="text-gray-400" size={20} />
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-xs text-gray-500 py-2">{day}</div>
            ))}
            
            {calendarDays.map((day, idx) => {
              const isToday = day.date.toDateString() === new Date().toDateString();
              return (
                <div
                  key={idx}
                  className={`min-h-[80px] p-1 rounded-lg border transition-colors ${
                    day.isCurrentMonth
                      ? isToday
                        ? 'bg-purple-500/20 border-purple-500'
                        : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
                      : 'bg-gray-900/30 border-transparent'
                  }`}
                >
                  <span className={`text-sm ${day.isCurrentMonth ? 'text-white' : 'text-gray-600'}`}>
                    {day.date.getDate()}
                  </span>
                  <div className="mt-1 space-y-0.5">
                    {day.events.slice(0, 2).map((event, i) => (
                      <div
                        key={i}
                        className="text-xs px-1 py-0.5 rounded truncate"
                        style={{ backgroundColor: `${event.color}30`, color: event.color }}
                      >
                        {event.title}
                      </div>
                    ))}
                    {day.events.length > 2 && (
                      <div className="text-xs text-gray-500">+{day.events.length - 2} more</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Monthly Summary */}
          <div className="mt-4 pt-4 border-t border-gray-700 grid grid-cols-2 gap-4">
            <div className="p-3 bg-green-500/10 rounded-lg">
              <p className="text-sm text-gray-400">This Month Income</p>
              <p className="text-xl font-bold text-green-400">{formatCurrency(monthlyData.income)}</p>
              <p className="text-xs text-gray-500">{monthlyData.incomeCount} transactions</p>
            </div>
            <div className="p-3 bg-red-500/10 rounded-lg">
              <p className="text-sm text-gray-400">This Month Expenses</p>
              <p className="text-xl font-bold text-red-400">{formatCurrency(monthlyData.expenses)}</p>
              <p className="text-xs text-gray-500">{monthlyData.expenseCount} transactions</p>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Upcoming Events */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Upcoming Events</h3>
              <button
                onClick={() => setCurrentView('calendar')}
                className="text-sm text-purple-400 hover:text-purple-300"
              >
                View All
              </button>
            </div>
            
            {upcomingEvents.length > 0 ? (
              <div className="space-y-3">
                {upcomingEvents.map(event => {
                  const client = clients.find(c => c.id === event.client_id);
                  return (
                    <div key={event.id} className="p-3 bg-gray-700/50 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-white font-medium">{event.title}</p>
                          {client && <p className="text-sm text-gray-400">{client.name}</p>}
                        </div>
                        <span
                          className="px-2 py-0.5 text-xs rounded-full"
                          style={{ backgroundColor: `${event.color}30`, color: event.color }}
                        >
                          {formatDate(event.event_date)}
                        </span>
                      </div>
                      {event.location && (
                        <p className="text-xs text-gray-500 mt-1">{event.location}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No upcoming events</p>
            )}
          </div>

          {/* Pending Invoices */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Pending Invoices</h3>
              <button
                onClick={() => setCurrentView('invoices')}
                className="text-sm text-purple-400 hover:text-purple-300"
              >
                View All
              </button>
            </div>
            
            {pendingInvoicesList.length > 0 ? (
              <div className="space-y-3">
                {pendingInvoicesList.map(invoice => {
                  const client = clients.find(c => c.id === invoice.client_id);
                  return (
                    <div key={invoice.id} className="p-3 bg-gray-700/50 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-white font-medium">{invoice.invoice_number}</p>
                          {client && <p className="text-sm text-gray-400">{client.name}</p>}
                        </div>
                        <span className={`text-sm font-medium ${
                          invoice.status === 'partial' ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                          {formatCurrency(invoice.balance_due)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No pending invoices</p>
            )}
          </div>

          {/* Recent Expenses */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Recent Expenses</h3>
              <button
                onClick={() => setCurrentView('expenses')}
                className="text-sm text-purple-400 hover:text-purple-300"
              >
                View All
              </button>
            </div>
            
            {recentExpenses.length > 0 ? (
              <div className="space-y-3">
                {recentExpenses.map(expense => (
                  <div key={expense.id} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                    <div>
                      <p className="text-white font-medium">{expense.merchant_name}</p>
                      <p className="text-xs text-gray-400">{expense.category_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-red-400 font-medium">-{formatCurrency(expense.total_amount)}</p>
                      <p className="text-xs text-gray-500">{formatDate(expense.transaction_date || '')}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No expenses yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
