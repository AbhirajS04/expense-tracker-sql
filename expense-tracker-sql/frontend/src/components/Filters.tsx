import { Category, TransactionType } from '../types';
import { motion } from 'framer-motion';
import { SlidersHorizontal, X } from 'lucide-react';

type Props = {
  type?: TransactionType;
  categoryId?: number;
  month?: string;
  categories: Category[];
  onChange: (filters: { type?: TransactionType; categoryId?: number; month?: string }) => void;
};

export const Filters = ({ type, categoryId, month, categories, onChange }: Props) => {
  const hasFilters = type || categoryId || month;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="glass rounded-2xl p-5"
    >
      <div className="flex items-center gap-2 mb-4">
        <SlidersHorizontal className="h-4 w-4 text-accent" />
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Filters</span>
        {hasFilters && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="ml-auto"
          >
            <button
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-rose-400 transition-colors"
              onClick={() => onChange({ type: undefined, categoryId: undefined, month: undefined })}
            >
              <X className="h-3 w-3" />
              Clear all
            </button>
          </motion.span>
        )}
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <div>
          <label className="text-xs font-medium text-slate-500 mb-1.5 block">Type</label>
          <select
            value={type || ''}
            onChange={(e) => {
              const newType = e.target.value as TransactionType || undefined;
              // Reset category if it doesn't match the new type
              const matchedCategory = newType && categoryId
                ? categories.find((c) => c.id === categoryId && c.type === newType)
                : undefined;
              onChange({
                type: newType,
                categoryId: newType ? (matchedCategory ? categoryId : undefined) : categoryId,
                month,
              });
            }}
            className="input"
          >
            <option value="">All types</option>
            <option value="INCOME">Income</option>
            <option value="EXPENSE">Expense</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-slate-500 mb-1.5 block">Category</label>
          <select
            value={categoryId?.toString() || ''}
            onChange={(e) => onChange({ type, categoryId: e.target.value ? Number(e.target.value) : undefined, month })}
            className="input"
          >
            <option value="">All categories</option>
            {categories
              .filter((c) => !type || c.type === type)
              .map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-slate-500 mb-1.5 block">Month</label>
          <input
            type="month"
            value={month || ''}
            max={new Date().toISOString().slice(0, 7)}
            onChange={(e) => onChange({ type, categoryId, month: e.target.value || undefined })}
            className="input"
          />
        </div>
      </div>
    </motion.div>
  );
};
