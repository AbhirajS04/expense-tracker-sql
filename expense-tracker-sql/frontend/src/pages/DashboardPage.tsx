import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '../lib/api';
import { Category, Transaction } from '../types';
import { StatsGrid } from '../components/StatsGrid';
import { ChartCard } from '../components/ChartCard';
import { TransactionsTable } from '../components/TransactionsTable';
import { Card } from '../components/Card';
import { TrendingUp, TrendingDown, Wallet, Activity, Clock } from 'lucide-react';

type MonthlyReportItem = { month: string; total: number };
type CategoryReportItem = { category: string; total: number };

const stagger = {
  animate: { transition: { staggerChildren: 0.1 } },
};

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

export const DashboardPage = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [monthly, setMonthly] = useState<MonthlyReportItem[]>([]);
  const [byCategory, setByCategory] = useState<CategoryReportItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [txRes, catRes, monthlyRes, catRepRes] = await Promise.all([
          api.get('/transactions', { params: { page: 0, size: 5, sort: 'transactionDate,desc' } }),
          api.get('/categories'),
          api.get('/reports/monthly', { params: { months: 6 } }),
          api.get('/reports/category')
        ]);
        setTransactions(txRes.data.content || txRes.data || []);
        setCategories(catRes.data || []);
        setMonthly(monthlyRes.data || []);
        setByCategory(catRepRes.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const income = transactions.filter(t => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0);
  const expense = transactions.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0);
  const balance = income - expense;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-32 rounded-2xl" />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-80 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-8">
      {/* Page header */}
      <motion.div variants={fadeUp}>
        <h1 className="text-2xl font-bold tracking-tight text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">Overview of your financial activity</p>
      </motion.div>

      {/* Stats */}
      <motion.div variants={fadeUp}>
        <StatsGrid
          stats={[
            { label: 'Total Income', value: `₹${income.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, accent: 'from-emerald-400 to-emerald-600', icon: TrendingUp },
            { label: 'Total Expense', value: `₹${expense.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, accent: 'from-rose-400 to-rose-600', icon: TrendingDown },
            { label: 'Net Balance', value: `₹${balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, accent: 'from-indigo-400 to-violet-600', icon: Wallet },
          ]}
        />
      </motion.div>

      {/* Charts section */}
      <motion.div variants={fadeUp}>
        <div className="section-title flex items-center gap-2">
          <Activity className="h-3.5 w-3.5" />
          Analytics
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <ChartCard
            title="Spending by Category"
            subtitle="Distribution of expenses"
            type="pie"
            data={byCategory.map(c => ({ name: c.category, value: c.total }))}
          />
          <ChartCard
            title="Monthly Trend"
            subtitle="Last 6 months"
            type="area"
            data={monthly.map(m => ({ name: m.month, value: m.total }))}
          />
          <Card title="Top Categories" subtitle="By spending amount">
            <ul className="space-y-3">
              {byCategory.map((c, i) => {
                const maxTotal = Math.max(...byCategory.map(b => b.total), 1);
                const pct = (c.total / maxTotal) * 100;
                return (
                  <motion.li
                    key={c.category}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.06 }}
                    className="space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-300 flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-accent" />
                        {c.category}
                      </span>
                      <span className="font-semibold text-white tabular-nums">₹{c.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, delay: 0.4 + i * 0.06, ease: 'easeOut' }}
                        className="h-full rounded-full bg-gradient-to-r from-accent to-accent2"
                      />
                    </div>
                  </motion.li>
                );
              })}
              {byCategory.length === 0 && <div className="text-slate-500 text-sm py-4 text-center">No data yet</div>}
            </ul>
          </Card>
        </div>
      </motion.div>

      {/* Recent transactions */}
      <motion.div variants={fadeUp}>
        <div className="section-title flex items-center gap-2">
          <Clock className="h-3.5 w-3.5" />
          Recent Transactions
        </div>
        <Card noPadding>
          <TransactionsTable data={transactions.slice(0, 5)} />
        </Card>
      </motion.div>
    </motion.div>
  );
};
