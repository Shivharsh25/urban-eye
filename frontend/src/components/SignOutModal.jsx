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
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200"
      style={{ minHeight: '100vh', width: '100vw' }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="signout-modal-title"
    >
      <div 
        className="relative w-full max-w-md m-auto rounded-2xl bg-white border border-slate-200 p-6 sm:p-7 shadow-xl overflow-hidden text-slate-900 transition-all transform scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors z-10"
          title="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon & Heading */}
        <div className="flex flex-col items-center text-center relative z-10">
          <div className="mb-4">
            <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
              <LogOut className="w-5 h-5 stroke-[2.2]" />
            </div>
          </div>

          <h3 
            id="signout-modal-title"
            className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight"
          >
            {t('confirmSignOutTitle', 'Do you really want to sign out?')}
          </h3>

          <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed max-w-sm">
            {t('confirmSignOutDesc', 'Are you sure you want to end your current session? You will need to sign in again to access your dashboard and reports.')}
          </p>

          {/* Active Account Pill */}
          {user && (
            <div className="mt-4 px-3.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center space-x-2 text-xs text-slate-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="font-semibold truncate max-w-[200px]">{user.name || user.email}</span>
              {user.role && (
                <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-slate-200 text-slate-600">
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
            className="w-full sm:flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 transition-all text-center shadow-xs"
          >
            {t('noCancel', 'No, Keep Me In')}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="w-full sm:flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 shadow-xs transition-all flex items-center justify-center space-x-2"
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
