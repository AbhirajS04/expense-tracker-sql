import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import {
  LayoutDashboard,
  FolderOpen,
  ArrowLeftRight,
  BarChart3,
  Repeat,
  LogOut,
  Menu,
  X,
  Wallet,
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/categories', label: 'Categories', icon: FolderOpen },
  { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
  { to: '/recurring', label: 'Recurring', icon: Repeat },
];

const sidebarVariants = {
  hidden: { x: -280, opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 30 } },
  exit: { x: -280, opacity: 0, transition: { duration: 0.2 } },
};

export const Layout = () => {
  const { logout } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const currentPage = navItems.find((n) => location.pathname.startsWith(n.to));

  const navContent = (
    <>
      {/* Logo */}
      <div className="flex items-center gap-3 px-2 mb-2">
        <div className="relative h-10 w-10 rounded-xl bg-gradient-to-br from-accent to-accent2 flex items-center justify-center shadow-glow">
          <Wallet className="h-5 w-5 text-base" />
        </div>
        <div>
          <span className="font-bold text-white tracking-tight">Expense</span>
          <span className="font-bold text-accent tracking-tight"> Tracker</span>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-3" />

      {/* Section label */}
      <div className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
        Menu
      </div>

      {/* Nav links */}
      <nav className="flex-1 flex flex-col gap-1">
        {navItems.map((item, i) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                clsx(
                  'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-accent/10 text-accent shadow-inner-glow'
                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                )
              }
              style={{ animationDelay: `${i * 50}ms` }}
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-full bg-accent shadow-glow"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <Icon className={clsx('h-4 w-4 transition-colors', isActive ? 'text-accent' : 'text-slate-500 group-hover:text-slate-300')} />
                  {item.label}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-3" />
      <button
        onClick={logout}
        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition-all duration-200"
      >
        <LogOut className="h-4 w-4" />
        Logout
      </button>
    </>
  );

  return (
    <div className="min-h-screen bg-base text-white flex">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 flex-col gap-1 p-4 sidebar-panel animate-slide-in-left">
        {navContent}
      </aside>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              variants={sidebarVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed left-0 top-0 bottom-0 w-64 flex flex-col gap-1 p-4 sidebar-panel z-50 md:hidden"
            >
              <div className="flex justify-end mb-2">
                <button onClick={() => setMobileOpen(false)} className="p-1 rounded-lg hover:bg-white/10 text-slate-400">
                  <X className="h-5 w-5" />
                </button>
              </div>
              {navContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-4 md:px-6 py-3 border-b border-white/5 bg-base/80 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden p-2 rounded-xl hover:bg-white/5 text-slate-400 transition-colors"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              {currentPage && (
                <motion.div
                  key={currentPage.to}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2"
                >
                  <currentPage.icon className="h-4 w-4 text-accent" />
                  <h1 className="text-sm font-semibold text-white">{currentPage.label}</h1>
                </motion.div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
              <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse-soft" />
              Connected
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};
