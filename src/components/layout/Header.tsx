import React from 'react';
import { useApp } from '@/contexts/AppContext';
import {
  MenuIcon,
  PlusIcon,
  CameraIcon,
  SearchIcon,
  RefreshIcon
} from '@/components/icons/Icons';

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const {
    currentView,
    refreshData,
    setShowAddExpenseModal,
    setShowAddIncomeModal,
    setShowScanReceiptModal,
    setShowAddClientModal,
    setShowAddInvoiceModal
  } = useApp();

  const [refreshing, setRefreshing] = React.useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  const getViewTitle = () => {
    const titles: Record<string, string> = {
      dashboard: 'Dashboard',
      clients: 'Client Management',
      expenses: 'Expense Tracker',
      receipts: 'Receipt Scanner',
      invoices: 'Invoices & Quotes',
      calendar: 'Calendar & Scheduler',
      reports: 'Reports & Analytics',
      settings: 'Settings'
    };
    return titles[currentView] || 'Dashboard';
  };

  const getQuickAction = () => {
    switch (currentView) {
      case 'clients':
        return { label: 'New Client', action: () => setShowAddClientModal(true) };
      case 'expenses':
        return { label: 'Add Expense', action: () => setShowAddExpenseModal(true) };
      case 'receipts':
        return { label: 'Scan Receipt', action: () => setShowScanReceiptModal(true), icon: CameraIcon };
      case 'invoices':
        return { label: 'Create Invoice', action: () => setShowAddInvoiceModal(true) };
      default:
        return null;
    }
  };

  const quickAction = getQuickAction();

  return (
    <header className="h-16 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
        >
          <MenuIcon size={24} />
        </button>
        
        <h1 className="text-xl font-semibold text-white">{getViewTitle()}</h1>
      </div>

      <div className="flex items-center gap-3">
        {/* Refresh Button */}
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50"
          title="Refresh data"
        >
          <RefreshIcon size={20} className={refreshing ? 'animate-spin' : ''} />
        </button>

        {/* Quick Action Button */}
        {quickAction && (
          <button
            onClick={quickAction.action}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all text-sm font-medium"
          >
            {quickAction.icon ? <quickAction.icon size={18} /> : <PlusIcon size={18} />}
            <span className="hidden sm:inline">{quickAction.label}</span>
          </button>
        )}

        {/* Scan Receipt Button (always visible) */}
        {currentView !== 'receipts' && (
          <button
            onClick={() => setShowScanReceiptModal(true)}
            className="p-2 text-gray-400 hover:text-purple-400 hover:bg-purple-500/20 rounded-lg transition-colors"
            title="Scan Receipt"
          >
            <CameraIcon size={20} />
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
