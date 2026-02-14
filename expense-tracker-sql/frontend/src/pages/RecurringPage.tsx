import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../lib/api';
import { Card } from '../components/Card';
import { Plus, Calendar, Repeat, AlertCircle, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

type TransactionType = 'EXPENSE' | 'INCOME';
type RecurrenceFrequency = 'DAILY' | 'WEEKLY' | 'MONTHLY';

type Category = {
  id: number;
  name: string;
  type: TransactionType;
};

type RecurringPayment = {
  id: number;
  type: TransactionType;
  category: Category;
  amount: number;
  note: string;
  frequency: RecurrenceFrequency;
  nextRun: string;
  active: boolean;
};

const frequencyOptions: { value: RecurrenceFrequency; label: string; icon: string }[] = [
  { value: 'DAILY', label: 'Daily', icon: '📅' },
  { value: 'WEEKLY', label: 'Weekly', icon: '📆' },
  { value: 'MONTHLY', label: 'Monthly', icon: '🗓️' }
];

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export const RecurringPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [payments, setPayments] = useState<RecurringPayment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState(() => ({
    type: 'EXPENSE' as TransactionType,
    categoryId: 0,
    amount: '',
    frequency: 'MONTHLY' as RecurrenceFrequency,
    nextRun: new Date().toISOString().slice(0, 10),
    note: '',
  }));

  const loadCategories = async () => {
    const res = await api.get<Category[]>('/categories');
    const data = res.data ?? [];
    setCategories(data);
    if (data.length && form.categoryId === 0) {
      setForm((f) => ({ ...f, categoryId: data[0].id }));
    }
  };

  const loadRecurring = async () => {
    const res = await api.get('/recurring');
    let list: RecurringPayment[] = [];
    if (Array.isArray(res.data)) {
      list = res.data;
    } else if (res.data && Array.isArray(res.data.content)) {
      list = res.data.content;
    } else if (res.data) {
      list = [res.data as RecurringPayment];
    }
    setPayments(list);
  };

  useEffect(() => {
    loadCategories();
    loadRecurring();
  }, []);

  const normalizeDate = (value: string) => {
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
    const match = value.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/);
    if (match) {
      const [, d, m, y] = match;
      return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    }
    return value;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const normalizedAmountStr = form.amount.replace(',', '.');
    const amountNum = Number(normalizedAmountStr);
    if (!form.amount || Number.isNaN(amountNum) || amountNum <= 0) {
      setError('Amount must be greater than 0');
      return;
    }
    const nextRunIso = normalizeDate(form.nextRun);
    if (!form.nextRun) {
      setError('Next run date is required');
      return;
    }
    if (Number.isNaN(Date.parse(nextRunIso))) {
      setError('Next run date format should be YYYY-MM-DD');
      return;
    }
    if (!form.categoryId) {
      setError('Please select a category');
      return;
    }

    setSaving(true);
    try {
      await api.post('/recurring', {
        type: form.type,
        categoryId: Number(form.categoryId),
        amount: amountNum,
        frequency: form.frequency,
        nextRun: nextRunIso,
        note: form.note,
      });

      setForm((f) => ({
        ...f,
        amount: '',
        note: '',
        nextRun: new Date().toISOString().slice(0, 10),
      }));
      setShowForm(false);
      await loadRecurring();
    } catch (err: any) {
      const resp = err?.response;
      const msg =
        resp?.data?.message ||
        resp?.data?.error ||
        (Array.isArray(resp?.data?.errors) && resp.data.errors.join(', ')) ||
        (typeof resp?.data === 'object' && JSON.stringify(resp.data)) ||
        (typeof resp?.data === 'string' && resp.data) ||
        resp?.statusText ||
        'Failed to save recurring payment';
      setError(msg);
    }
    setSaving(false);
  };

  const frequencyColor = (freq: RecurrenceFrequency) => {
    switch (freq) {
      case 'DAILY': return 'text-amber-400 bg-amber-500/10';
      case 'WEEKLY': return 'text-blue-400 bg-blue-500/10';
      case 'MONTHLY': return 'text-violet-400 bg-violet-500/10';
    }
  };

  return (
    <motion.div initial="initial" animate="animate" className="space-y-8">
      {/* Header */}
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Recurring Payments</h1>
          <p className="mt-1 text-sm text-slate-500">Automate your regular transactions</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowForm(!showForm)}
          className="btn-primary"
        >
          <Plus className="h-4 w-4" />
          {showForm ? 'Cancel' : 'New Recurring'}
        </motion.button>
      </motion.div>

      {/* Add form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card title="New Recurring Payment" subtitle="Set up an automatic transaction" gradient>
              <form className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" onSubmit={submit}>
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1.5 block">Type</label>
                  <select className="input" value={form.type} onChange={(e) => {
                    const newType = e.target.value as TransactionType;
                    const filtered = categories.filter((c) => c.type === newType);
                    setForm((f) => ({ ...f, type: newType, categoryId: filtered.length ? filtered[0].id : 0 }));
                  }}>
                    <option value="EXPENSE">Expense</option>
                    <option value="INCOME">Income</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1.5 block">Category</label>
                  <select className="input" value={form.categoryId} onChange={(e) => setForm((f) => ({ ...f, categoryId: Number(e.target.value) }))}>
                    {categories
                      .filter((c) => c.type === form.type)
                      .map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1.5 block">Amount</label>
                  <input className="input" type="number" min="0.01" step="0.01" required placeholder="0.00" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1.5 block">Frequency</label>
                  <div className="grid grid-cols-3 gap-2">
                    {frequencyOptions.map((fo) => (
                      <button
                        key={fo.value}
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, frequency: fo.value }))}
                        className={`rounded-xl px-2 py-2 text-xs font-medium transition-all border ${
                          form.frequency === fo.value
                            ? 'border-accent/30 bg-accent/10 text-accent'
                            : 'border-white/10 bg-white/5 text-slate-400 hover:bg-white/10'
                        }`}
                      >
                        {fo.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1.5 block">Next Run Date</label>
                  <input className="input" type="date" max={new Date().toISOString().slice(0, 10)} required value={form.nextRun} onChange={(e) => setForm((f) => ({ ...f, nextRun: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1.5 block">Note (optional)</label>
                  <input className="input" placeholder="Add a note..." value={form.note} onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))} />
                </div>

                <div className="md:col-span-2 lg:col-span-3 flex items-center justify-between">
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="flex items-center gap-2 text-sm text-rose-400"
                      >
                        <AlertCircle className="h-4 w-4" />
                        {error}
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="btn-primary ml-auto" type="submit" disabled={saving || categories.length === 0}>
                    {saving ? 'Saving...' : 'Save Payment'}
                  </motion.button>
                </div>
              </form>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Payments list */}
      <motion.div variants={fadeUp}>
        {payments.length === 0 ? (
          <Card>
            <div className="flex flex-col items-center justify-center py-12 text-slate-500">
              <Repeat className="h-12 w-12 mb-4 text-slate-600" />
              <p className="text-sm font-medium">No recurring payments yet</p>
              <p className="text-xs mt-1">Create your first recurring payment to get started</p>
            </div>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {payments.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="glass rounded-2xl p-5 hover:shadow-glow transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`rounded-xl p-2.5 ${p.type === 'INCOME' ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`}>
                      {p.type === 'INCOME' ? (
                        <ArrowUpRight className="h-4 w-4 text-emerald-400" />
                      ) : (
                        <ArrowDownLeft className="h-4 w-4 text-rose-400" />
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-white">{p.category?.name}</div>
                      <div className="text-xs text-slate-500">{p.type}</div>
                    </div>
                  </div>
                  <span className={`badge ${frequencyColor(p.frequency)}`}>
                    {p.frequency}
                  </span>
                </div>
                <div className={`text-2xl font-bold tabular-nums mb-3 ${p.type === 'INCOME' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {p.type === 'INCOME' ? '+' : '-'}₹{p.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Calendar className="h-3 w-3" />
                  Next: {new Date(p.nextRun).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </div>
                {p.note && (
                  <div className="mt-2 text-xs text-slate-500 truncate">{p.note}</div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};
