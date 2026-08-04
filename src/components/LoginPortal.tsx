import React, { useState } from 'react';
import { Layers, ShieldCheck, Lock, User, ArrowRight, Loader2 } from 'lucide-react';
import { UserSession } from '../types';

interface LoginPortalProps {
  onLoginSuccess: (session: UserSession) => void;
}

export const LoginPortal: React.FC<LoginPortalProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('admin@iserveu.in');
  const [password, setPassword] = useState('admin@2026');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess({
        username: 'admin@iserveu.in',
        role: 'Reconciliation Lead',
        title: 'Finance Admin',
        isLoggedIn: true
      });
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1b2a3e] via-[#112438] to-[#0e8696] p-4 relative overflow-hidden">
      {/* Subtle background ambient glows */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#23c5da]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#119db0]/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white/95 backdrop-blur-xl border border-white/20 rounded-[24px] p-8 shadow-2xl relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#1b2a3e] to-[#119db0] text-white mb-4 shadow-lg shadow-[#119db0]/20">
            <Layers className="w-9 h-9" />
          </div>
          <h1 className="text-2xl font-bold text-[#1b2a3e] tracking-tight">Recon Platform</h1>
          <p className="text-sm font-medium text-[#475569] mt-1">Automated Reconciliation Suite</p>
        </div>

        {/* Access Role Badge */}
        <div className="mb-6 p-3 rounded-xl bg-[#f0f4f8] border border-[#e2e8f0] flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#119db0]/10 flex items-center justify-center text-[#119db0]">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#1b2a3e]">Role: Finance Admin</span>
              <span className="text-[10px] bg-[#10b981]/15 text-[#10b981] font-semibold px-2 py-0.5 rounded-full">Authorized</span>
            </div>
            <p className="text-xs text-[#475569]">Audit, Report & Verify Access Mode</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#1b2a3e] mb-1.5 uppercase tracking-wider">
              Username
            </label>
            <div className="relative">
              <User className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#475569]" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-[#e2e8f0] bg-white text-[#1b2a3e] font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#119db0] focus:border-transparent transition"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1b2a3e] mb-1.5 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#475569]" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-[#e2e8f0] bg-white text-[#1b2a3e] font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#119db0] focus:border-transparent transition"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-6 py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#119db0] to-[#0e8696] hover:from-[#0e8696] hover:to-[#1b2a3e] text-white font-semibold text-sm transition-all duration-200 shadow-md shadow-[#119db0]/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Authenticating Session...</span>
              </>
            ) : (
              <>
                <span>Sign In to Recon Platform</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-[#475569]">
            Protected by iServeU Enterprise Security Protocol
          </p>
        </div>
      </div>
    </div>
  );
};
