import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign, LucideIcon } from 'lucide-react';

type StatCardProps = {
  label: string;
  value: string;
  delta?: string;
  accent?: string;
  icon?: LucideIcon;
};

const container = {
  animate: { transition: { staggerChildren: 0.1 } },
};

const item = {
  initial: { opacity: 0, y: 24, scale: 0.96 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: 'easeOut' } },
};

const StatCard = ({ label, value, delta, accent = 'from-accent to-accent2', icon: Icon }: StatCardProps) => (
  <motion.div variants={item} className="glass rounded-2xl p-5 group hover:shadow-glow transition-shadow duration-300">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <div className="text-xs font-medium uppercase tracking-wider text-slate-500">{label}</div>
        <div className="mt-2 text-2xl font-bold tracking-tight text-white">{value}</div>
        {delta && (
          <div className="mt-2 flex items-center gap-1 text-xs text-slate-400">
            {delta.startsWith('+') ? (
              <TrendingUp className="h-3 w-3 text-emerald-400" />
            ) : delta.startsWith('-') ? (
              <TrendingDown className="h-3 w-3 text-rose-400" />
            ) : null}
            <span>{delta}</span>
          </div>
        )}
      </div>
      {Icon && (
        <div className="rounded-xl bg-white/5 p-2.5 group-hover:bg-white/10 transition-colors">
          <Icon className="h-5 w-5 text-slate-400" />
        </div>
      )}
    </div>
    <div className="mt-4 h-1 rounded-full bg-white/5 overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: '100%' }}
        transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
        className={`h-full rounded-full bg-gradient-to-r ${accent}`}
      />
    </div>
  </motion.div>
);

export const StatsGrid = ({ stats }: { stats: StatCardProps[] }) => (
  <motion.div
    variants={container}
    initial="initial"
    animate="animate"
    className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
  >
    {stats.map((s) => (
      <StatCard key={s.label} {...s} />
    ))}
  </motion.div>
);
