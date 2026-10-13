import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, User, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { StudySpaceLogo } from '@/components/ui/StudySpaceLogo';

export const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const { isConfigured, signInWithEmail, signUpWithEmail, continueAsGuest } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    if (isSignUp) {
      const { error } = await signUpWithEmail(email, password, fullName);
      if (error) {
        setErrorMsg(error.message);
      } else {
        navigate('/');
      }
    } else {
      const { error } = await signInWithEmail(email, password);
      if (error) {
        setErrorMsg(error.message);
      } else {
        navigate('/');
      }
    }
    setLoading(false);
  };

  const handleGuest = () => {
    continueAsGuest();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#0B0D10] flex flex-col justify-center items-center p-4 selection:bg-[#D6FF62]/30">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-3 flex flex-col items-center">
          <StudySpaceLogo size="xl" showText={false} />
          <div>
            <h1 className="text-3xl font-extrabold text-[#F3F5F7] tracking-tight">
              Study<span className="text-[#D6FF62]">Space</span>
            </h1>
            <p className="text-xs font-mono uppercase tracking-widest text-[#63D6C5] mt-1">
              Personal Study Manager & Focus Workspace
            </p>
          </div>
        </div>

        {/* Card Form */}
        <div className="rounded-3xl bg-[#141820] border border-[#272E38] p-8 shadow-2xl space-y-6">
          <div className="flex border-b border-[#272E38] pb-3">
            <button
              onClick={() => {
                setIsSignUp(false);
                setErrorMsg('');
              }}
              className={`flex-1 pb-2 text-center text-sm font-bold border-b-2 transition-all ${
                !isSignUp ? 'border-[#D6FF62] text-white' : 'border-transparent text-zinc-500'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setIsSignUp(true);
                setErrorMsg('');
              }}
              className={`flex-1 pb-2 text-center text-sm font-bold border-b-2 transition-all ${
                isSignUp ? 'border-[#D6FF62] text-white' : 'border-transparent text-zinc-500'
              }`}
            >
              Create Account
            </button>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Alex Rivera"
                    className="w-full pl-10 pr-3 py-2 rounded-xl bg-[#0B0D10] border border-[#272E38] text-sm text-[#F3F5F7] focus:outline-none focus:border-[#D6FF62]"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="learner@studyspace.dev"
                  className="w-full pl-10 pr-3 py-2 rounded-xl bg-[#0B0D10] border border-[#272E38] text-sm text-[#F3F5F7] focus:outline-none focus:border-[#D6FF62]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3 py-2 rounded-xl bg-[#0B0D10] border border-[#272E38] text-sm text-[#F3F5F7] focus:outline-none focus:border-[#D6FF62]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-[#D6FF62] hover:bg-[#cbf555] text-black font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Please wait...' : isSignUp ? 'Sign Up' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Standalone Guest Option */}
          <div className="pt-2 border-t border-[#272E38] text-center">
            <button
              onClick={handleGuest}
              className="text-xs text-zinc-400 hover:text-white transition-colors"
            >
              Continue in Standalone / Guest Mode
            </button>
          </div>
        </div>

        {/* Supabase status notice */}
        <div className="text-center text-xs text-zinc-500">
          {isConfigured ? (
            <span className="text-emerald-400 flex items-center justify-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Supabase Cloud Connected
            </span>
          ) : (
            <span>Supabase credentials optional. Standalone mode provides full offline capability.</span>
          )}
        </div>
      </div>
    </div>
  );
};
