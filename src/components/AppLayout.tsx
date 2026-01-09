import React, { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { DashboardView } from '@/components/views/DashboardView';
import { ClientsView } from '@/components/views/ClientsView';
import { ExpensesView } from '@/components/views/ExpensesView';
import { ReceiptsView } from '@/components/views/ReceiptsView';
import { InvoicesView } from '@/components/views/InvoicesView';
import { CalendarView } from '@/components/views/CalendarView';
import { ReportsView } from '@/components/views/ReportsView';
import { SettingsView } from '@/components/views/SettingsView';
import { AddExpenseModal } from '@/components/modals/AddExpenseModal';
import { AddIncomeModal } from '@/components/modals/AddIncomeModal';
import { ScanReceiptModal } from '@/components/modals/ScanReceiptModal';
import { AddClientModal } from '@/components/modals/AddClientModal';
import { AddInvoiceModal } from '@/components/modals/AddInvoiceModal';
import { LoadingSpinner } from '@/components/icons/Icons';

export default function AppLayout() {
  const { currentView, loading } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView />;
      case 'clients':
        return <ClientsView />;
      case 'expenses':
        return <ExpensesView />;
      case 'receipts':
        return <ReceiptsView />;
      case 'invoices':
        return <InvoicesView />;
      case 'calendar':
        return <CalendarView />;
      case 'reports':
        return <ReportsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size={48} className="text-purple-500 mx-auto mb-4" />
          <p className="text-gray-400">Loading SparkReceipt...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 lg:relative lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          {renderView()}
        </main>
      </div>

      {/* Modals */}
      <AddExpenseModal />
      <AddIncomeModal />
      <ScanReceiptModal />
      <AddClientModal />
      <AddInvoiceModal />
    </div>
  );
}
