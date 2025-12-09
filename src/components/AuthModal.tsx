import { useState } from 'react';
import { Mail, Lock, BookOpen, AlertCircle, CheckCircle, X, User } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { containsProfanity } from '../utils/profanityFilter';

interface AuthModalProps {
  onAuth: () => void;
  onClose: () => void;
}

export function AuthModal({ onAuth, onClose }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [verificationSent, setVerificationSent] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const validateEmail = (email: string): boolean => {
    return email.endsWith('@uchicago.edu');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

        if (!validateEmail(email)) {
          setError('Please use a valid @uchicago.edu email address');
          setLoading(false);
          return;
        }

    try {
      if (mode === 'signup') {
        // Check if email already exists (case-insensitive)
        const { data: existingProfiles, error: emailCheckError } = await supabase
          .from('profiles')
          .select('email');
        
        // Check case-insensitively
        const emailLower = email.trim().toLowerCase();
        const existingProfile = existingProfiles?.find(p => p.email.toLowerCase() === emailLower);
        
        if (existingProfile) {
          setError('This email is already registered. Please use a different email or try logging in.');
          setLoading(false);
          return;
        }

        if (emailCheckError && emailCheckError.code !== 'PGRST116') {
          console.error('Error checking email:', emailCheckError);
        }
        if (!username.trim()) {
          setError('Please enter a username');
          setLoading(false);
          return;
        }
        if (username.length < 3) {
          setError('Username must be at least 3 characters');
          setLoading(false);
          return;
        }
        // Validate username format: only letters, numbers, dots, underscores, and hyphens
        const usernameRegex = /^[a-zA-Z0-9._-]+$/;
        if (!usernameRegex.test(username)) {
          setError('Username can only contain letters, numbers, dots (.), underscores (_), and hyphens (-)');
          setLoading(false);
          return;
        }
        
        // Check for profanity
        if (containsProfanity(username)) {
          setError('Username contains inappropriate language. Please choose a different username.');
          setLoading(false);
          return;
        }
        
        if (password.length < 8) {
          setError('Password must be at least 8 characters');
          setLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }

        // Check if username already exists (case-insensitive)
        const { data: existingUsers, error: checkError } = await supabase
          .from('profiles')
          .select('username');
        
        // Check case-insensitively in JavaScript since Supabase doesn't support case-insensitive queries directly
        const usernameLower = username.trim().toLowerCase();
        const existingUser = existingUsers?.find(u => u.username.toLowerCase() === usernameLower);

        if (existingUser) {
          setError('This username is already taken. Please choose another.');
          setLoading(false);
          return;
        }

        // If checkError is not "no rows found", it's a real error
        if (checkError && checkError.code !== 'PGRST116') {
          console.error('Error checking username:', checkError);
        }
        
        // Sign up with Supabase
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username: username.trim(),
            },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });

        if (signUpError) {
          // Check if it's a duplicate email error
          if (signUpError.message.includes('email') && (signUpError.message.includes('already') || signUpError.message.includes('exists') || signUpError.message.includes('registered'))) {
            setError('This email is already registered. Please use a different email or try logging in.');
          } else {
            setError(signUpError.message);
          }
          setLoading(false);
          return;
        }

        // Update profile with username (if profile was created by trigger)
        if (data.user) {
          const { error: profileError } = await supabase
            .from('profiles')
            .update({ username: username.trim() })
            .eq('user_id', data.user.id);

          if (profileError) {
            // Check if it's a duplicate username error
            if (profileError.code === '23505' || profileError.message.includes('unique') || profileError.message.includes('duplicate')) {
              setError('This username is already taken. Please choose another.');
              setLoading(false);
              return;
            }
            console.error('Error updating profile:', profileError);
          }
        }

        setVerificationSent(true);
        setLoading(false);
      } else if (mode === 'login') {
        // Login with Supabase
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          setError(signInError.message);
          setLoading(false);
          return;
        }

        // Success - auth state will be updated via useAuth hook
        onAuth();
        onClose();
      } else if (mode === 'forgot') {
        // Send password reset email
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/reset-password`,
        });

        if (resetError) {
          setError(resetError.message);
          setLoading(false);
          return;
        }

        setResetEmailSent(true);
        setLoading(false);
      }
    } catch (err) {
      setError('An unexpected error occurred');
      setLoading(false);
    }
  };

  if (verificationSent) {
    return (
      <div className="fixed inset-0 bg-[var(--color-ink)] bg-opacity-60 flex items-center justify-center p-4 z-50">
        <div className="max-w-md w-full bg-[var(--color-aged-paper)] border-2 border-[var(--color-ink)] p-8 shadow-[8px_8px_0px_0px_rgba(44,36,22,0.4)] relative">
          <div className="absolute top-3 right-3 w-12 h-12 border-t-2 border-r-2 border-[var(--color-gold)] opacity-40" />
          <div className="absolute bottom-3 left-3 w-12 h-12 border-b-2 border-l-2 border-[var(--color-gold)] opacity-40" />
          
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-[var(--color-library-green)] mx-auto mb-4" />
            <h2 className="text-[var(--color-ink)] mb-4">Verification Sent</h2>
            <p className="text-[var(--color-faded-ink)] mb-2">
              A verification link has been sent to:
            </p>
            <p className="text-[var(--color-burgundy)] mb-6">{email}</p>
            <div className="p-4 border border-[var(--color-faded-ink)] bg-[var(--color-overlay)]">
              <p className="text-sm text-[var(--color-faded-ink)]">
                Please check your inbox and click the verification link to complete your registration.
              </p>
            </div>
            <button
              onClick={onClose}
              className="mt-4 text-xs text-[var(--color-faded-ink)] hover:text-[var(--color-ink)] hover:underline"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (resetEmailSent) {
    return (
      <div className="fixed inset-0 bg-[var(--color-ink)] bg-opacity-60 flex items-center justify-center p-4 z-50">
        <div className="max-w-md w-full bg-[var(--color-aged-paper)] border-2 border-[var(--color-ink)] p-8 shadow-[8px_8px_0px_0px_rgba(44,36,22,0.4)] relative">
          <div className="absolute top-3 right-3 w-12 h-12 border-t-2 border-r-2 border-[var(--color-gold)] opacity-40" />
          <div className="absolute bottom-3 left-3 w-12 h-12 border-b-2 border-l-2 border-[var(--color-gold)] opacity-40" />
          
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-[var(--color-library-green)] mx-auto mb-4" />
            <h2 className="text-[var(--color-ink)] mb-4">Reset Link Sent</h2>
            <p className="text-[var(--color-faded-ink)] mb-2">
              A password reset link has been sent to:
            </p>
            <p className="text-[var(--color-burgundy)] mb-6">{email}</p>
            <div className="p-4 border border-[var(--color-faded-ink)] bg-[var(--color-overlay)]">
              <p className="text-sm text-[var(--color-faded-ink)]">
                Please check your inbox and click the reset link to set a new password.
              </p>
            </div>
            <button
              onClick={() => {
                setResetEmailSent(false);
                setMode('login');
                setEmail('');
              }}
              className="mt-4 text-xs text-[var(--color-faded-ink)] hover:text-[var(--color-ink)] hover:underline"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[var(--color-ink)] bg-opacity-60 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="max-w-4xl w-full max-h-[90vh] bg-[var(--color-aged-paper)] border-2 border-[var(--color-ink)] shadow-[8px_8px_0px_0px_rgba(44,36,22,0.4)] relative flex flex-col md:flex-row overflow-hidden my-auto">
        {/* Image section */}
        <div className="md:w-1/2 relative hidden md:block flex-shrink-0">
          <img 
            src="https://images.unsplash.com/photo-1576769619992-ff94a24e9474?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvcGhlbGlhJTIwcGFpbnRpbmd8ZW58MXx8fHwxNzY1MzA3MjU3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
            alt="Classical artwork"
            className="w-full h-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[var(--color-aged-paper)]" />
        </div>
        
        {/* Form section */}
        <div className="md:w-1/2 p-3 md:p-4 relative overflow-y-auto flex-shrink-0">
          <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-[var(--color-gold)] opacity-40" />
          <div className="absolute bottom-2 left-2 w-8 h-8 border-b-2 border-l-2 border-[var(--color-gold)] opacity-40" />
          
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-[var(--color-faded-ink)] hover:text-[var(--color-ink)] transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="text-center mb-2">
            <div className="flex items-center justify-center mb-1">
              <BookOpen className="w-6 h-6 md:w-7 md:h-7 text-[var(--color-burgundy)]" />
            </div>
            <h2 className="text-[var(--color-ink)] mb-0.5 text-base md:text-lg">Enter Ophilia</h2>
            <p className="text-xs text-[var(--color-faded-ink)] italic">
              UChicago students only
            </p>
          </div>

          {/* Mode Toggle */}
          <div className="flex gap-2 mb-2">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError('');
              }}
              className={`flex-1 py-2 border-2 transition-all ${
                mode === 'login'
                  ? 'border-[var(--color-burgundy)] bg-[var(--color-burgundy)] text-[var(--color-parchment)]'
                  : 'border-[var(--color-faded-ink)] text-[var(--color-faded-ink)] hover:border-[var(--color-ink)]'
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setError('');
              }}
              className={`flex-1 py-2 border-2 transition-all ${
                mode === 'signup'
                  ? 'border-[var(--color-burgundy)] bg-[var(--color-burgundy)] text-[var(--color-parchment)]'
                  : 'border-[var(--color-faded-ink)] text-[var(--color-faded-ink)] hover:border-[var(--color-ink)]'
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-1.5">
            {/* Email Field */}
            <div>
              <label className="block mb-0.5 text-[var(--color-ink)] text-xs tracking-wide uppercase">
                UChicago Email
              </label>
              <div className="relative">
                <Mail className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--color-faded-ink)]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.name@uchicago.edu"
                  className="w-full pl-9 pr-2.5 py-1.5 text-sm bg-[var(--color-parchment)] border-2 border-[var(--color-faded-ink)] focus:border-[var(--color-ink)] focus:outline-none"
                  required
                />
              </div>
              <p className="text-xs text-[var(--color-faded-ink)] mt-0.5 italic">
                Must be a valid @uchicago.edu email address
              </p>
            </div>

            {/* Username Field (Sign Up Only) */}
            {mode === 'signup' && (
              <div>
                <label className="block mb-0.5 text-[var(--color-ink)] text-xs tracking-wide uppercase">
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--color-faded-ink)]" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    className="w-full pl-9 pr-2.5 py-1.5 text-sm bg-[var(--color-parchment)] border-2 border-[var(--color-faded-ink)] focus:border-[var(--color-ink)] focus:outline-none"
                    required
                  />
                </div>
              </div>
            )}

            {/* Password Field (Login and Signup only) */}
            {mode !== 'forgot' && (
              <div>
                <label className="block mb-0.5 text-[var(--color-ink)] text-xs tracking-wide uppercase">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--color-faded-ink)]" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-9 pr-2.5 py-1.5 text-sm bg-[var(--color-parchment)] border-2 border-[var(--color-faded-ink)] focus:border-[var(--color-ink)] focus:outline-none"
                    required
                  />
                </div>
              </div>
            )}

            {/* Confirm Password (Sign Up Only) */}
            {mode === 'signup' && (
              <div>
                <label className="block mb-0.5 text-[var(--color-ink)] text-xs tracking-wide uppercase">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--color-faded-ink)]" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    className="w-full pl-9 pr-2.5 py-1.5 text-sm bg-[var(--color-parchment)] border-2 border-[var(--color-faded-ink)] focus:border-[var(--color-ink)] focus:outline-none"
                    required
                  />
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-1.5 border border-[var(--color-burgundy)] bg-[var(--color-parchment)] flex items-start gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-[var(--color-burgundy)] flex-shrink-0 mt-0.5" />
                <p className="text-xs text-[var(--color-burgundy)]">{error}</p>
              </div>
            )}

            {/* Additional Info - moved before submit button for signup */}
            {mode === 'signup' && (
              <div className="p-1.5 border border-[var(--color-faded-ink)] bg-[var(--color-overlay)]">
                <p className="text-xs text-[var(--color-faded-ink)] leading-relaxed">
                  <strong>Note:</strong> Upon registration, a verification email will be sent to your UChicago email address. You must verify your email before accessing full features.
                </p>
              </div>
            )}

            {/* Forgot Password Link (Login mode only) */}
            {mode === 'login' && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => {
                    setMode('forgot');
                    setError('');
                    setPassword('');
                  }}
                  className="text-xs text-[var(--color-faded-ink)] hover:text-[var(--color-ink)] hover:underline"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {/* Back to Login (Forgot mode) */}
            {mode === 'forgot' && (
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError('');
                    setEmail('');
                  }}
                  className="text-xs text-[var(--color-faded-ink)] hover:text-[var(--color-ink)] hover:underline"
                >
                  ← Back to Login
                </button>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-1.5 border-2 border-[var(--color-ink)] bg-[var(--color-ink)] text-[var(--color-parchment)] hover:bg-[var(--color-burgundy)] hover:border-[var(--color-burgundy)] transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading 
                ? 'Processing...' 
                : mode === 'login' 
                  ? 'Enter the Archives' 
                  : mode === 'signup'
                    ? 'Create Account'
                    : 'Send Reset Link'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

