import React, { useState } from 'react';
import { Cloud, Lock, Mail, User, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { StudySpaceLogo } from '@/components/ui/StudySpaceLogo';
import { Modal } from '@/components/ui/Modal';
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
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

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
          setSuccessMsg('Account created! All your study data has been backed up.');
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

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="">
      <div className="space-y-5 -mt-3">
        {/* Header Branding */}
        <div className="text-center space-y-2 flex flex-col items-center">
          <StudySpaceLogo size="md" showText={false} />
          <div>
            <h2 className="text-xl font-extrabold text-[#F3F5F7] tracking-tight">
              {tab === 'signin' ? 'Log in to Save Your Data' : 'Create Account & Sync Workspace'}
            </h2>
            <p className="text-xs text-[#929BA8] max-w-sm mx-auto mt-1 leading-relaxed">
              Never lose your categories, subjects, roadmaps, notes, and Pomodoro logs. Access your study plan from any device.
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1 rounded-xl bg-[#1A2029] border border-[#272E38] text-xs">
          <button
            type="button"
            onClick={() => {
              setTab('signin');
              setErrorMsg('');
            }}
            className={`py-1.5 rounded-lg font-semibold transition-colors ${
              tab === 'signin'
                ? 'bg-[#D6FF62] text-black shadow-xs'
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
            className={`py-1.5 rounded-lg font-semibold transition-colors ${
              tab === 'signup'
                ? 'bg-[#D6FF62] text-black shadow-xs'
                : 'text-[#929BA8] hover:text-[#F3F5F7]'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error / Success Notifications */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {tab === 'signup' && (
            <div>
              <label className="block text-xs font-semibold text-[#F3F5F7] mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-[#929BA8] absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Alex Rivera"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#1A2029] border border-[#272E38] text-sm text-[#F3F5F7] placeholder:text-zinc-600 focus:outline-none focus:border-[#D6FF62]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#F3F5F7] mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#929BA8] absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#1A2029] border border-[#272E38] text-sm text-[#F3F5F7] placeholder:text-zinc-600 focus:outline-none focus:border-[#D6FF62]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#F3F5F7] mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#929BA8] absolute left-3 top-2.5" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#1A2029] border border-[#272E38] text-sm text-[#F3F5F7] placeholder:text-zinc-600 focus:outline-none focus:border-[#D6FF62]"
              />
            </div>
          </div>

          {/* Cloud Auto-Backup Notice */}
          <div className="p-3 rounded-xl bg-[#1A2029] border border-[#272E38] flex items-start gap-2.5 text-[11px] text-[#929BA8]">
            <Cloud className="w-4 h-4 text-[#63D6C5] shrink-0 mt-0.5" />
            <p className="leading-relaxed m-0">
              Your existing local subjects, categories, and focus hours will automatically link to this account upon sign-in.
            </p>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-[#D6FF62] hover:bg-[#cbf555] text-black font-bold text-sm shadow-sm transition-colors mt-2"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{tab === 'signin' ? 'Signing in & Syncing...' : 'Creating & Saving...'}</span>
              </span>
            ) : (
              <span>{tab === 'signin' ? 'Log in & Sync Workspace' : 'Create Free Account & Save'}</span>
            )}
          </Button>
        </form>

        {/* Offline / Cloud Status Badge */}
        <div className="pt-2 border-t border-[#272E38] flex items-center justify-between text-[11px] text-[#929BA8]">
          <span className="flex items-center gap-1.5 font-mono">
            <span
              className={`w-2 h-2 rounded-full ${
                isConfigured ? 'bg-emerald-400 animate-pulse' : 'bg-[#D6FF62]'
              }`}
            />
            {isConfigured ? 'Supabase Cloud Connected' : 'Local Workspace Ready'}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-[#929BA8] hover:text-[#F3F5F7] underline cursor-pointer"
          >
            Continue as Guest
          </button>
        </div>
      </div>
    </Modal>
  );
};
