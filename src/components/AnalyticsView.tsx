import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  AreaChart, 
  Area 
} from 'recharts';
import { Download, PieChart as PieIcon, TrendingUp, BarChart2 } from 'lucide-react';
import { Transaction, Category } from '../types';
import { formatCurrency } from '../utils/formatters';
import { MONTHLY_SPENDING_HISTORY } from '../data/mockData';

interface AnalyticsViewProps {
  transactions: Transaction[];
  categories: Category[];
  currency: string;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  transactions,
  categories,
  currency,
}) => {
  // Compute category spending breakdown
  const categoryData = categories
    .map((cat) => {
      const spent = transactions
        .filter((t) => t.categoryId === cat.id && t.type === 'outflow')
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        name: cat.name,
        value: Math.round(spent),
        color: cat.color || '#625981',
      };
    })
    .filter((c) => c.value > 0);

  const totalOutflow = categoryData.reduce((sum, c) => sum + c.value, 0);

  // Soft palette colors for charts
  const CHART_COLORS = ['#625981', '#8a7db3', '#5e604d', '#79757e', '#60577f', '#938ab8', '#636451'];

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#1a1c1a]">Financial Analytics & Reports</h2>
          <p className="text-xs text-[#79757e]">In-depth visual breakdown of your cash velocity and category distribution.</p>
        </div>
      </div>

      {/* Grid Row 1: Donut Breakdown + Income vs Expenses Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Category Expense Distribution Donut */}
        <div className="bg-[#ffffff] rounded-2xl p-6 border border-[#e3e2e0] shadow-paper space-y-4">
          <div className="flex items-center space-x-2">
            <PieIcon className="w-5 h-5 text-[#625981]" />
            <h3 className="text-lg font-bold text-[#1a1c1a]">Outflow Distribution</h3>
          </div>

          <div className="h-64 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any) => [formatCurrency(value, currency), 'Spent']}
                  contentStyle={{ backgroundColor: '#FAF9F6', borderRadius: '12px', borderColor: '#E3E2E0' }}
                />
              </PieChart>
            </ResponsiveContainer>
            
            <div className="absolute text-center pointer-events-none">
              <span className="block text-2xl font-bold text-[#1a1c1a]">{formatCurrency(totalOutflow, currency)}</span>
              <span className="text-[10px] text-[#79757e] uppercase font-bold">Total Spent</span>
            </div>
          </div>

          {/* Category Legend List */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#f4f3f1]">
            {categoryData.map((item, idx) => {
              const pct = Math.round((item.value / (totalOutflow || 1)) * 100);
              return (
                <div key={idx} className="flex items-center justify-between text-xs p-1.5 rounded-lg bg-[#faf9f6]">
                  <div className="flex items-center space-x-2 truncate">
                    <span 
                      className="w-2.5 h-2.5 rounded-full shrink-0" 
                      style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }}
                    ></span>
                    <span className="text-[#1a1c1a] font-medium truncate">{item.name}</span>
                  </div>
                  <span className="font-bold text-[#60577f] shrink-0">{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Income vs Expenses Bar Chart */}
        <div className="bg-[#ffffff] rounded-2xl p-6 border border-[#e3e2e0] shadow-paper space-y-4">
          <div className="flex items-center space-x-2">
            <BarChart2 className="w-5 h-5 text-[#625981]" />
            <h3 className="text-lg font-bold text-[#1a1c1a]">Monthly Income vs Expense</h3>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MONTHLY_SPENDING_HISTORY} margin={{ top: 20, right: 10, left: -10, bottom: 0 }}>
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#79757e', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#79757e', fontSize: 12 }} tickFormatter={(v) => `₹${v}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#FAF9F6', borderRadius: '12px', borderColor: '#E3E2E0' }}
                  formatter={(value: any) => [formatCurrency(value, currency), '']}
                />
                <Bar dataKey="income" name="Income" fill="#dcd0ff" radius={[8, 8, 0, 0]} />
                <Bar dataKey="expenses" name="Expenses" fill="#5e604d" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Grid Row 2: Cumulative Savings Trajectory */}
      <div className="bg-[#ffffff] rounded-2xl p-6 border border-[#e3e2e0] shadow-paper space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-[#625981]" />
            <div>
              <h3 className="text-lg font-bold text-[#1a1c1a]">Cumulative Net Savings Growth</h3>
              <p className="text-xs text-[#79757e]">Trajectory of net funds retained month over month</p>
            </div>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={MONTHLY_SPENDING_HISTORY} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="savingsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#dcd0ff" stopOpacity={0.9}/>
                  <stop offset="95%" stopColor="#dcd0ff" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#79757e', fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#79757e', fontSize: 12 }} tickFormatter={(v) => `₹${v}`} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#FAF9F6', borderRadius: '12px', borderColor: '#E3E2E0' }}
                formatter={(value: any) => [formatCurrency(value, currency), 'Savings']}
              />
              <Area type="monotone" dataKey="savings" stroke="#625981" strokeWidth={3} fill="url(#savingsGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};
