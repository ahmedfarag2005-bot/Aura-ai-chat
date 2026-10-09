import React, { useState } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { LogOut, User, Check, ChevronDown } from 'lucide-react';
import { loginWithGoogle, logoutUser } from '../lib/firebase';

interface AuthButtonProps {
  user: FirebaseUser | null;
  language: 'ar' | 'en';
}

export const GoogleIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24">
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
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

export const AuthButton: React.FC<AuthButtonProps> = ({ user, language }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const isAr = language === 'ar';

  const handleSignIn = async () => {
    try {
      setLoading(true);
      await loginWithGoogle();
    } catch (err) {
      console.error('Google Sign-in failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setLoading(true);
      await logoutUser();
      setIsOpen(false);
    } catch (err) {
      console.error('Sign-out failed:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <button
        onClick={handleSignIn}
        disabled={loading}
        style={{ height: '37px' }}
        className="flex items-center gap-2 py-1 px-3 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 text-neutral-800 dark:text-neutral-100 text-xs font-medium shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:shadow-sm transition-all duration-150 cursor-pointer"
        title={isAr ? 'تسجيل الدخول باستخدام حساب Google' : 'Sign in with Google'}
      >
        <GoogleIcon className="w-5 h-5" />
        <span
          style={{
            width: '30.8438px',
            height: '33px',
            color: '#7b7b7b',
            borderColor: '#ffffff',
            fontSize: '8px',
          }}
          className="inline-flex items-center"
        >
          {isAr ? 'تسجيل دخول Google' : 'Sign in with Google'}
        </span>
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 py-1 px-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-xs"
      >
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt={user.displayName || 'User'}
            className="w-6 h-6 rounded-full object-cover border border-black/10 dark:border-white/10"
          />
        ) : (
          <div className="w-6 h-6 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center text-xs font-medium text-neutral-700 dark:text-neutral-300">
            {user.displayName ? user.displayName.charAt(0).toUpperCase() : <User size={13} />}
          </div>
        )}
        <span
          style={{
            width: '30.8438px',
            height: '33px',
            color: '#7b7b7b',
            borderColor: '#ffffff',
          }}
          className="font-medium max-w-[110px] truncate hidden sm:inline"
        >
          {user.displayName || user.email?.split('@')[0]}
        </span>
        <ChevronDown size={13} className="text-neutral-400" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full end-0 mt-1.5 w-60 p-2 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xl z-40 space-y-2 text-xs">
            {/* User Details */}
            <div className="p-2 border-b border-neutral-100 dark:border-neutral-800 flex items-center gap-2.5">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || ''}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                  <User size={16} className="text-neutral-500" />
                </div>
              )}
              <div className="overflow-hidden">
                <p className="font-semibold text-neutral-900 dark:text-white truncate">
                  {user.displayName || (isAr ? 'مستخدم Google' : 'Google User')}
                </p>
                <p className="text-[11px] text-neutral-400 truncate">{user.email}</p>
              </div>
            </div>

            {/* Status */}
            <div className="px-2 py-1 text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <Check size={12} />
              <span>{isAr ? 'تم التحقق بحساب Google' : 'Verified Google Account'}</span>
            </div>

            {/* Logout button */}
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-2 p-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors font-medium text-start"
            >
              <LogOut size={14} />
              <span>{isAr ? 'تسجيل الخروج' : 'Sign out'}</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};
