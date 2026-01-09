import React from 'react';
import { Receipt, IncomeEntry } from '@/types';
import { TrendingUpIcon, TrendingDownIcon, DollarIcon } from '@/components/icons/Icons';

interface MonthlyViewProps {
  expenses: Receipt[];
  income: IncomeEntry[];
  month: string;
  currency?: string;
}

const MonthlyView: React.FC<MonthlyViewProps> = ({ expenses, income, month, currency = 'USD' }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const totalExpenses = expenses.reduce((sum, r) => sum + r.total_amount, 0);
  const totalIncome = income.reduce((sum, i) => sum + i.amount, 0);
  const netProfit = totalIncome - totalExpenses;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-800 border-b border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{month}</h3>
        <div className="mt-2 flex items-center gap-4 text-sm">
          <span className={`font-medium ${netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            Net: {formatCurrency(netProfit)}
          </span>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-slate-700">
        {/* Expenses Column */}
        <div className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
              <TrendingDownIcon size={18} className="text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Expenses</p>
              <p className="font-bold text-red-600 dark:text-red-400">
                {formatCurrency(totalExpenses)}
              </p>
            </div>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {expenses.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">No expenses</p>
            ) : (
              expenses.slice(0, 10).map((expense) => (
                <div 
                  key={expense.id}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                      {expense.merchant_name || 'Unknown'}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatDate(expense.transaction_date)}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-red-600 dark:text-red-400 ml-2">
                    -{formatCurrency(expense.total_amount)}
                  </p>
                </div>
              ))
            )}
            {expenses.length > 10 && (
              <p className="text-xs text-center text-slate-400 pt-2">
                +{expenses.length - 10} more expenses
              </p>
            )}
          </div>
        </div>

        {/* Income Column */}
        <div className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
              <TrendingUpIcon size={18} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Income</p>
              <p className="font-bold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(totalIncome)}
              </p>
            </div>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {income.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">No income</p>
            ) : (
              income.slice(0, 10).map((entry) => (
                <div 
                  key={entry.id}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                      {entry.source_name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatDate(entry.income_date)}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 ml-2">
                    +{formatCurrency(entry.amount)}
                  </p>
                </div>
              ))
            )}
            {income.length > 10 && (
              <p className="text-xs text-center text-slate-400 pt-2">
                +{income.length - 10} more entries
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Net Profit Footer */}
      <div className={`px-6 py-4 ${
        netProfit >= 0 
          ? 'bg-emerald-50 dark:bg-emerald-900/20' 
          : 'bg-red-50 dark:bg-red-900/20'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarIcon size={20} className={netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'} />
            <span className="font-medium text-slate-700 dark:text-slate-300">
              Net {netProfit >= 0 ? 'Profit' : 'Loss'}
            </span>
          </div>
          <span className={`text-xl font-bold ${
            netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'
          }`}>
            {formatCurrency(Math.abs(netProfit))}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MonthlyView;
