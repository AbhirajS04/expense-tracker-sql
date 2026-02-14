import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '../lib/api';
import { ChartCard } from '../components/ChartCard';
import { Card } from '../components/Card';
import { BarChart3, Calendar } from 'lucide-react';

type MonthlyReportItem = { month: string; total: number };
type CategoryReportItem = { category: string; total: number };

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.1 } },
};

export const ReportsPage = () => {
  const [monthly, setMonthly] = useState<MonthlyReportItem[]>([]);
  const [byCategory, setByCategory] = useState<CategoryReportItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const [mRes, cRes] = await Promise.all([
        api.get('/reports/monthly', { params: { months: 6 } }),
        api.get('/reports/category')
      ]);
      setMonthly(mRes.data || []);
      setByCategory(cRes.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const totalSpent = monthly.reduce((s, m) => s + m.total, 0);
  const avgMonthly = monthly.length ? totalSpent / monthly.length : 0;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="skeleton h-8 w-48 rounded-lg" />
        <div className="grid gap-4 lg:grid-cols-2">
          {[1, 2, 3].map(i => <div key={i} className="skeleton h-80 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-8">
      {/* Header */}
      <motion.div variants={fadeUp}>
        <h1 className="text-2xl font-bold tracking-tight text-white">Reports</h1>
        <p className="mt-1 text-sm text-slate-500">Analyze your spending patterns</p>
      </motion.div>

      {/* Quick stats */}
      <motion.div variants={fadeUp} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-accent/10 p-2.5">
              <BarChart3 className="h-5 w-5 text-accent" />
            </div>
            <div>
              <div className="text-xs font-medium uppercase tracking-wider text-slate-500">Total Spent</div>
              <div className="text-xl font-bold text-white">₹{totalSpent.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
            </div>
          </div>
        </div>
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-accent2/10 p-2.5">
              <Calendar className="h-5 w-5 text-accent2" />
            </div>
            <div>
              <div className="text-xs font-medium uppercase tracking-wider text-slate-500">Avg / Month</div>
              <div className="text-xl font-bold text-white">₹{avgMonthly.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
            </div>
          </div>
        </div>
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-500/10 p-2.5">
              <BarChart3 className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <div className="text-xs font-medium uppercase tracking-wider text-slate-500">Categories</div>
              <div className="text-xl font-bold text-white">{byCategory.length}</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Charts */}
      <motion.div variants={fadeUp} className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Spending Trend" subtitle="Monthly expense overview" type="area" data={monthly.map(m => ({ name: m.month, value: m.total }))} />
        <ChartCard title="By Category" subtitle="Expense distribution" type="pie" data={byCategory.map(c => ({ name: c.category, value: c.total }))} />
      </motion.div>

      {/* Monthly breakdown */}
      <motion.div variants={fadeUp}>
        <Card title="Monthly Breakdown" subtitle="Detailed spending per month">
          <div className="space-y-3">
            {monthly.map((m, i) => {
              const maxTotal = Math.max(...monthly.map(x => x.total), 1);
              const pct = (m.total / maxTotal) * 100;
              return (
                <motion.div
                  key={m.month}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.05 }}
                  className="space-y-1.5"
                >
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-300">{m.month}</span>
                    <span className="font-semibold text-white tabular-nums">₹{m.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, delay: 0.3 + i * 0.05, ease: 'easeOut' }}
                      className="h-full rounded-full bg-gradient-to-r from-accent to-accent2"
                    />
                  </div>
                </motion.div>
              );
            })}
            {monthly.length === 0 && <div className="text-slate-500 text-sm text-center py-6">No data yet</div>}
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
};
