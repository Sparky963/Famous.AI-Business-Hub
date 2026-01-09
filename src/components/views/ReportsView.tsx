import React, { useState, useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import { supabase } from '@/lib/supabase';
import {
  DownloadIcon,
  ReportsIcon,
  TrendUpIcon,
  TrendDownIcon,
  DollarIcon,
  LoadingSpinner
} from '@/components/icons/Icons';

export const ReportsView: React.FC = () => {
  const { expenses, incomeEntries, categories } = useApp();
  
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [reportPeriod, setReportPeriod] = useState<'week' | 'month' | 'quarter' | 'year' | 'custom'>('year');

  // Set date range based on period
  const handlePeriodChange = (period: typeof reportPeriod) => {
    setReportPeriod(period);
    const now = new Date();
    let start: Date;
    
    switch (period) {
      case 'week':
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'quarter':
        const quarter = Math.floor(now.getMonth() / 3);
        start = new Date(now.getFullYear(), quarter * 3, 1);
        break;
      case 'year':
        start = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        return;
    }
    
    setDateRange({
      start: start.toISOString().split('T')[0],
      end: now.toISOString().split('T')[0]
    });
  };

  // Filter data by date range
  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => {
      if (!e.transaction_date) return false;
      const inDateRange = e.transaction_date >= dateRange.start && e.transaction_date <= dateRange.end;
      const inCategories = selectedCategories.length === 0 || selectedCategories.includes(e.category_name || '');
      return inDateRange && inCategories;
    });
  }, [expenses, dateRange, selectedCategories]);

  const filteredIncome = useMemo(() => {
    return incomeEntries.filter(i => {
      if (!i.income_date) return false;
      return i.income_date >= dateRange.start && i.income_date <= dateRange.end;
    });
  }, [incomeEntries, dateRange]);

  // Calculate report data
  const reportData = useMemo(() => {
    const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.total_amount, 0);
    const totalIncome = filteredIncome.reduce((sum, i) => sum + i.amount, 0);
    const totalTax = filteredExpenses.reduce((sum, e) => sum + (e.tax_amount || 0), 0);
    const taxDeductible = filteredExpenses
      .filter(e => e.is_tax_deductible)
      .reduce((sum, e) => sum + e.total_amount, 0);

    // Category breakdown
    const categoryBreakdown: Record<string, { total: number; count: number; taxDeductible: number }> = {};
    filteredExpenses.forEach(expense => {
      const cat = expense.category_name || 'Uncategorized';
      if (!categoryBreakdown[cat]) {
        categoryBreakdown[cat] = { total: 0, count: 0, taxDeductible: 0 };
      }
      categoryBreakdown[cat].total += expense.total_amount;
      categoryBreakdown[cat].count += 1;
      if (expense.is_tax_deductible) {
        categoryBreakdown[cat].taxDeductible += expense.total_amount;
      }
    });

    // Monthly breakdown
    const monthlyBreakdown: Record<string, { expenses: number; income: number }> = {};
    filteredExpenses.forEach(expense => {
      const month = expense.transaction_date?.substring(0, 7) || 'Unknown';
      if (!monthlyBreakdown[month]) {
        monthlyBreakdown[month] = { expenses: 0, income: 0 };
      }
      monthlyBreakdown[month].expenses += expense.total_amount;
    });
    filteredIncome.forEach(income => {
      const month = income.income_date?.substring(0, 7) || 'Unknown';
      if (!monthlyBreakdown[month]) {
        monthlyBreakdown[month] = { expenses: 0, income: 0 };
      }
      monthlyBreakdown[month].income += income.amount;
    });

    // IRS category breakdown
    const irsBreakdown: Record<string, number> = {};
    filteredExpenses.forEach(expense => {
      if (expense.is_tax_deductible && expense.irs_category) {
        irsBreakdown[expense.irs_category] = (irsBreakdown[expense.irs_category] || 0) + expense.total_amount;
      }
    });

    return {
      totalExpenses,
      totalIncome,
      netProfit: totalIncome - totalExpenses,
      totalTax,
      taxDeductible,
      expenseCount: filteredExpenses.length,
      incomeCount: filteredIncome.length,
      categoryBreakdown: Object.entries(categoryBreakdown).sort((a, b) => b[1].total - a[1].total),
      monthlyBreakdown: Object.entries(monthlyBreakdown).sort((a, b) => a[0].localeCompare(b[0])),
      irsBreakdown: Object.entries(irsBreakdown).sort((a, b) => b[1] - a[1])
    };
  }, [filteredExpenses, filteredIncome]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const exportCSV = async () => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-report', {
        body: {
          format: 'csv',
          startDate: dateRange.start,
          endDate: dateRange.end,
          expenses: filteredExpenses,
          income: filteredIncome
        }
      });
      
      if (error) throw error;
      
      // Download CSV
      const blob = new Blob([data], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sparkreceipt-report-${dateRange.start}-to-${dateRange.end}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export error:', err);
      // Fallback to local export
      let csv = 'SparkReceipt Financial Report\n';
      csv += `Report Period: ${dateRange.start} to ${dateRange.end}\n\n`;
      csv += 'SUMMARY\n';
      csv += `Total Income,${formatCurrency(reportData.totalIncome)}\n`;
      csv += `Total Expenses,${formatCurrency(reportData.totalExpenses)}\n`;
      csv += `Net Profit,${formatCurrency(reportData.netProfit)}\n`;
      csv += `Tax Deductible,${formatCurrency(reportData.taxDeductible)}\n\n`;
      csv += 'EXPENSES BY CATEGORY\n';
      csv += 'Category,Amount,Count,Tax Deductible\n';
      reportData.categoryBreakdown.forEach(([cat, data]) => {
        csv += `${cat},${data.total.toFixed(2)},${data.count},${data.taxDeductible.toFixed(2)}\n`;
      });
      csv += '\nEXPENSE DETAILS\n';
      csv += 'Date,Merchant,Category,Amount,Tax,Deductible\n';
      filteredExpenses.forEach(expense => {
        csv += `${expense.transaction_date},${expense.merchant_name?.replace(/,/g, ' ')},${expense.category_name},${expense.total_amount},${expense.tax_amount || 0},${expense.is_tax_deductible ? 'Yes' : 'No'}\n`;
      });
      
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sparkreceipt-report-${dateRange.start}-to-${dateRange.end}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
    
    setLoading(false);
  };

  const maxExpense = Math.max(...reportData.categoryBreakdown.map(([, d]) => d.total), 1);
  const maxMonthly = Math.max(
    ...reportData.monthlyBreakdown.map(([, d]) => Math.max(d.expenses, d.income)),
    1
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Reports & Analytics</h1>
          <p className="text-gray-400">Financial summaries and tax reports</p>
        </div>
        
        <button
          onClick={exportCSV}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50"
        >
          {loading ? <LoadingSpinner size={18} /> : <DownloadIcon size={18} />}
          Export Report
        </button>
      </div>

      {/* Date Range Selector */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-800/50 border border-gray-700 rounded-xl">
        <div className="flex items-center gap-2">
          {(['week', 'month', 'quarter', 'year', 'custom'] as const).map(period => (
            <button
              key={period}
              onClick={() => handlePeriodChange(period)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                reportPeriod === period
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
          ))}
        </div>
        
        {reportPeriod === 'custom' && (
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
            />
            <span className="text-gray-500">to</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
            />
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-5 bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <TrendUpIcon className="text-green-400" size={20} />
            <span className="text-gray-400 text-sm">Total Income</span>
          </div>
          <p className="text-2xl font-bold text-green-400">{formatCurrency(reportData.totalIncome)}</p>
          <p className="text-xs text-gray-500">{reportData.incomeCount} transactions</p>
        </div>
        
        <div className="p-5 bg-gradient-to-br from-red-500/20 to-red-600/20 border border-red-500/30 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <TrendDownIcon className="text-red-400" size={20} />
            <span className="text-gray-400 text-sm">Total Expenses</span>
          </div>
          <p className="text-2xl font-bold text-red-400">{formatCurrency(reportData.totalExpenses)}</p>
          <p className="text-xs text-gray-500">{reportData.expenseCount} transactions</p>
        </div>
        
        <div className="p-5 bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <DollarIcon className="text-purple-400" size={20} />
            <span className="text-gray-400 text-sm">Net Profit</span>
          </div>
          <p className={`text-2xl font-bold ${reportData.netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {formatCurrency(reportData.netProfit)}
          </p>
        </div>
        
        <div className="p-5 bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <ReportsIcon className="text-blue-400" size={20} />
            <span className="text-gray-400 text-sm">Tax Paid</span>
          </div>
          <p className="text-2xl font-bold text-blue-400">{formatCurrency(reportData.totalTax)}</p>
        </div>
        
        <div className="p-5 bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <DollarIcon className="text-yellow-400" size={20} />
            <span className="text-gray-400 text-sm">Tax Deductible</span>
          </div>
          <p className="text-2xl font-bold text-yellow-400">{formatCurrency(reportData.taxDeductible)}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5">
          <h3 className="text-lg font-semibold text-white mb-4">Monthly Trend</h3>
          <div className="space-y-3">
            {reportData.monthlyBreakdown.map(([month, data]) => (
              <div key={month}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-400">{formatMonth(month)}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-green-400">{formatCurrency(data.income)}</span>
                    <span className="text-red-400">{formatCurrency(data.expenses)}</span>
                  </div>
                </div>
                <div className="flex gap-1 h-4">
                  <div
                    className="bg-green-500 rounded-l"
                    style={{ width: `${(data.income / maxMonthly) * 50}%` }}
                  />
                  <div
                    className="bg-red-500 rounded-r"
                    style={{ width: `${(data.expenses / maxMonthly) * 50}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded" />
              <span className="text-gray-400">Income</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded" />
              <span className="text-gray-400">Expenses</span>
            </div>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5">
          <h3 className="text-lg font-semibold text-white mb-4">Expenses by Category</h3>
          <div className="space-y-3">
            {reportData.categoryBreakdown.slice(0, 8).map(([category, data]) => (
              <div key={category}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-300">{category}</span>
                  <span className="text-white font-medium">{formatCurrency(data.total)}</span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                    style={{ width: `${(data.total / maxExpense) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* IRS Categories */}
      {reportData.irsBreakdown.length > 0 && (
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5">
          <h3 className="text-lg font-semibold text-white mb-4">Tax Deductions by IRS Category</h3>
          <p className="text-sm text-gray-400 mb-4">
            These expenses may be deductible on your Schedule C (Form 1040)
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reportData.irsBreakdown.map(([category, amount]) => (
              <div key={category} className="p-4 bg-gray-700/50 rounded-lg">
                <p className="text-sm text-gray-400">{category}</p>
                <p className="text-xl font-bold text-green-400">{formatCurrency(amount)}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <p className="text-sm text-yellow-400">
              <strong>Disclaimer:</strong> This is for informational purposes only. Consult a tax professional for advice.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsView;
