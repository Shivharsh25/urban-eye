import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { LogOut, X, AlertTriangle, ShieldAlert } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

export default function SignOutModal({ isOpen, onClose, onConfirm }) {
  const { t } = useLanguage();
  const { user } = useAuth();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    <div 
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      style={{ minHeight: '100vh', width: '100vw' }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="signout-modal-title"
    >
      <div 
        className="relative w-full max-w-md m-auto rounded-3xl bg-slate-900/98 border border-slate-700/80 p-6 sm:p-7 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] overflow-hidden text-slate-100 transition-all transform scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient Danger Glow */}
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-rose-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors z-10"
          title="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon & Heading */}
        <div className="flex flex-col items-center text-center relative z-10">
          <div className="relative mb-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center shadow-lg shadow-rose-500/10 text-rose-400">
              <LogOut className="w-6 h-6 stroke-[2.2]" />
            </div>
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
            </span>
          </div>

          <h3 
            id="signout-modal-title"
            className="text-lg sm:text-xl font-black text-white tracking-tight"
          >
            {t('confirmSignOutTitle', 'Do you really want to sign out?')}
          </h3>

          <p className="text-xs sm:text-sm text-slate-300/90 mt-2 leading-relaxed max-w-sm">
            {t('confirmSignOutDesc', 'Are you sure you want to end your current session? You will need to sign in again to access your dashboard and reports.')}
          </p>

          {/* Active Account Pill */}
          {user && (
            <div className="mt-4 px-3.5 py-1.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center space-x-2 text-xs text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span className="font-semibold truncate max-w-[200px]">{user.name || user.email}</span>
              {user.role && (
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-bold">
                  {user.role}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons: Yes / No */}
        <div className="mt-6 flex flex-col-reverse sm:flex-row items-center gap-3 relative z-10">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold text-slate-300 bg-slate-800/90 hover:bg-slate-700/90 hover:text-white border border-slate-700/70 transition-all active:scale-95 text-center shadow-md"
          >
            {t('noCancel', 'No, Keep Me In')}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="w-full sm:flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-rose-600 via-rose-500 to-red-600 hover:from-rose-500 hover:to-red-500 shadow-xl shadow-rose-600/30 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center space-x-2"
          >
            <LogOut className="w-4 h-4" />
            <span>{t('yesSignOut', 'Yes, Sign Out')}</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
