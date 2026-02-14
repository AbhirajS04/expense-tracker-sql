import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../lib/api';
import { Category, TransactionType } from '../types';
import { Card } from '../components/Card';
import { Plus, Trash2, Tag, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export const CategoriesPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const [type, setType] = useState<TransactionType>('EXPENSE');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const res = await api.get('/categories');
    setCategories(res.data || []);
  };

  useEffect(() => { load(); }, []);

  const addCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await api.post('/categories', { name, type });
      setName('');
      await load();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Error creating category');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await api.delete(`/categories/${id}`);
    await load();
  };

  const incomeCategories = categories.filter(c => c.type === 'INCOME');
  const expenseCategories = categories.filter(c => c.type === 'EXPENSE');

  return (
    <motion.div initial="initial" animate="animate" className="space-y-8">
      {/* Header */}
      <motion.div variants={fadeUp}>
        <h1 className="text-2xl font-bold tracking-tight text-white">Categories</h1>
        <p className="mt-1 text-sm text-slate-500">Organize your transactions into categories</p>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Add form */}
        <motion.div variants={fadeUp}>
          <Card title="New Category" subtitle="Create a category" gradient>
            <form className="space-y-4" onSubmit={addCategory}>
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1.5 block">Name</label>
                <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Groceries" required />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1.5 block">Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setType('EXPENSE')}
                    className={`flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 border ${
                      type === 'EXPENSE'
                        ? 'border-rose-500/30 bg-rose-500/10 text-rose-400'
                        : 'border-white/10 bg-white/5 text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    <ArrowDownLeft className="h-3.5 w-3.5" />
                    Expense
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('INCOME')}
                    className={`flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 border ${
                      type === 'INCOME'
                        ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                        : 'border-white/10 bg-white/5 text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    <ArrowUpRight className="h-3.5 w-3.5" />
                    Income
                  </button>
                </div>
              </div>
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-sm text-rose-400 bg-rose-500/10 rounded-lg px-3 py-2"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="btn-primary w-full" type="submit" disabled={saving}>
                <Plus className="h-4 w-4" />
                {saving ? 'Creating...' : 'Create Category'}
              </motion.button>
            </form>
          </Card>
        </motion.div>

        {/* Expense categories */}
        <motion.div variants={fadeUp}>
          <Card title="Expense Categories" subtitle={`${expenseCategories.length} categories`}>
            <div className="space-y-2">
              <AnimatePresence>
                {expenseCategories.map((c) => (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10, height: 0 }}
                    className="group flex items-center justify-between rounded-xl border border-white/5 px-4 py-3 hover:bg-white/[0.03] transition-all duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-rose-500/10 p-2">
                        <Tag className="h-3.5 w-3.5 text-rose-400" />
                      </div>
                      <span className="font-medium text-slate-200">{c.name}</span>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 transition-all p-1.5 rounded-lg hover:bg-rose-500/10"
                      onClick={() => remove(c.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </motion.button>
                  </motion.div>
                ))}
              </AnimatePresence>
              {expenseCategories.length === 0 && (
                <p className="text-sm text-slate-500 text-center py-6">No expense categories yet</p>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Income categories */}
        <motion.div variants={fadeUp}>
          <Card title="Income Categories" subtitle={`${incomeCategories.length} categories`}>
            <div className="space-y-2">
              <AnimatePresence>
                {incomeCategories.map((c) => (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10, height: 0 }}
                    className="group flex items-center justify-between rounded-xl border border-white/5 px-4 py-3 hover:bg-white/[0.03] transition-all duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-emerald-500/10 p-2">
                        <Tag className="h-3.5 w-3.5 text-emerald-400" />
                      </div>
                      <span className="font-medium text-slate-200">{c.name}</span>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 transition-all p-1.5 rounded-lg hover:bg-rose-500/10"
                      onClick={() => remove(c.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </motion.button>
                  </motion.div>
                ))}
              </AnimatePresence>
              {incomeCategories.length === 0 && (
                <p className="text-sm text-slate-500 text-center py-6">No income categories yet</p>
              )}
            </div>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};
