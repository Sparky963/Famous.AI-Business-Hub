import React, { useState } from 'react';
import { Receipt, Category, DEFAULT_CATEGORIES } from '@/types';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { DownloadIcon, ReportIcon, CalendarIcon, FilterIcon } from '@/components/icons/Icons';
import { supabase } from '@/lib/supabase';

interface ReportGeneratorProps {
  receipts: Receipt[];
  onClose?: () => void;
}

const ReportGenerator: React.FC<ReportGeneratorProps> = ({ receipts, onClose }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportName, setReportName] = useState(`Expense Report - ${new Date().toLocaleDateString()}`);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [format, setFormat] = useState<'csv' | 'json'>('csv');
  const [generatedReport, setGeneratedReport] = useState<any>(null);

  const categoryOptions = DEFAULT_CATEGORIES
    .filter(c => c.type === 'expense')
    .map((c, idx) => ({
      value: `cat-${idx}`,
      label: c.name,
    }));

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const getFilteredReceipts = () => {
    let filtered = [...receipts];

    if (dateFrom) {
      filtered = filtered.filter(r => r.transaction_date && r.transaction_date >= dateFrom);
    }
    if (dateTo) {
      filtered = filtered.filter(r => r.transaction_date && r.transaction_date <= dateTo);
    }
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(r => r.category_id && selectedCategories.includes(r.category_id));
    }

    return filtered;
  };

  const filteredReceipts = getFilteredReceipts();
  const totalAmount = filteredReceipts.reduce((sum, r) => sum + r.total_amount, 0);
  const totalTax = filteredReceipts.reduce((sum, r) => sum + (r.tax_amount || 0), 0);

  const handleGenerate = async () => {
    setIsGenerating(true);
    
    try {
      // Prepare receipt data with category names
      const receiptsWithCategories = filteredReceipts.map(r => {
        const catIndex = r.category_id ? parseInt(r.category_id.replace('cat-', '')) : -1;
        const category = catIndex >= 0 ? DEFAULT_CATEGORIES[catIndex] : null;
        return {
          ...r,
          category_name: category?.name || 'Uncategorized',
        };
      });

      const { data, error } = await supabase.functions.invoke('generate-report', {
        body: {
          receipts: receiptsWithCategories,
          date_from: dateFrom || 'All time',
          date_to: dateTo || 'Present',
          format,
          report_name: reportName,
        },
      });

      if (error) throw error;

      if (format === 'csv') {
        // Download CSV
        const blob = new Blob([data], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${reportName}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        setGeneratedReport(data);
      }
    } catch (err) {
      console.error('Error generating report:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadJSON = () => {
    if (!generatedReport) return;
    const blob = new Blob([JSON.stringify(generatedReport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportName}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Report Settings */}
      <div className="space-y-4">
        <Input
          label="Report Name"
          value={reportName}
          onChange={(e) => setReportName(e.target.value)}
          placeholder="Enter report name..."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="From Date"
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            icon={<CalendarIcon size={18} />}
          />
          <Input
            label="To Date"
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            icon={<CalendarIcon size={18} />}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Filter by Categories
          </label>
          <div className="flex flex-wrap gap-2">
            {categoryOptions.map((cat) => (
              <button
                key={cat.value}
                onClick={() => {
                  setSelectedCategories(prev => 
                    prev.includes(cat.value)
                      ? prev.filter(c => c !== cat.value)
                      : [...prev, cat.value]
                  );
                }}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  selectedCategories.includes(cat.value)
                    ? 'bg-blue-500 text-white'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
          {selectedCategories.length > 0 && (
            <button
              onClick={() => setSelectedCategories([])}
              className="mt-2 text-sm text-blue-500 hover:text-blue-600"
            >
              Clear all filters
            </button>
          )}
        </div>

        <Select
          label="Export Format"
          value={format}
          options={[
            { value: 'csv', label: 'CSV (Excel compatible)' },
            { value: 'json', label: 'JSON (Data export)' },
          ]}
          onChange={(value) => setFormat(value as 'csv' | 'json')}
        />
      </div>

      {/* Preview Stats */}
      <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4">
        <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
          Report Preview
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-slate-500">Receipts</p>
            <p className="text-lg font-bold text-slate-900 dark:text-white">
              {filteredReceipts.length}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Total Amount</p>
            <p className="text-lg font-bold text-slate-900 dark:text-white">
              {formatCurrency(totalAmount)}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Total Tax</p>
            <p className="text-lg font-bold text-slate-900 dark:text-white">
              {formatCurrency(totalTax)}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Date Range</p>
            <p className="text-sm font-medium text-slate-900 dark:text-white">
              {dateFrom || 'All'} - {dateTo || 'Present'}
            </p>
          </div>
        </div>
      </div>

      {/* Generated Report Preview */}
      {generatedReport && format === 'json' && (
        <div className="bg-slate-900 rounded-xl p-4 overflow-auto max-h-64">
          <pre className="text-xs text-emerald-400">
            {JSON.stringify(generatedReport, null, 2)}
          </pre>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        {onClose && (
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
        )}
        <Button
          variant="primary"
          onClick={handleGenerate}
          loading={isGenerating}
          icon={<DownloadIcon size={18} />}
          className="flex-1"
          disabled={filteredReceipts.length === 0}
        >
          {isGenerating ? 'Generating...' : `Export ${format.toUpperCase()}`}
        </Button>
        {generatedReport && format === 'json' && (
          <Button
            variant="secondary"
            onClick={downloadJSON}
            icon={<DownloadIcon size={18} />}
          >
            Download
          </Button>
        )}
      </div>

      {filteredReceipts.length === 0 && (
        <p className="text-sm text-center text-amber-600 dark:text-amber-400">
          No receipts match your filters. Adjust the date range or categories.
        </p>
      )}
    </div>
  );
};

export default ReportGenerator;
