import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '../lib/api';
import { Category, Paginated, Transaction, TransactionType } from '../types';
import { Filters } from '../components/Filters';
import { TransactionsTable } from '../components/TransactionsTable';
import { Card } from '../components/Card';
import { Plus, ChevronLeft, ChevronRight, Save } from 'lucide-react';

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export const TransactionsPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [pageData, setPageData] = useState<Paginated<Transaction> | null>(null);
  const [filters, setFilters] = useState<{ type?: TransactionType; categoryId?: number; month?: string }>({});
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    type: 'EXPENSE' as TransactionType,
    categoryId: 0,
    amount: '',
    note: '',
    transactionDate: ''
  });

  const loadCategories = async () => {
    const res = await api.get('/categories');
    setCategories(res.data || []);
    if (res.data?.length && form.categoryId === 0) {
      setForm((f) => ({ ...f, categoryId: res.data[0].id }));
    }
  };

  const load = async (page = 0) => {
    const res = await api.get('/transactions', {
      params: { page, size: 10, sort: 'transactionDate,desc', ...filters }
    });
    setPageData(res.data);
  };

  useEffect(() => { loadCategories(); }, []);
  useEffect(() => { load(); }, [filters]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/transactions', {
        type: form.type,
        categoryId: Number(form.categoryId),
        amount: Number(form.amount),
        note: form.note,
        transactionDate: form.transactionDate
      });
      setForm(f => ({ ...f, amount: '', note: '', transactionDate: '' }));
      setShowForm(false);
      await load();
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div initial="initial" animate="animate" className="space-y-6">
      {/* Header */}
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Transactions</h1>
          <p className="mt-1 text-sm text-slate-500">
            {pageData ? `${pageData.totalElements} total transactions` : 'Manage your income and expenses'}
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowForm(!showForm)}
          className="btn-primary"
        >
          <Plus className="h-4 w-4" />
          {showForm ? 'Cancel' : 'New Transaction'}
        </motion.button>
      </motion.div>

      {/* Add form (collapsible) */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card title="Add Transaction" subtitle="Fill in the details below" gradient>
            <form className="grid gap-4 md:grid-cols-2 lg:grid-cols-4" onSubmit={submit}>
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1.5 block">Type</label>
                <select className="input" value={form.type} onChange={(e) => {
                  const newType = e.target.value as TransactionType;
                  const filtered = categories.filter((c) => c.type === newType);
                  setForm({ ...form, type: newType, categoryId: filtered.length ? filtered[0].id : 0 });
                }}>
                  <option value="EXPENSE">Expense</option>
                  <option value="INCOME">Income</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1.5 block">Category</label>
                <select className="input" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: Number(e.target.value) })}>
                  {categories
                    .filter((c) => c.type === form.type)
                    .map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1.5 block">Amount</label>
                <input className="input" type="number" step="0.01" placeholder="0.00" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1.5 block">Date</label>
                <input className="input" type="date" max={new Date().toISOString().slice(0, 10)} value={form.transactionDate} onChange={(e) => setForm({ ...form, transactionDate: e.target.value })} required />
              </div>
              <div className="md:col-span-2 lg:col-span-3">
                <label className="text-xs font-medium text-slate-500 mb-1.5 block">Note (optional)</label>
                <input className="input" placeholder="Add a note..." value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
              </div>
              <div className="flex items-end justify-end">
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="btn-primary w-full" type="submit" disabled={saving}>
                  <Save className="h-4 w-4" />
                  {saving ? 'Saving...' : 'Save'}
                </motion.button>
              </div>
            </form>
          </Card>
        </motion.div>
      )}

      {/* Filters */}
      <Filters
        categories={categories}
        type={filters.type}
        categoryId={filters.categoryId}
        month={filters.month}
        onChange={setFilters}
      />

      {/* Table */}
      <motion.div variants={fadeUp}>
        <TransactionsTable data={pageData?.content || []} />
      </motion.div>

      {/* Pagination */}
      {pageData && pageData.totalPages > 1 && (
        <motion.div variants={fadeUp} className="flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Showing page {pageData.number + 1} of {pageData.totalPages}
          </p>
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-secondary"
              disabled={pageData.number === 0}
              onClick={() => load(pageData.number - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
              Prev
            </motion.button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(pageData.totalPages, 5) }, (_, i) => (
                <button
                  key={i}
                  onClick={() => load(i)}
                  className={`h-8 w-8 rounded-lg text-xs font-semibold transition-all duration-200 ${
                    i === pageData.number
                      ? 'bg-accent/20 text-accent'
                      : 'text-slate-500 hover:bg-white/5'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-secondary"
              disabled={pageData.number + 1 >= pageData.totalPages}
              onClick={() => load(pageData.number + 1)}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </motion.button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};
