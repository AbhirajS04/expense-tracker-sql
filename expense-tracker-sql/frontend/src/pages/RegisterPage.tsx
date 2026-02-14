import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Wallet, Mail, Lock, ArrowRight, Loader2, UserPlus, Check, X } from 'lucide-react';

const COMMON_PASSWORDS = ['password', '123456', 'qwerty', 'letmein', 'welcome', 'admin', 'login'];

const passwordChecks = (pw: string) => ({
  length: pw.length >= 12,
  uppercase: /[A-Z]/.test(pw),
  lowercase: /[a-z]/.test(pw),
  number: /[0-9]/.test(pw),
  special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pw),
  noCommon: !COMMON_PASSWORDS.some((w) => pw.toLowerCase().includes(w)),
});

export const RegisterPage = () => {
  const { register } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checks = useMemo(() => passwordChecks(password), [password]);
  const allPassed = Object.values(checks).every(Boolean);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allPassed) {
      setError('Please meet all password requirements');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await register(email, password);
      nav('/dashboard', { replace: true });
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Register failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 -right-32 w-72 h-72 rounded-full bg-accent2/5 blur-3xl animate-float" />
        <div className="absolute bottom-1/3 -left-32 w-64 h-64 rounded-full bg-accent/5 blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative max-w-md w-full"
      >
        <div className="glass rounded-3xl p-8 gradient-border">
          {/* Logo */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.2 }}
            className="flex justify-center mb-8"
          >
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-accent2 to-accent flex items-center justify-center shadow-glow-lg">
              <UserPlus className="h-8 w-8 text-base" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center mb-8"
          >
            <h1 className="text-2xl font-bold text-white">Create account</h1>
            <p className="text-slate-400 mt-2 text-sm">Start tracking your spending today</p>
          </motion.div>

          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="space-y-5"
            onSubmit={handleSubmit}
          >
            <div>
              <label className="text-xs font-medium text-slate-400 mb-1.5 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
                <input
                  className="input pl-12 text-white"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 mb-1.5 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
                <input
                  type="password"
                  className="input pl-12 text-white"
                  placeholder="Min 12 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={12}
                />
              </div>
              {/* Password requirements checklist */}
              {password.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-3 grid grid-cols-2 gap-1.5"
                >
                  {[
                    { key: 'length', label: '12+ characters' },
                    { key: 'uppercase', label: 'Uppercase (A–Z)' },
                    { key: 'lowercase', label: 'Lowercase (a–z)' },
                    { key: 'number', label: 'Number (0–9)' },
                    { key: 'special', label: 'Special (!@#$%^&*)' },
                    { key: 'noCommon', label: 'No common words' },
                  ].map(({ key, label }) => (
                    <div key={key} className="flex items-center gap-1.5 text-xs">
                      {checks[key as keyof typeof checks] ? (
                        <Check className="h-3 w-3 text-emerald-400" />
                      ) : (
                        <X className="h-3 w-3 text-slate-500" />
                      )}
                      <span className={checks[key as keyof typeof checks] ? 'text-emerald-400' : 'text-slate-500'}>
                        {label}
                      </span>
                    </div>
                  ))}
                </motion.div>
              )}
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-sm text-rose-400 bg-rose-500/10 rounded-xl px-4 py-2.5"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="btn-primary w-full py-3"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Create Account
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </motion.button>
          </motion.form>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 text-center text-sm text-slate-500"
          >
            Already have an account?{' '}
            <Link to="/login" className="text-accent hover:text-accent/80 font-medium transition-colors">
              Sign in
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};
