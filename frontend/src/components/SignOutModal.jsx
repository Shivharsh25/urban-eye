import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { LogOut, X } from 'lucide-react';
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
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 bg-[#191636]/50 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200"
      style={{ minHeight: '100vh', width: '100vw' }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="signout-modal-title"
    >
      <div 
        className="relative w-full max-w-md m-auto rounded-3xl bg-white border border-[#E8E2E5] p-6 sm:p-7 shadow-2xl overflow-hidden text-[#191636] transition-all transform scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-[#57536E] hover:text-[#191636] hover:bg-[#F6F6FC] transition-colors z-10 cursor-pointer"
          title="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon & Heading */}
        <div className="flex flex-col items-center text-center relative z-10">
          <div className="relative mb-4">
            <div className="w-14 h-14 rounded-2xl bg-[#F6F6FC] border border-[#E8E2E5] flex items-center justify-center text-[#302B69] shadow-xs">
              <LogOut className="w-6 h-6 stroke-[2.2]" />
            </div>
          </div>

          <h3 
            id="signout-modal-title"
            className="text-lg sm:text-xl font-bold text-[#191636] tracking-tight"
          >
            {t('confirmSignOutTitle', 'Do you really want to sign out?')}
          </h3>

          <p className="text-xs sm:text-sm text-[#57536E] mt-2 leading-relaxed max-w-sm">
            {t('confirmSignOutDesc', 'Are you sure you want to end your current session? You will need to sign in again to access your dashboard and reports.')}
          </p>

          {/* Active Account Pill */}
          {user && (
            <div className="mt-4 px-3.5 py-1.5 rounded-xl bg-[#F6F6FC] border border-[#E8E2E5] flex items-center space-x-2 text-xs text-[#191636]">
              <span className="w-2 h-2 rounded-full bg-[#302B69]"></span>
              <span className="font-semibold truncate max-w-[200px]">{user.name || user.email}</span>
              {user.role && (
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-white text-[#302B69] border border-[#E8E2E5] font-bold">
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
            className="w-full sm:flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold text-[#57536E] bg-white hover:bg-[#F6F6FC] hover:text-[#191636] border border-[#E8E2E5] transition-all active:scale-95 text-center cursor-pointer shadow-xs"
          >
            {t('noCancel', 'No, Keep Me In')}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="w-full sm:flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold text-white bg-[#302B69] hover:bg-[#242052] transition-all active:scale-95 text-center shadow-xs cursor-pointer flex items-center justify-center space-x-1.5"
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
