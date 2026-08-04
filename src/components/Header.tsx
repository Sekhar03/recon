import React, { useState, useRef, useEffect } from 'react';
import { ShieldCheck, LogOut, KeyRound, ChevronDown, CheckCircle, Mail, X } from 'lucide-react';
import { ModuleKey, UserSession } from '../types';

interface HeaderProps {
  activeModule: ModuleKey;
  userSession: UserSession;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeModule, userSession, onLogout }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState(userSession.username || 'admin@iserveu.in');
  const [resetSent, setResetSent] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const titles: Record<ModuleKey, string> = {
    'product-recon': 'Product Reconciliation Engine',
    'job-archives': 'Reconciliation Report & Historical Logs',
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSendReset = (e: React.FormEvent) => {
    e.preventDefault();
    setResetSent(true);
    setTimeout(() => {
      setResetSent(false);
      setIsForgotModalOpen(false);
      setIsProfileOpen(false);
    }, 2200);
  };

  return (
    <>
      <header className="h-18 bg-white border-b border-[#e2e8f0] px-8 flex items-center justify-between sticky top-0 z-20 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-[#1b2a3e] tracking-tight">
            {titles[activeModule]}
          </h1>
          <p className="text-xs text-[#475569] font-medium">
            Automated Transaction Matching & Discrepancy Reporting
          </p>
        </div>

        {/* Top Right Profile Section */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-3 p-1.5 pr-3 rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] hover:bg-[#f0f4f8] hover:border-[#119db0]/40 transition-all cursor-pointer shadow-xs group"
          >
            {/* Profile Avatar Pic */}
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#1b2a3e] to-[#119db0] text-white font-bold text-sm flex items-center justify-center shadow-xs border-2 border-white">
                FA
              </div>
              <span className="w-3 h-3 rounded-full bg-[#10b981] border-2 border-white absolute bottom-0 right-0" />
            </div>

            {/* Profile Text Info */}
            <div className="text-left hidden sm:block">
              <div className="text-xs font-bold text-[#1b2a3e] flex items-center gap-1 leading-tight">
                <span>{userSession.title || 'Finance Admin'}</span>
                <ShieldCheck className="w-3.5 h-3.5 text-[#10b981]" />
              </div>
              <div className="text-[11px] font-medium text-[#475569] leading-tight mt-0.5">
                {userSession.role || 'Reconciliation Lead'}
              </div>
            </div>

            <ChevronDown className={`w-4 h-4 text-[#475569] group-hover:text-[#119db0] transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Profile Dropdown Menu */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-[#e2e8f0] py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              {/* Dropdown User Header */}
              <div className="px-4 py-3 border-b border-[#e2e8f0] bg-[#f8fafc]/80">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#1b2a3e] text-[#23c5da] font-bold text-sm flex items-center justify-center shrink-0 border border-[#23c5da]/30">
                    FA
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#1b2a3e] truncate">
                      {userSession.title || 'Finance Admin'}
                    </p>
                    <p className="text-[11px] font-medium text-[#475569] truncate">
                      {userSession.role || 'Reconciliation Lead'}
                    </p>
                    <p className="text-[10px] text-[#119db0] truncate mt-0.5 font-medium">
                      {userSession.username || 'admin@iserveu.in'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Menu Options */}
              <div className="p-1.5 space-y-1">
                {/* Option 1: Forgot Password */}
                <button
                  onClick={() => setIsForgotModalOpen(true)}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#1b2a3e] hover:bg-[#f0f4f8] transition-colors cursor-pointer text-left"
                >
                  <div className="w-7 h-7 rounded-lg bg-[#119db0]/10 text-[#119db0] flex items-center justify-center shrink-0">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <span>Forgot Password</span>
                </button>

                {/* Option 2: Logout */}
                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    onLogout();
                  }}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#ef4444] hover:bg-[#ef4444]/10 transition-colors cursor-pointer text-left"
                >
                  <div className="w-7 h-7 rounded-lg bg-[#ef4444]/10 text-[#ef4444] flex items-center justify-center shrink-0">
                    <LogOut className="w-4 h-4" />
                  </div>
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Forgot Password Modal */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 bg-[#1b2a3e]/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#e2e8f0] relative">
            <button
              onClick={() => setIsForgotModalOpen(false)}
              className="absolute top-4 right-4 text-[#475569] hover:text-[#1b2a3e] p-1 rounded-lg hover:bg-[#f0f4f8] transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-[#119db0]/15 text-[#119db0] flex items-center justify-center">
                <KeyRound className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#1b2a3e]">Forgot Password?</h3>
                <p className="text-xs text-[#475569]">Reset credentials for Finance Admin account</p>
              </div>
            </div>

            {resetSent ? (
              <div className="p-4 rounded-xl bg-[#10b981]/15 border border-[#10b981]/30 text-center space-y-2 my-2 animate-in zoom-in-95 duration-200">
                <CheckCircle className="w-8 h-8 text-[#10b981] mx-auto" />
                <h4 className="font-bold text-sm text-[#1b2a3e]">Password Reset Email Sent!</h4>
                <p className="text-xs text-[#475569]">
                  We have dispatched a secure password reset link to <strong className="text-[#1b2a3e]">{resetEmail}</strong>. Please check your inbox.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendReset} className="space-y-4">
                <p className="text-xs text-[#475569]">
                  Enter your registered administrator email address below to receive an official password reset authorization link.
                </p>

                <div>
                  <label className="block text-xs font-bold text-[#1b2a3e] mb-1 uppercase tracking-wider">
                    Admin Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#475569]" />
                    <input
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#e2e8f0] text-xs font-medium text-[#1b2a3e] focus:outline-none focus:ring-2 focus:ring-[#119db0]"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsForgotModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-[#e2e8f0] text-xs font-bold text-[#475569] hover:bg-[#f0f4f8] transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#119db0] hover:bg-[#0e8696] text-white text-xs font-bold shadow-md shadow-[#119db0]/25 transition cursor-pointer"
                  >
                    Send Reset Link
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
};

