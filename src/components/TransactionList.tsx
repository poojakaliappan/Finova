import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  Trash2, 
  Edit3, 
  ArrowUpRight, 
  ArrowDownRight, 
  Utensils, 
  ShoppingBag, 
  Home, 
  Car, 
  Tv, 
  Package, 
  HeartPulse, 
  CircleDollarSign,
  Download,
  Receipt,
  FileText,
  Calendar,
  Sparkles,
  BarChart2,
  PieChart,
  Clock,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Transaction, Category, FilterState } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';

interface TransactionListProps {
  transactions: Transaction[];
  categories: Category[];
  currency: string;
  onOpenAddModal: (mode?: 'manual' | 'scan') => void;
  onEditTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  categories,
  currency,
  onOpenAddModal,
  onEditTransaction,
  onDeleteTransaction,
}) => {
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    selectedCategory: 'all',
    transactionType: 'all',
    dateRange: 'all',
    sortBy: 'date_desc',
  });

  const [onlyRecurring, setOnlyRecurring] = useState(false);
  const [showSmartMonthlyOverview, setShowSmartMonthlyOverview] = useState(true);

  // Recurring commitments summary
  const recurringTransactions = transactions.filter((t) => t.isRecurring && t.type === 'outflow');
  const totalRecurringMonthly = recurringTransactions.reduce((s, t) => s + t.amount, 0);

  // Filter logic
  const filteredTransactions = transactions.filter((tx) => {
    // Search matching
    const matchesSearch = 
      tx.title.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
      (tx.merchant && tx.merchant.toLowerCase().includes(filters.searchQuery.toLowerCase())) ||
      (tx.notes && tx.notes.toLowerCase().includes(filters.searchQuery.toLowerCase()));

    // Category matching
    const matchesCategory = filters.selectedCategory === 'all' || tx.categoryId === filters.selectedCategory;

    // Type matching
    const matchesType = filters.transactionType === 'all' || tx.type === filters.transactionType;

    // Recurring matching
    const matchesRecurring = !onlyRecurring || Boolean(tx.isRecurring);

    return matchesSearch && matchesCategory && matchesType && matchesRecurring;
  });

  // Sort logic
  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    if (filters.sortBy === 'date_desc') {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    }
    if (filters.sortBy === 'date_asc') {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    }
    if (filters.sortBy === 'amount_desc') {
      return b.amount - a.amount;
    }
    if (filters.sortBy === 'amount_asc') {
      return a.amount - b.amount;
    }
    return 0;
  });

  // Total sums
  const totalInflow = sortedTransactions
    .filter((t) => t.type === 'inflow')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalOutflow = sortedTransactions
    .filter((t) => t.type === 'outflow')
    .reduce((sum, t) => sum + t.amount, 0);

  // Today & Yesterday cash logic
  const todayStr = '2026-07-23';
  const yesterdayStr = '2026-07-22';

  const todayOutflow = transactions
    .filter((t) => t.type === 'outflow' && t.date === todayStr)
    .reduce((s, t) => s + t.amount, 0);

  const yesterdayOutflow = transactions
    .filter((t) => t.type === 'outflow' && t.date === yesterdayStr)
    .reduce((s, t) => s + t.amount, 0);

  // Group by date for per-day cash breakdown
  const dailyBreakdown = transactions
    .filter((t) => t.type === 'outflow')
    .reduce((acc, t) => {
      acc[t.date] = (acc[t.date] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const sortedDates = Object.keys(dailyBreakdown).sort((a, b) => new Date(b).getTime() - new Date(a).getTime()).slice(0, 5);

  // Weekly calculations (last 7 days)
  const weeklyOutflow = transactions
    .filter((t) => t.type === 'outflow')
    .reduce((s, t) => s + t.amount, 0); // Total recent sample

  const renderCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Home': return <Home className="w-4 h-4 text-[#625981]" />;
      case 'Utensils': return <Utensils className="w-4 h-4 text-[#8a7db3]" />;
      case 'ShoppingBag': return <ShoppingBag className="w-4 h-4 text-[#5e604d]" />;
      case 'Tv': return <Tv className="w-4 h-4 text-[#79757e]" />;
      case 'Car': return <Car className="w-4 h-4 text-[#60577f]" />;
      case 'Package': return <Package className="w-4 h-4 text-[#938ab8]" />;
      case 'HeartPulse': return <HeartPulse className="w-4 h-4 text-[#636451]" />;
      default: return <CircleDollarSign className="w-4 h-4 text-[#625981]" />;
    }
  };

  const handleExportCSV = () => {
    const headers = ['Date', 'Title', 'Type', 'Amount', 'Category', 'Merchant', 'Payment Method', 'Notes'];
    const csvRows = [
      headers.join(','),
      ...sortedTransactions.map((t) => [
        `"${t.date}"`,
        `"${t.title.replace(/"/g, '""')}"`,
        `"${t.type}"`,
        t.amount,
        `"${t.categoryName}"`,
        `"${(t.merchant || '').replace(/"/g, '""')}"`,
        `"${t.paymentMethod}"`,
        `"${(t.notes || '').replace(/"/g, '""')}"`
      ].join(','))
    ];

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finova_transactions_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Generate and Download PDF Report
  const handleExportPDF = () => {
    const doc = new jsPDF();

    // Header Title
    doc.setFillColor(26, 28, 26); // #1A1C1A dark theme
    doc.rect(0, 0, 210, 32, 'F');
    
    doc.setTextColor(250, 249, 246);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('FINOVA', 14, 18);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Monthly Financial Ledger & Statement', 14, 25);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 140, 25);

    // Summary Box
    doc.setTextColor(26, 28, 26);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Monthly Summary (July 2026)', 14, 42);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total Inflow: ${currency} ${totalInflow.toLocaleString('en-IN')}`, 14, 50);
    doc.text(`Total Outflow: ${currency} ${totalOutflow.toLocaleString('en-IN')}`, 14, 56);
    doc.text(`Net Cash Flow: ${currency} ${(totalInflow - totalOutflow).toLocaleString('en-IN')}`, 14, 62);
    doc.text(`Total Transactions: ${sortedTransactions.length}`, 120, 50);

    // Table Data
    const tableHeaders = [['Date', 'Title / Merchant', 'Category', 'Payment Method', 'Type', `Amount (${currency})`]];
    const tableRows = sortedTransactions.map((tx) => [
      tx.date,
      tx.merchant ? `${tx.title} (${tx.merchant})` : tx.title,
      tx.categoryName,
      tx.paymentMethod,
      tx.type.toUpperCase(),
      `${tx.type === 'outflow' ? '-' : '+'}${tx.amount.toLocaleString('en-IN')}`,
    ]);

    autoTable(doc, {
      startY: 70,
      head: tableHeaders,
      body: tableRows,
      headStyles: {
        fillColor: [98, 89, 129], // #625981
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [244, 243, 241],
      },
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
    });

    // Save File
    doc.save(`finova_monthly_statement_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Header & Export Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#1a1c1a]">Transaction Ledger & History</h2>
          <p className="text-xs text-[#79757e]">Filter, search, and export your personal cash flow and expenses.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Smart Monthly Overview Button */}
          <button
            onClick={() => setShowSmartMonthlyOverview(!showSmartMonthlyOverview)}
            className={`flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl text-xs font-extrabold border transition-all shadow-sm ${
              showSmartMonthlyOverview
                ? 'bg-[#1A1C1A] text-[#FAF9F6] border-[#1A1C1A]'
                : 'bg-[#ffffff] text-[#1A1C1A] border-[#E3E2E0] hover:bg-[#FAF9F6]'
            }`}
          >
            <Sparkles className="w-4 h-4 text-[#DCD0FF]" />
            <span>Smart Monthly Overview</span>
          </button>

          <button
            onClick={handleExportPDF}
            className="flex items-center space-x-2 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-[#DCD0FF] hover:bg-[#CCC0EE] text-[#1A1C1A] border border-[#B8A2FF] shadow-sm transition-all"
            title="Download PDF Statement"
          >
            <FileText className="w-4 h-4 text-[#60577F]" />
            <span>Download Monthly PDF</span>
          </button>
        </div>
      </div>

      {/* 3. Smart Monthly Overview Card (Collapsible via button) */}
      {showSmartMonthlyOverview && (
        <div className="bg-[#1A1C1A] text-[#FAF9F6] rounded-3xl p-6 shadow-xl space-y-5 border border-[#2E312F] relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-[#2E312F] pb-3">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-[#DCD0FF]" />
              <h3 className="text-base font-extrabold">Smart Monthly Financial Summary (July 2026)</h3>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[#2E312F] p-4 rounded-2xl border border-[#3E423F]">
              <span className="text-[11px] font-medium text-[#A09CA8] uppercase block">Total Monthly Inflow</span>
              <span className="text-xl font-black text-[#70E000]">
                {formatCurrency(totalInflow, currency)}
              </span>
            </div>

            <div className="bg-[#2E312F] p-4 rounded-2xl border border-[#3E423F]">
              <span className="text-[11px] font-medium text-[#A09CA8] uppercase block">Total Monthly Outflow</span>
              <span className="text-xl font-black text-[#FF8585]">
                {formatCurrency(totalOutflow, currency)}
              </span>
            </div>

            <div className="bg-[#2E312F] p-4 rounded-2xl border border-[#3E423F]">
              <span className="text-[11px] font-medium text-[#A09CA8] uppercase block">Net Savings Margin</span>
              <span className="text-xl font-black text-[#DCD0FF]">
                {formatCurrency(Math.max(0, totalInflow - totalOutflow), currency)}
              </span>
            </div>
          </div>

          <div className="bg-[#252826] p-4 rounded-2xl border border-[#3E423F] text-xs space-y-2">
            <div className="flex items-center space-x-2 text-[#DCD0FF] font-bold">
              <CheckCircle2 className="w-4 h-4 text-[#70E000]" />
              <span>Smart AI Monthly Insight</span>
            </div>
            <p className="text-[#A09CA8] leading-relaxed">
              You have spent <strong>{formatCurrency(totalOutflow, currency)}</strong> this month across {transactions.length} transactions. Your largest expense category was <strong>Shopping</strong> and <strong>Food</strong>. Downloading your official PDF report gives a record for tax filing and budgeting!
            </p>
          </div>
        </div>
      )}

      {/* Filter & Toolbar */}
      <div className="bg-[#ffffff] rounded-2xl p-5 border border-[#e3e2e0] shadow-paper space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-[#79757e]" />
            <input
              type="text"
              placeholder="Search title, merchant..."
              value={filters.searchQuery}
              onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
              className="w-full pl-10 pr-4 py-2 rounded-xl text-xs bg-[#f4f3f1] border border-[#e3e2e0] focus:outline-none focus:border-[#625981] text-[#1a1c1a]"
            />
          </div>

          {/* Category Dropdown */}
          <div>
            <select
              value={filters.selectedCategory}
              onChange={(e) => setFilters({ ...filters, selectedCategory: e.target.value })}
              className="w-full px-3 py-2 rounded-xl text-xs bg-[#f4f3f1] border border-[#e3e2e0] focus:outline-none focus:border-[#625981] text-[#1a1c1a]"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Type Selector (Inflow / Outflow) */}
          <div className="flex bg-[#f4f3f1] p-1 rounded-xl border border-[#e3e2e0]">
            {(['all', 'inflow', 'outflow'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilters({ ...filters, transactionType: type })}
                className={`flex-1 py-1 text-[11px] font-semibold capitalize rounded-lg transition-all ${
                  filters.transactionType === type
                    ? 'bg-[#ffffff] text-[#1a1c1a] shadow-sm'
                    : 'text-[#79757e]'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Sort Selector */}
          <div>
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as any })}
              className="w-full px-3 py-2 rounded-xl text-xs bg-[#f4f3f1] border border-[#e3e2e0] focus:outline-none focus:border-[#625981] text-[#1a1c1a]"
            >
              <option value="date_desc">Newest First</option>
              <option value="date_asc">Oldest First</option>
              <option value="amount_desc">Highest Amount</option>
              <option value="amount_asc">Lowest Amount</option>
            </select>
          </div>

        </div>

        {/* Ledger Summary Pill Bar */}
        <div className="flex flex-wrap items-center justify-between pt-2 border-t border-[#f4f3f1] text-xs font-semibold text-[#48454e] gap-2">
          <div>
            Showing <strong className="text-[#1a1c1a]">{sortedTransactions.length}</strong> entries
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-[#2e6b4e] flex items-center">
              <ArrowDownRight className="w-3.5 h-3.5 mr-1" />
              Inflow: {formatCurrency(totalInflow, currency)}
            </span>
            <span className="text-[#ba1a1a] flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5 mr-1" />
              Outflow: {formatCurrency(totalOutflow, currency)}
            </span>
          </div>
        </div>
      </div>

      {/* Transaction List Table/Cards */}
      <div className="bg-[#ffffff] rounded-2xl border border-[#e3e2e0] shadow-paper overflow-hidden">
        {sortedTransactions.length === 0 ? (
          <div className="p-12 text-center text-[#79757e]">
            <Receipt className="w-12 h-12 mx-auto mb-3 text-[#dcd0ff]" />
            <h3 className="text-base font-bold text-[#1a1c1a]">No matching transactions found</h3>
            <p className="text-xs mt-1">Try adjusting your filters or add a new transaction entry.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#f4f3f1]">
            {sortedTransactions.map((tx) => {
              const category = categories.find((c) => c.id === tx.categoryId);
              const isExpense = tx.type === 'outflow';

              return (
                <div 
                  key={tx.id} 
                  className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#faf9f6] transition-colors"
                >
                  <div className="flex items-start space-x-3.5">
                    <div className="w-10 h-10 rounded-full bg-[#f4f3f1] border border-[#e3e2e0] flex items-center justify-center shrink-0 mt-0.5">
                      {renderCategoryIcon(category?.icon || '')}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <h4 className="text-sm font-bold text-[#1a1c1a]">{tx.title}</h4>
                        {tx.merchant && (
                          <span className="text-xs font-medium text-[#79757e]">
                            @ {tx.merchant}
                          </span>
                        )}
                        {tx.isRecurring && (
                          <span className="bg-[#DCD0FF] text-[#1A1C1A] px-2 py-0.5 rounded-full text-[10px] font-black flex items-center space-x-1 border border-[#B8A2FF]">
                            <RefreshCw className="w-2.5 h-2.5 text-[#60577F]" />
                            <span className="capitalize">{tx.recurringFrequency || 'monthly'}</span>
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-[#79757e] mt-1">
                        <span className="font-medium text-[#60577f]">{tx.categoryName}</span>
                        <span>•</span>
                        <span>{formatDate(tx.date)}</span>
                        <span>•</span>
                        <span className="bg-[#f4f3f1] px-2 py-0.5 rounded-md text-[10px] font-semibold text-[#48454e]">
                          {tx.paymentMethod}
                        </span>
                        {tx.isRecurring && tx.nextDueDate && (
                          <span className="text-[10px] font-bold text-[#27AE60] bg-[#E2F0D9] px-2 py-0.5 rounded-md">
                            📅 Next due: {formatDate(tx.nextDueDate)}
                          </span>
                        )}
                        {tx.notes && (
                          <span className="italic text-[#79757e] truncate max-w-xs">
                            "{tx.notes}"
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end space-x-6 border-t sm:border-t-0 pt-2 sm:pt-0 border-[#f4f3f1]">
                    <div className="text-right">
                      <span className={`text-base font-bold tracking-tight ${isExpense ? 'text-[#1a1c1a]' : 'text-[#2e6b4e]'}`}>
                        {isExpense ? '-' : '+'}{formatCurrency(tx.amount, currency)}
                      </span>
                      <span className="block text-[10px] text-[#79757e] uppercase font-semibold">
                        {tx.type}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => onEditTransaction(tx)}
                        className="p-2 rounded-lg hover:bg-[#e9e8e5] text-[#48454e] transition-colors"
                        title="Edit Entry"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteTransaction(tx.id)}
                        className="p-2 rounded-lg hover:bg-[#ffdad6] text-[#ba1a1a] transition-colors"
                        title="Delete Entry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
