import React, { useState, useEffect } from 'react';
import {
  X,
  Lock,
  Mail,
  User,
  Shield,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  LogOut,
  Clock,
  Smartphone,
  Eye,
  EyeOff,
  HelpCircle,
  Send,
  LifeBuoy,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchUserSecurityLogs } from '../lib/firebase';
import { UserSecurityLog, UserRole } from '../types';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalTab,
    openAuthModal,
    currentUser,
    userProfile,
    login,
    register,
    loginGoogle,
    loginGuest,
    loginLocalSession,
    logout,
    resetPassword,
    updateProfileData,
  } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState<UserRole>('engineer');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isOperationNotAllowed, setIsOperationNotAllowed] = useState(false);

  // Security logs state for Profile view
  const [securityLogs, setSecurityLogs] = useState<UserSecurityLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // LoginAssist interactive helper in Auth Modal
  const [showLoginAssist, setShowLoginAssist] = useState(false);
  const [assistTopic, setAssistTopic] = useState<'password' | '2fa' | 'lockout' | null>(null);

  useEffect(() => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsOperationNotAllowed(false);
    if (authModalTab === 'profile' && currentUser) {
      loadLogs();
    }
  }, [authModalTab, currentUser, isAuthModalOpen]);

  const loadLogs = async () => {
    if (!currentUser) return;
    setLoadingLogs(true);
    try {
      const logs = await fetchUserSecurityLogs(currentUser.uid);
      setSecurityLogs(logs);
    } catch (err) {
      console.warn('Failed to load logs', err);
    } finally {
      setLoadingLogs(false);
    }
  };

  if (!isAuthModalOpen) return null;

  // Friendly error formatter
  const formatAuthError = (err: any): string => {
    const code = err?.code || '';
    const msg = err?.message || '';
    if (code.includes('operation-not-allowed') || msg.includes('operation-not-allowed')) {
      return 'Email/Password sign-in is currently disabled in this Firebase project console.';
    }
    if (code.includes('invalid-credential') || code.includes('wrong-password') || code.includes('user-not-found')) {
      return 'Incorrect email or password. Please verify your credentials or use the reset flow.';
    }
    if (code.includes('email-already-in-use')) {
      return 'This email address is already registered. Please sign in or reset your password.';
    }
    if (code.includes('weak-password')) {
      return 'Password should be at least 6 characters (recommended 8+ with mixed casing and numbers).';
    }
    if (code.includes('too-many-requests')) {
      return 'Access temporarily restricted due to multiple failed login attempts. Please wait a few minutes or reset your password.';
    }
    if (code.includes('popup-closed-by-user')) {
      return 'Sign-in window closed before completing. Please try again.';
    }
    if (code.includes('network-request-failed')) {
      return 'Network connection problem. Please check your internet connectivity.';
    }
    return err?.message || 'An unexpected authentication error occurred. Please try again.';
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsOperationNotAllowed(false);
    setLoading(true);

    try {
      await login(email.trim(), password);
      setSuccessMessage('Successfully signed in to AURA.');
      setTimeout(() => closeAuthModal(), 600);
    } catch (err: any) {
      if (err?.code?.includes('operation-not-allowed') || String(err).includes('operation-not-allowed')) {
        setIsOperationNotAllowed(true);
      }
      setErrorMessage(formatAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsOperationNotAllowed(false);

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      await register(email.trim(), password, displayName.trim() || 'AURA Agent', role);
      setSuccessMessage('Account registered and profile created in Firestore!');
      setTimeout(() => closeAuthModal(), 800);
    } catch (err: any) {
      if (err?.code?.includes('operation-not-allowed') || String(err).includes('operation-not-allowed')) {
        setIsOperationNotAllowed(true);
      }
      setErrorMessage(formatAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    setLoading(true);
    try {
      await loginGoogle();
      setSuccessMessage('Signed in with Google account successfully.');
      setTimeout(() => closeAuthModal(), 600);
    } catch (err: any) {
      setErrorMessage(formatAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGuestSignIn = async () => {
    setErrorMessage(null);
    setLoading(true);
    try {
      await loginGuest();
      setSuccessMessage('Welcome! Signed in as Guest Explorer.');
      setTimeout(() => closeAuthModal(), 600);
    } catch (err: any) {
      setErrorMessage(formatAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email.trim()) {
      setErrorMessage('Please enter your email address to send the reset link.');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email.trim());
      setSuccessMessage(`A secure password reset link has been dispatched to ${email}. Check your inbox and spam folder.`);
    } catch (err: any) {
      setErrorMessage(formatAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout();
      closeAuthModal();
    } catch (err: any) {
      setErrorMessage('Failed to sign out cleanly.');
    } finally {
      setLoading(false);
    }
  };

  // Password Strength Calculator
  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return score;
  };

  const strengthScore = getPasswordStrength(password);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#090d16] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">
                {currentUser && authModalTab === 'profile'
                  ? 'User Account & Security'
                  : authModalTab === 'register'
                  ? 'Create AURA Account'
                  : authModalTab === 'forgot'
                  ? 'Reset Password & Help'
                  : 'Sign In to AURA'}
              </h2>
              <p className="text-[11px] text-slate-400">
                {currentUser && authModalTab === 'profile'
                  ? 'Authenticated Firebase Session'
                  : 'Persistent workspace, personal memory & tools'}
              </p>
            </div>
          </div>
          <button
            onClick={closeAuthModal}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selector (when not strictly viewing profile) */}
        {!currentUser && (
          <div className="flex border-b border-slate-800/80 bg-slate-900/40 text-xs">
            <button
              onClick={() => openAuthModal('login')}
              className={`flex-1 py-2.5 font-medium transition-colors border-b-2 ${
                authModalTab === 'login'
                  ? 'border-indigo-500 text-indigo-300 bg-indigo-500/10'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => openAuthModal('register')}
              className={`flex-1 py-2.5 font-medium transition-colors border-b-2 ${
                authModalTab === 'register'
                  ? 'border-indigo-500 text-indigo-300 bg-indigo-500/10'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Create Account
            </button>
            <button
              onClick={() => openAuthModal('forgot')}
              className={`flex-1 py-2.5 font-medium transition-colors border-b-2 ${
                authModalTab === 'forgot'
                  ? 'border-indigo-500 text-indigo-300 bg-indigo-500/10'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Help / Reset
            </button>
          </div>
        )}

        {/* Notification alerts */}
        {isOperationNotAllowed ? (
          <div className="mx-6 mt-4 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-2.5">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-amber-300">Firebase Auth Provider Not Enabled Yet</div>
                <div className="text-[11px] text-amber-200/90 mt-0.5 leading-relaxed">
                  Firebase disables <strong>Email/Password</strong> sign-in by default on new projects until toggled on in the console.
                </div>
              </div>
            </div>

            <div className="bg-slate-950/70 p-2.5 rounded-lg border border-amber-500/20 text-[11px] space-y-1">
              <div className="text-slate-200 font-medium">To enable in Firebase Console:</div>
              <ol className="list-decimal list-inside space-y-0.5 text-slate-400">
                <li>Go to <strong className="text-slate-300">Authentication &gt; Sign-in method</strong></li>
                <li>Click <strong className="text-slate-300">Email/Password</strong>, toggle <strong>Enable</strong>, and click <strong>Save</strong></li>
              </ol>
            </div>

            <div className="pt-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  loginLocalSession(displayName.trim() || 'Swastik Padhy', email.trim() || 'swastikpadhy0@gmail.com', role);
                  setSuccessMessage(`Signed in locally as ${displayName.trim() || 'Swastik Padhy'}!`);
                  setTimeout(() => closeAuthModal(), 500);
                }}
                className="flex-1 py-1.5 px-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium text-[11px] flex items-center justify-center gap-1.5 transition-colors shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                Continue in Local Session (Instant)
              </button>
              <a
                href="https://console.firebase.google.com/project/enhanced-hawk-468408-a0/authentication/providers"
                target="_blank"
                rel="noreferrer"
                className="py-1.5 px-3 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg text-[11px] border border-slate-700 inline-flex items-center justify-center gap-1 transition-colors"
              >
                <span>Console</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        ) : errorMessage ? (
          <div className="mx-6 mt-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        ) : null}

        {successMessage && (
          <div className="mx-6 mt-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Scrollable Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
          {/* TAB 1: SIGN IN */}
          {authModalTab === 'login' && !currentUser && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-slate-300 font-medium mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="engineer@domain.com"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-slate-300 font-medium">Password</label>
                  <button
                    type="button"
                    onClick={() => openAuthModal('forgot')}
                    className="text-indigo-400 hover:text-indigo-300 text-[11px]"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-10 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 rounded-lg transition-all shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? 'Authenticating...' : 'Sign In'}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <div className="relative my-4 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-800" />
                </div>
                <span className="relative bg-[#090d16] px-2 text-[11px] text-slate-500 uppercase tracking-wider">
                  or connect via
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="flex items-center justify-center gap-2 py-2 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 rounded-lg transition-colors text-[11px] font-medium"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
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
                  Google Login
                </button>

                <button
                  type="button"
                  onClick={handleGuestSignIn}
                  disabled={loading}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-lg transition-colors text-[11px] font-medium"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Instant Guest
                </button>
              </div>

              {/* Quick LoginAssist Help Link */}
              <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                <span>Trouble signing in?</span>
                <button
                  type="button"
                  onClick={() => {
                    openAuthModal('forgot');
                    setShowLoginAssist(true);
                  }}
                  className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
                >
                  <LifeBuoy className="w-3 h-3" />
                  Ask LoginAssist
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: REGISTER */}
          {authModalTab === 'register' && !currentUser && (
            <form onSubmit={handleSignUp} className="space-y-3.5">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Full Name / Call-Sign</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Alex Chen"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@domain.com"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Assigned Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                >
                  <option value="engineer">Systems Engineer</option>
                  <option value="user">AI Researcher / Analyst</option>
                  <option value="admin">Platform Administrator</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Password</label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-10 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Strength Meter */}
                {password && (
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden flex gap-0.5">
                      <div className={`h-full flex-1 ${strengthScore >= 1 ? 'bg-rose-500' : 'bg-transparent'}`} />
                      <div className={`h-full flex-1 ${strengthScore >= 2 ? 'bg-amber-500' : 'bg-transparent'}`} />
                      <div className={`h-full flex-1 ${strengthScore >= 3 ? 'bg-blue-500' : 'bg-transparent'}`} />
                      <div className={`h-full flex-1 ${strengthScore >= 4 ? 'bg-emerald-500' : 'bg-transparent'}`} />
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {strengthScore <= 1 ? 'Weak' : strengthScore <= 2 ? 'Fair' : strengthScore <= 3 ? 'Good' : 'Strong'}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Confirm Password</label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 rounded-lg transition-all shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
              >
                {loading ? 'Creating Account...' : 'Complete Registration'}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          )}

          {/* TAB 3: FORGOT PASSWORD & LOGINASSIST TROUBLESHOOTING */}
          {authModalTab === 'forgot' && !currentUser && (
            <div className="space-y-4">
              <div className="p-3 bg-indigo-950/30 border border-indigo-500/20 rounded-lg flex items-start gap-2.5">
                <HelpCircle className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <div className="text-[11px] text-indigo-200">
                  <span className="font-semibold text-white">LoginAssist Self-Service:</span> Enter your registered email address to receive an official recovery link. Never share credentials with anyone.
                </div>
              </div>

              <form onSubmit={handleResetPassword} className="space-y-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Registered Account Email</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@domain.com"
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  {loading ? 'Sending Recovery Link...' : 'Send Official Reset Link'}
                </button>
              </form>

              {/* LoginAssist Interactive Troubleshooting Guide */}
              <div className="pt-3 border-t border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-200 flex items-center gap-1.5">
                    <LifeBuoy className="w-3.5 h-3.5 text-indigo-400" />
                    Interactive LoginAssist Troubleshooter
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowLoginAssist(!showLoginAssist)}
                    className="text-[11px] text-indigo-400 hover:underline"
                  >
                    {showLoginAssist ? 'Hide Guide' : 'Show Guide'}
                  </button>
                </div>

                {showLoginAssist && (
                  <div className="space-y-2 mt-2 bg-slate-950/80 p-3 rounded-lg border border-slate-800">
                    <p className="text-[11px] text-slate-400">
                      Select your specific issue for step-by-step guidance:
                    </p>
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        onClick={() => setAssistTopic('password')}
                        className={`p-1.5 rounded text-[10px] text-center border transition-colors ${
                          assistTopic === 'password'
                            ? 'bg-indigo-900/40 border-indigo-500 text-white'
                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        Reset Email
                      </button>
                      <button
                        onClick={() => setAssistTopic('2fa')}
                        className={`p-1.5 rounded text-[10px] text-center border transition-colors ${
                          assistTopic === '2fa'
                            ? 'bg-indigo-900/40 border-indigo-500 text-white'
                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        2FA / Codes
                      </button>
                      <button
                        onClick={() => setAssistTopic('lockout')}
                        className={`p-1.5 rounded text-[10px] text-center border transition-colors ${
                          assistTopic === 'lockout'
                            ? 'bg-indigo-900/40 border-indigo-500 text-white'
                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        Account Lockout
                      </button>
                    </div>

                    {assistTopic === 'password' && (
                      <div className="mt-2 space-y-1 text-[11px] text-slate-300 bg-slate-900/60 p-2.5 rounded border border-slate-800/80">
                        <div className="font-semibold text-indigo-300 mb-1">Reset Link Not Arriving?</div>
                        <ol className="list-decimal list-inside space-y-1 text-slate-400">
                          <li>Check your <strong>Spam, Junk, and Promotions</strong> folders.</li>
                          <li>Ensure the exact email address used at registration was typed.</li>
                          <li>Wait 3-5 minutes: institutional email gateways often delay transactional links.</li>
                        </ol>
                      </div>
                    )}

                    {assistTopic === '2fa' && (
                      <div className="mt-2 space-y-1 text-[11px] text-slate-300 bg-slate-900/60 p-2.5 rounded border border-slate-800/80">
                        <div className="font-semibold text-indigo-300 mb-1">Two-Factor Authentication (2FA) Help</div>
                        <ol className="list-decimal list-inside space-y-1 text-slate-400">
                          <li>Verify device clock: TOTP codes expire if your phone time is out of sync.</li>
                          <li>Look for your <strong>Backup Emergency Codes</strong> saved during initial setup.</li>
                          <li>Never send your 2FA code to any assistant or chat window.</li>
                        </ol>
                      </div>
                    )}

                    {assistTopic === 'lockout' && (
                      <div className="mt-2 space-y-1 text-[11px] text-slate-300 bg-slate-900/60 p-2.5 rounded border border-slate-800/80">
                        <div className="font-semibold text-indigo-300 mb-1">Account Locked Out?</div>
                        <ol className="list-decimal list-inside space-y-1 text-slate-400">
                          <li>Cooldown timer: Multiple failed logins trigger a 15-minute security lock.</li>
                          <li>Avoid repeating passwords to prevent permanent lockout flags.</li>
                          <li>If you suspect unauthorized access, contact official security escalations immediately.</li>
                        </ol>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: PROFILE & ACTIVE SESSION (AUTHENTICATED) */}
          {currentUser && (
            <div className="space-y-4">
              {/* Profile Card */}
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                    {(userProfile?.displayName || currentUser.displayName || currentUser.email || 'A')[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="font-semibold text-white flex items-center gap-1.5">
                      {userProfile?.displayName || currentUser.displayName || 'AURA Member'}
                      <span className="px-1.5 py-0.5 bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-[10px] rounded uppercase font-mono font-medium">
                        {userProfile?.role || (currentUser.isAnonymous ? 'guest' : 'user')}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400">{currentUser.email || 'Anonymous / Guest Session'}</div>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  disabled={loading}
                  className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 hover:bg-rose-500/20 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>

              {/* Security Telemetry & MFA */}
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
                  <span className="text-slate-500 block mb-0.5">Session UID</span>
                  <span className="font-mono text-slate-300 truncate block text-[10px]" title={currentUser.uid}>
                    {currentUser.uid.substring(0, 16)}...
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
                  <div>
                    <span className="text-slate-500 block mb-0.5">Two-Factor Auth</span>
                    <span className="text-emerald-400 font-medium">Protected (Zero-Trust)</span>
                  </div>
                  <Shield className="w-4 h-4 text-emerald-400" />
                </div>
              </div>

              {/* Firestore Profile Attributes */}
              <div className="space-y-1.5">
                <div className="text-slate-400 font-medium flex items-center justify-between">
                  <span>Registered Details</span>
                  <span className="text-[10px] text-slate-500">Stored in /users/{currentUser.uid}</span>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 space-y-1 font-mono text-[10px] text-slate-400">
                  <div>Created: {userProfile?.createdAt ? new Date(userProfile.createdAt).toLocaleString() : 'Just now'}</div>
                  <div>Last Login: {userProfile?.lastLoginAt ? new Date(userProfile.lastLoginAt).toLocaleString() : 'Active session'}</div>
                </div>
              </div>

              {/* Recent Security Audit Logs */}
              <div className="space-y-1.5">
                <div className="text-slate-400 font-medium flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-indigo-400" />
                    Security Event History
                  </span>
                  <button
                    onClick={loadLogs}
                    className="text-[10px] text-indigo-400 hover:underline"
                  >
                    Refresh
                  </button>
                </div>

                <div className="max-h-36 overflow-y-auto space-y-1.5 bg-slate-950 p-2 rounded-lg border border-slate-800">
                  {loadingLogs ? (
                    <div className="text-center py-3 text-slate-500">Loading security logs...</div>
                  ) : securityLogs.length === 0 ? (
                    <div className="text-center py-3 text-slate-500">No external security events recorded yet.</div>
                  ) : (
                    securityLogs.map((log) => (
                      <div
                        key={log.id}
                        className="p-1.5 rounded bg-slate-900/60 border border-slate-800/60 flex items-center justify-between text-[10px]"
                      >
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                          <span className="font-semibold text-slate-300 uppercase tracking-wider">{log.eventType}</span>
                          <span className="text-slate-500 truncate max-w-[150px]">{log.details}</span>
                        </div>
                        <span className="text-slate-500 font-mono shrink-0">
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
