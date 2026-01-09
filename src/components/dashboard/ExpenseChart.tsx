import React from 'react';

interface CategoryData {
  name: string;
  amount: number;
  color: string;
  percentage: number;
}

interface ExpenseChartProps {
  data: CategoryData[];
  total: number;
  currency?: string;
}

const ExpenseChart: React.FC<ExpenseChartProps> = ({ data, total, currency = 'USD' }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Sort by amount descending
  const sortedData = [...data].sort((a, b) => b.amount - a.amount);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
        Expenses by Category
      </h3>

      {/* Horizontal Bar Chart */}
      <div className="space-y-4">
        {sortedData.slice(0, 6).map((category) => (
          <div key={category.name} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {category.name}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-slate-500 dark:text-slate-400">
                  {category.percentage.toFixed(1)}%
                </span>
                <span className="font-semibold text-slate-900 dark:text-white min-w-[80px] text-right">
                  {formatCurrency(category.amount)}
                </span>
              </div>
            </div>
            <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-500"
                style={{ 
                  width: `${category.percentage}%`,
                  backgroundColor: category.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Total Expenses
          </span>
          <span className="text-xl font-bold text-slate-900 dark:text-white">
            {formatCurrency(total)}
          </span>
        </div>
      </div>

      {/* Legend for remaining categories */}
      {sortedData.length > 6 && (
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
            Other categories:
          </p>
          <div className="flex flex-wrap gap-2">
            {sortedData.slice(6).map((category) => (
              <span 
                key={category.name}
                className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs bg-slate-100 dark:bg-slate-700"
              >
                <span 
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                <span className="text-slate-600 dark:text-slate-300">
                  {category.name}: {formatCurrency(category.amount)}
                </span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseChart;
