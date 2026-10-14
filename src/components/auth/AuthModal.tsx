import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Cloud,
  Lock,
  Mail,
  User,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { StudySpaceLogo } from '@/components/ui/StudySpaceLogo';
import { Button } from '@/components/ui/button';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'signin' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'signin',
}) => {
  const { isConfigured, signInWithEmail, signUpWithEmail } = useAuth();
  const [tab, setTab] = useState<'signin' | 'signup'>(defaultTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Sync tab with defaultTab prop changes
  useEffect(() => {
    if (isOpen) {
      setTab(defaultTab);
      setErrorMsg('');
      setSuccessMsg('');
    }
  }, [isOpen, defaultTab]);

  // Lock body scroll & listen for Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;
  if (typeof document === 'undefined') return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (tab === 'signup') {
        const { error } = await signUpWithEmail(email.trim(), password, fullName.trim());
        if (error) {
          setErrorMsg(error.message);
        } else {
          setSuccessMsg('Account created! All your study data has been backed up to the cloud.');
          setTimeout(() => {
            onClose();
          }, 1200);
        }
      } else {
        const { error } = await signInWithEmail(email.trim(), password);
        if (error) {
          setErrorMsg(error.message);
        } else {
          setSuccessMsg('Signed in! Your study workspace is synchronized.');
          setTimeout(() => {
            onClose();
          }, 1200);
        }
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const modalPopup = (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      style={{ isolation: 'isolate' }}
    >
      {/* Dimmed backdrop with rich blur */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-200 animate-in fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Popup Dialog Container */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        className="relative w-full max-w-md rounded-3xl bg-[#141820] border border-[#272E38] shadow-[0_25px_70px_rgba(0,0,0,0.9)] p-6 sm:p-7 text-[#F3F5F7] z-10 my-8 transition-all animate-in zoom-in-95 fade-in duration-200 ring-1 ring-white/5"
      >
        {/* Ambient Top Glow Line */}
        <div className="absolute top-0 inset-x-8 h-[2px] bg-gradient-to-r from-transparent via-[#D6FF62] to-[#63D6C5] rounded-t-full opacity-80" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-[#929BA8] hover:text-[#F3F5F7] hover:bg-[#1A2029] transition-colors cursor-pointer z-20"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-5">
          {/* Header Branding */}
          <div className="text-center space-y-2 flex flex-col items-center pt-1">
            <div className="p-2.5 rounded-2xl bg-[#0B0D10] border border-[#272E38] shadow-inner mb-1">
              <StudySpaceLogo size={36} showText={false} />
            </div>
            <div>
              <h2 id="auth-modal-title" className="text-xl font-extrabold text-[#F3F5F7] tracking-tight">
                {tab === 'signin' ? 'Log in to Save Your Data' : 'Create Account & Sync Workspace'}
              </h2>
              <p className="text-xs text-[#929BA8] max-w-xs mx-auto mt-1 leading-relaxed">
                Save and sync your categories, subjects, tasks, roadmaps, and Pomodoro focus hours to your private cloud.
              </p>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="grid grid-cols-2 p-1 rounded-2xl bg-[#0B0D10] border border-[#272E38] text-xs">
            <button
              type="button"
              onClick={() => {
                setTab('signin');
                setErrorMsg('');
              }}
              className={`py-2 rounded-xl font-bold transition-all cursor-pointer ${
                tab === 'signin'
                  ? 'bg-[#D6FF62] text-black shadow-sm'
                  : 'text-[#929BA8] hover:text-[#F3F5F7]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setTab('signup');
                setErrorMsg('');
              }}
              className={`py-2 rounded-xl font-bold transition-all cursor-pointer ${
                tab === 'signup'
                  ? 'bg-[#D6FF62] text-black shadow-sm'
                  : 'text-[#929BA8] hover:text-[#F3F5F7]'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Error / Success Notifications */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {tab === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-[#F3F5F7] mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#929BA8] absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Alex Rivera"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#0B0D10] border border-[#272E38] text-sm text-[#F3F5F7] placeholder:text-zinc-600 focus:outline-none focus:border-[#D6FF62] focus:ring-1 focus:ring-[#D6FF62] transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#F3F5F7] mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#929BA8] absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@domain.com"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#0B0D10] border border-[#272E38] text-sm text-[#F3F5F7] placeholder:text-zinc-600 focus:outline-none focus:border-[#D6FF62] focus:ring-1 focus:ring-[#D6FF62] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#F3F5F7] mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#929BA8] absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#0B0D10] border border-[#272E38] text-sm text-[#F3F5F7] placeholder:text-zinc-600 focus:outline-none focus:border-[#D6FF62] focus:ring-1 focus:ring-[#D6FF62] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-[#929BA8] hover:text-[#F3F5F7] transition-colors cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Cloud Auto-Backup Guarantee Notice */}
            <div className="p-3 rounded-xl bg-[#0B0D10] border border-[#272E38] flex items-start gap-2.5 text-[11px] text-[#929BA8]">
              <Cloud className="w-4 h-4 text-[#63D6C5] shrink-0 mt-0.5" />
              <p className="leading-relaxed m-0">
                <strong className="text-zinc-300">Seamless sync:</strong> All study data and progress you created as a guest will be automatically linked to this account upon sign-in.
              </p>
            </div>

            {/* Action Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#D6FF62] hover:bg-[#cbf555] text-black font-bold text-sm shadow-md transition-all mt-2 cursor-pointer"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                  <span>{tab === 'signin' ? 'Signing in & Syncing...' : 'Creating & Saving...'}</span>
                </span>
              ) : (
                <span>{tab === 'signin' ? 'Log in & Sync Workspace' : 'Create Free Account & Save'}</span>
              )}
            </Button>
          </form>

          {/* Footer Status & Guest Option */}
          <div className="pt-3 border-t border-[#272E38] flex items-center justify-between text-[11px] text-[#929BA8]">
            <span className="flex items-center gap-1.5 font-mono">
              <span
                className={`w-2 h-2 rounded-full ${
                  isConfigured ? 'bg-emerald-400 animate-pulse' : 'bg-[#D6FF62]'
                }`}
              />
              {isConfigured ? 'Supabase Connected' : 'Local Storage Active'}
            </span>
            <button
              type="button"
              onClick={onClose}
              className="text-xs text-[#929BA8] hover:text-[#D6FF62] transition-colors cursor-pointer underline"
            >
              Continue as Guest
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalPopup, document.body);
};
