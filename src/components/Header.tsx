import React from 'react';
import { ShoppingBag, LogOut, ShieldCheck, User, Sparkles } from 'lucide-react';

interface HeaderProps {
  currentRole: 'customer' | 'seller';
  onRoleChange: (role: 'customer' | 'seller') => void;
  pendingRequestsCount: number;
  adminAuthenticated: boolean;
  onLogout: () => void;
}

export default function Header({
  currentRole,
  onRoleChange,
  pendingRequestsCount,
  adminAuthenticated,
  onLogout
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full bg-slate-900 text-white shadow-md border-b border-slate-800">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          
          {/* Logo & Branding */}
          <div className="flex items-center space-x-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-900 shadow-sm">
              <ShoppingBag className="h-5 w-5 fill-current" />
            </div>
            <div className="text-left">
              <h1 className="text-sm font-black tracking-tight text-white uppercase flex items-center gap-1">
                Maurya Collections
              </h1>
            </div>
          </div>

          {/* Controls & Mini indicators */}
          <div className="flex items-center space-x-2">
            
            {/* Direct Switch to Customer View */}
            <button
              type="button"
              onClick={() => onRoleChange('customer')}
              className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                currentRole === 'customer'
                  ? 'bg-amber-500 text-slate-900 font-extrabold shadow-xs'
                  : 'text-slate-300 hover:text-white bg-slate-800'
              }`}
            >
              <User className="h-3 w-3" />
              <span className="sr-only sm:not-sr-only text-[10px]">Shop Catalog</span>
            </button>

            {/* Dashboard or Gate indicator */}
            <button
              type="button"
              onClick={() => onRoleChange('seller')}
              className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all relative ${
                currentRole === 'seller'
                  ? 'bg-amber-500 text-slate-900 font-extrabold shadow-xs'
                  : 'text-slate-300 hover:text-white bg-slate-800'
              }`}
            >
              <ShieldCheck className="h-3 w-3" />
              <span className="sr-only sm:not-sr-only text-[10px]">
                {adminAuthenticated ? 'Admin Panel' : 'Owner Login'}
              </span>
              {pendingRequestsCount > 0 && adminAuthenticated && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[9px] font-extrabold text-white ring-2 ring-slate-900 animate-pulse">
                  {pendingRequestsCount}
                </span>
              )}
            </button>

            {/* Admin Logout link */}
            {adminAuthenticated && (
              <button
                type="button"
                onClick={onLogout}
                className="p-1.5 rounded-lg bg-red-950/40 text-rose-450 hover:bg-rose-900 hover:text-white transition-all"
                title="Logout Admin Session"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            )}

          </div>

        </div>
      </div>
    </header>
  );
}
