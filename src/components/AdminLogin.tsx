import React from 'react';
import { Lock } from 'lucide-react';

interface AdminLoginProps {
  loginEmail: string;
  setLoginEmail: (val: string) => void;
  loginPassword: string;
  setLoginPassword: (val: string) => void;
  loginError: string | null;
  onSubmit: (e: React.FormEvent) => void;
  onGoogleSignIn: () => void;
  onBackToCustomer: () => void;
}

export default function AdminLogin({
  loginEmail,
  setLoginEmail,
  loginPassword,
  setLoginPassword,
  loginError,
  onSubmit,
  onGoogleSignIn,
  onBackToCustomer
}: AdminLoginProps) {
  return (
    <div className="py-12 px-4 flex-1 flex flex-col justify-center text-left animate-fade-in">
      <div className="max-w-sm mx-auto w-full space-y-6 bg-white p-8 rounded-none border border-zinc-200 shadow-sm">
        <div className="text-center space-y-2.5">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-none border border-zinc-250 bg-zinc-50 text-zinc-900">
            <Lock className="h-4.5 w-4.5" />
          </div>
          <h3 className="font-serif text-base font-normal tracking-wider text-zinc-900 uppercase">Secure Atelier Portal</h3>
          <p className="text-[10px] font-sans tracking-wide text-zinc-500 uppercase leading-relaxed max-w-[280px] mx-auto">
            Authorized owners catalog management and village truck logistics.
          </p>
          <div className="mt-2 text-center">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-none text-[8px] font-mono font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider">
              ● Serverless Cloud Shield Active
            </span>
          </div>
        </div>

        {loginError && (
          <div className="p-3 bg-rose-50/50 text-rose-800 font-medium border border-rose-100 rounded-none text-[10px] text-left leading-relaxed">
            {loginError}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label htmlFor="login-email" className="block text-[8px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">
              Owner Email
            </label>
            <input
              type="email"
              id="login-email"
              required
              placeholder="name@gmail.com"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              className="block w-full rounded-none border border-zinc-200 py-2 px-3 text-xs text-zinc-900 bg-zinc-50/40 focus:bg-white focus:ring-1 focus:ring-zinc-900 focus:outline-none transition-all font-mono"
            />
          </div>

          <div>
            <label htmlFor="login-password" className="block text-[8px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">
              Security Password
            </label>
            <input
              type="password"
              id="login-password"
              required
              placeholder="••••••••"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              className="block w-full rounded-none border border-zinc-200 py-2 px-3 text-xs text-zinc-900 bg-zinc-50/40 focus:bg-white focus:ring-1 focus:ring-zinc-900 focus:outline-none transition-all"
            />
          </div>

          <button
            type="submit"
            id="btn-admin-login-submit"
            className="w-full py-2.5 bg-zinc-950 hover:bg-zinc-800 text-white text-[10px] font-bold uppercase tracking-widest rounded-none transition-all shadow-xs cursor-pointer"
          >
            Sign In to Ledger (Offline / Email Mode)
          </button>
        </form>

        <div className="flex items-center justify-between gap-3 py-1">
          <span className="h-[1px] bg-zinc-200 flex-1"></span>
          <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest shrink-0">OR PREFER</span>
          <span className="h-[1px] bg-zinc-200 flex-1"></span>
        </div>

        <button
          type="button"
          onClick={onGoogleSignIn}
          className="w-full py-2.5 border border-zinc-900 hover:bg-zinc-550 active:scale-[0.99] text-zinc-900 text-[10px] font-bold uppercase tracking-widest rounded-none transition-all flex items-center justify-center gap-2.5 cursor-pointer bg-amber-500/10 hover:bg-amber-500/20 border-dashed"
        >
          <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <span>Google Federated Auth (Recommended)</span>
        </button>
        <p className="text-[8px] font-mono text-zinc-400 text-center leading-relaxed">
          * Note: Google authentication is recommended to satisfy strict active Firebase Rules and secure live sync.
        </p>

        <button
          type="button"
          onClick={onBackToCustomer}
          className="text-center block w-full text-[9px] font-bold text-zinc-500 hover:text-zinc-950 transition-colors uppercase tracking-widest underline py-1"
        >
          ← Back to Customer Catalog
        </button>
      </div>
    </div>
  );
}
