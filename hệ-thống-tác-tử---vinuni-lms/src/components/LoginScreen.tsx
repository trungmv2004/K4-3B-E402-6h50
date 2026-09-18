import React, { useState } from 'react';
import { GraduationCap, LogIn, Sparkles } from 'lucide-react';
import { User } from '../types';
import { login } from '../services/api';

interface LoginScreenProps {
  onLoggedIn: (user: User) => void;
}

const DEMO_ACCOUNTS = [
  { label: 'Giáo viên', email: 'giaovien@vinuni.edu.vn', password: 'giaovien123' },
  { label: 'Học viên 1', email: 'hocsinh1@vinuni.edu.vn', password: 'hocsinh123' },
  { label: 'Học viên 2', email: 'hocsinh2@vinuni.edu.vn', password: 'hocsinh123' },
];

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoggedIn }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const user = await login(email, password);
      onLoggedIn(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đăng nhập thất bại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillDemoAccount = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError(null);
  };

  return (
    <div className="h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 text-white text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-white/15 flex items-center justify-center mb-3">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h1 className="text-lg font-extrabold tracking-tight">VinUni AI in Action LMS</h1>
          <p className="text-xs text-indigo-100 mt-1">Hệ thống học tập thích ứng có AI Tutor</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="ban@vinuni.edu.vn"
              className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Mật khẩu</label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg text-sm transition cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>{isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}</span>
          </button>

          <div className="pt-3 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-semibold uppercase tracking-wide mb-2">
              <Sparkles className="w-3.5 h-3.5 text-purple-500" />
              <span>Tài khoản demo (bấm để tự điền)</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {DEMO_ACCOUNTS.map(acc => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => fillDemoAccount(acc.email, acc.password)}
                  className="text-[11px] font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg py-2 px-1.5 transition cursor-pointer"
                >
                  {acc.label}
                </button>
              ))}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
