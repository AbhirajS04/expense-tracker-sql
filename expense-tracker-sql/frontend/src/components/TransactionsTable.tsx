import { Transaction } from '../types';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { ArrowDownLeft, ArrowUpRight, FileText } from 'lucide-react';

type Props = {
  data: Transaction[];
};

const rowVariants = {
  initial: { opacity: 0, x: -8 },
  animate: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.3, delay: i * 0.04, ease: 'easeOut' },
  }),
};

export const TransactionsTable = ({ data }: Props) => (
  <div className="overflow-hidden rounded-2xl border border-white/5 bg-card/50 backdrop-blur-sm">
    <table className="min-w-full text-sm">
      <thead>
        <tr className="border-b border-white/5">
          <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Date</th>
          <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Type</th>
          <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Category</th>
          <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Amount</th>
          <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Note</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-white/[0.03]">
        {data.map((tx, i) => (
          <motion.tr
            key={tx.id}
            custom={i}
            variants={rowVariants}
            initial="initial"
            animate="animate"
            className="group hover:bg-white/[0.03] transition-colors duration-200"
          >
            <td className="px-5 py-3.5 text-slate-300 whitespace-nowrap">
              {new Date(tx.transactionDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
            </td>
            <td className="px-5 py-3.5">
              <span className={clsx('badge gap-1', tx.type === 'INCOME' ? 'badge-income' : 'badge-expense')}>
                {tx.type === 'INCOME' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownLeft className="h-3 w-3" />}
                {tx.type}
              </span>
            </td>
            <td className="px-5 py-3.5">
              <span className="inline-flex items-center gap-1.5 text-slate-200">
                <span className="h-2 w-2 rounded-full bg-accent/60" />
                {tx.categoryName}
              </span>
            </td>
            <td className={clsx('px-5 py-3.5 font-semibold tabular-nums', tx.type === 'INCOME' ? 'text-emerald-400' : 'text-rose-400')}>
              {tx.type === 'EXPENSE' ? '-' : '+'}₹{tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </td>
            <td className="px-5 py-3.5 text-slate-500 max-w-[200px] truncate">
              {tx.note ? (
                <span className="flex items-center gap-1">
                  <FileText className="h-3 w-3 flex-shrink-0" />
                  {tx.note}
                </span>
              ) : (
                <span className="text-slate-600">—</span>
              )}
            </td>
          </motion.tr>
        ))}
        {data.length === 0 && (
          <tr>
            <td colSpan={5} className="px-5 py-10 text-center text-slate-500">
              No transactions found
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
);
