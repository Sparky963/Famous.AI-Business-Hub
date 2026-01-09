import React from 'react';
import { useApp } from '@/contexts/AppContext';
import {
  DashboardIcon,
  ClientsIcon,
  ExpenseIcon,
  ReceiptIcon,
  InvoiceIcon,
  CalendarIcon,
  ReportsIcon,
  SettingsIcon
} from '@/components/icons/Icons';

interface NavItem {
  id: string;
  label: string;
  icon: React.FC<{ className?: string; size?: number }>;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: DashboardIcon },
  { id: 'clients', label: 'Clients', icon: ClientsIcon },
  { id: 'expenses', label: 'Expenses', icon: ExpenseIcon },
  { id: 'receipts', label: 'Receipts', icon: ReceiptIcon },
  { id: 'invoices', label: 'Invoices', icon: InvoiceIcon },
  { id: 'calendar', label: 'Calendar', icon: CalendarIcon },
  { id: 'reports', label: 'Reports', icon: ReportsIcon },
  { id: 'settings', label: 'Settings', icon: SettingsIcon },
];

interface SidebarProps {
  collapsed?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed = false, onClose }) => {
  const { currentView, setCurrentView, stats } = useApp();

  const handleNavClick = (id: string) => {
    setCurrentView(id);
    onClose?.();
  };

  return (
    <aside className={`h-full bg-gray-900 border-r border-gray-800 flex flex-col ${collapsed ? 'w-16' : 'w-64'}`}>
      {/* Logo */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
            <ReceiptIcon className="text-white" size={20} />
          </div>
          {!collapsed && (
            <div>
              <h1 className="text-xl font-bold text-white">SparkReceipt</h1>
              <p className="text-xs text-gray-500">Business Hub</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                isActive
                  ? 'bg-purple-500/20 text-purple-400'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <Icon size={20} className={isActive ? 'text-purple-400' : ''} />
              {!collapsed && <span className="font-medium">{item.label}</span>}
              
              {/* Badge for pending items */}
              {!collapsed && item.id === 'invoices' && stats.pendingInvoices > 0 && (
                <span className="ml-auto px-2 py-0.5 text-xs bg-yellow-500/20 text-yellow-400 rounded-full">
                  {stats.pendingInvoices}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Quick Stats */}
      {!collapsed && (
        <div className="p-4 border-t border-gray-800">
          <div className="p-3 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg">
            <p className="text-xs text-gray-400 mb-1">This Month</p>
            <p className="text-lg font-bold text-white">
              ${(stats.totalIncome - stats.totalExpenses).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-gray-500">Net Profit</p>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
