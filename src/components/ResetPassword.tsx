import { useState, useEffect } from 'react';
import { Lock, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ResetPasswordProps {
  onComplete?: () => void;
}

export function ResetPassword({ onComplete }: ResetPasswordProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if we have the necessary tokens in the URL
    // Supabase sends tokens in hash fragment, not query params
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const queryParams = new URLSearchParams(window.location.search);
    
    // Check hash first (Supabase default), then query params
    const accessToken = hashParams.get('access_token') || queryParams.get('access_token');
    const type = hashParams.get('type') || queryParams.get('type');
    const refreshToken = hashParams.get('refresh_token') || queryParams.get('refresh_token');

    if (!accessToken || type !== 'recovery') {
      setError('Invalid or missing reset token. Please request a new password reset.');
      return;
    }

    // The recovery token should already create a session when Supabase processes it
    // But we need to ensure we have the session for updateUser to work
    // If session doesn't exist, set it explicitly
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session && accessToken) {
        // Set the session from the recovery token
        supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken || '',
        }).catch((err) => {
          console.error('Error setting recovery session:', err);
          setError('Invalid or expired reset token. Please request a new password reset.');
        });
      }
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        setError(updateError.message);
        setLoading(false);
        return;
      }

      setSuccess(true);
      setLoading(false);

      // Call onComplete callback or redirect after 2 seconds
      setTimeout(() => {
        if (onComplete) {
          onComplete();
        } else {
          window.location.href = '/';
        }
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[var(--color-parchment)] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[var(--color-aged-paper)] border-2 border-[var(--color-ink)] p-8 shadow-[8px_8px_0px_0px_rgba(44,36,22,0.4)] relative">
          <div className="absolute top-3 right-3 w-12 h-12 border-t-2 border-r-2 border-[var(--color-gold)] opacity-40" />
          <div className="absolute bottom-3 left-3 w-12 h-12 border-b-2 border-l-2 border-[var(--color-gold)] opacity-40" />
          
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-[var(--color-library-green)] mx-auto mb-4" />
            <h2 className="text-[var(--color-ink)] mb-4">Password Reset Successful</h2>
            <p className="text-[var(--color-faded-ink)] mb-4">
              Your password has been updated. Redirecting to login...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-parchment)] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[var(--color-aged-paper)] border-2 border-[var(--color-ink)] p-8 shadow-[8px_8px_0px_0px_rgba(44,36,22,0.4)] relative">
        <div className="absolute top-3 right-3 w-12 h-12 border-t-2 border-r-2 border-[var(--color-gold)] opacity-40" />
        <div className="absolute bottom-3 left-3 w-12 h-12 border-b-2 border-l-2 border-[var(--color-gold)] opacity-40" />
        
        <div className="text-center mb-6">
          <h2 className="text-[var(--color-ink)] mb-2">Reset Your Password</h2>
          <p className="text-xs text-[var(--color-faded-ink)] italic">
            Enter your new password below
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* New Password Field */}
          <div>
            <label className="block mb-2 text-[var(--color-ink)] text-xs tracking-wide uppercase">
              New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-faded-ink)]" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full pl-10 pr-3 py-2 text-sm bg-[var(--color-parchment)] border-2 border-[var(--color-faded-ink)] focus:border-[var(--color-ink)] focus:outline-none"
                required
                minLength={8}
              />
            </div>
            <p className="text-xs text-[var(--color-faded-ink)] mt-1 italic">
              Must be at least 8 characters
            </p>
          </div>

          {/* Confirm Password Field */}
          <div>
            <label className="block mb-2 text-[var(--color-ink)] text-xs tracking-wide uppercase">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-faded-ink)]" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full pl-10 pr-3 py-2 text-sm bg-[var(--color-parchment)] border-2 border-[var(--color-faded-ink)] focus:border-[var(--color-ink)] focus:outline-none"
                required
                minLength={8}
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 border border-[var(--color-burgundy)] bg-[var(--color-parchment)] flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-[var(--color-burgundy)] flex-shrink-0 mt-0.5" />
              <p className="text-sm text-[var(--color-burgundy)]">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !password || !confirmPassword}
            className="w-full py-2 border-2 border-[var(--color-ink)] bg-[var(--color-ink)] text-[var(--color-parchment)] hover:bg-[var(--color-burgundy)] hover:border-[var(--color-burgundy)] transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Updating Password...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
}

