import React, { useState } from 'react';
import { Modal } from '@/components/common/Modal';
import { supabase, isSupabaseConfigured } from '@/db/supabase';
import { Check } from 'lucide-react';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (isSupabaseConfigured && supabase) {
      const { error: resetErr } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reset-password',
      });
      if (resetErr) {
        setError(resetErr.message);
        setLoading(false);
        return;
      }
    }

    setSubmitted(true);
    setLoading(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Reset Password">
      {submitted ? (
        <div className="py-6 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
            <Check className="w-6 h-6 stroke-[3]" />
          </div>
          <h4 className="text-sm font-bold text-slate-900">Password Reset Email Sent</h4>
          <p className="text-xs text-slate-500">
            If an account exists for {email}, you will receive a secure password reset link shortly.
          </p>
          <button
            onClick={onClose}
            className="mt-3 px-5 py-2.5 rounded-2xl bg-slate-100 text-xs font-bold text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-xs text-slate-500">
            Enter your account email and we will send you a link to reset your password.
          </p>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full px-4 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:border-emerald-600 outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-md shadow-emerald-600/20 disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Sending link...' : 'Send Password Reset Link'}
          </button>
        </form>
      )}
    </Modal>
  );
};
