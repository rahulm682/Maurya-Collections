import React from 'react';
import { ShoppingBag, LogOut, ShieldCheck, User } from 'lucide-react';

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
    <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-zinc-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          
          {/* Logo & Branding */}
          <div className="flex items-center space-x-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-none border border-zinc-900 bg-zinc-950 text-white shadow-xs">
              <ShoppingBag className="h-4.5 w-4.5" />
            </div>
            <div className="text-left">
              <h1 className="font-serif text-lg font-normal tracking-[0.2em] text-zinc-900 uppercase">
                Maurya Collections
              </h1>
              <p className="text-[9px] font-mono tracking-widest text-zinc-400 uppercase leading-none mt-0.5">
                Couture &amp; Ready-to-Wear
              </p>
            </div>
          </div>

          {/* Controls & Mini indicators */}
          <div className="flex items-center space-x-2.5 font-sans">
            
            {/* Direct Switch to Customer View */}
            <button
              id="header-role-customer"
              type="button"
              onClick={() => onRoleChange('customer')}
              className={`flex items-center space-x-1.5 px-3.5 py-2 font-sans text-[10px] font-semibold uppercase tracking-wider transition-all duration-300 ${
                currentRole === 'customer'
                  ? 'bg-zinc-950 text-white border border-zinc-950 shadow-sm'
                  : 'text-zinc-600 hover:text-zinc-955 bg-transparent border border-zinc-200 hover:border-zinc-300'
              }`}
            >
              <User className="h-3 w-3" />
              <span>Shop</span>
            </button>

            {/* Dashboard or Gate indicator */}
            <button
              id="header-role-seller"
              type="button"
              onClick={() => onRoleChange('seller')}
              className={`flex items-center space-x-1.5 px-3.5 py-2 font-sans text-[10px] font-semibold uppercase tracking-wider transition-all duration-300 relative ${
                currentRole === 'seller'
                  ? 'bg-zinc-950 text-white border border-zinc-950 shadow-sm'
                  : 'text-zinc-600 hover:text-zinc-955 bg-transparent border border-zinc-200 hover:border-zinc-300'
              }`}
            >
              <ShieldCheck className="h-3 w-3" />
              <span>
                {adminAuthenticated ? 'Admin' : 'Owner'}
              </span>
              {pendingRequestsCount > 0 && adminAuthenticated && (
                <span className="absolute -top-1.5 -right-1.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-zinc-950 text-[9px] font-bold text-white ring-2 ring-white animate-pulse">
                  {pendingRequestsCount}
                </span>
              )}
            </button>

            {/* Admin Logout link */}
            {adminAuthenticated && (
              <button
                id="header-btn-logout"
                type="button"
                onClick={onLogout}
                className="p-2 border border-zinc-200 text-zinc-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50/50 transition-all duration-200"
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

