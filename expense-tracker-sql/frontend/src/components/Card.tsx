import { PropsWithChildren } from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

type Props = PropsWithChildren<{
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
  noPadding?: boolean;
  gradient?: boolean;
}>;

export const Card = ({ title, subtitle, actions, className, children, noPadding, gradient }: Props) => (
  <motion.section
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, ease: 'easeOut' }}
    className={clsx(
      'glass rounded-2xl overflow-hidden',
      !noPadding && 'p-5',
      gradient && 'gradient-border',
      className
    )}
  >
    {(title || actions) && (
      <div className={clsx('flex items-center justify-between', noPadding && 'px-5 pt-5', title && 'mb-4')}>
        <div>
          {title && <h3 className="text-sm font-semibold text-white">{title}</h3>}
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    )}
    {children}
  </motion.section>
);
