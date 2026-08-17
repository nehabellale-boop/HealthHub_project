import React, { useState } from 'react';
import {
  Eye,
  EyeOff,
  Lock,
  User,
  ArrowRight,
  KeyRound,
  Mail,
  AlertCircle,
  CheckCircle2,
  Shield,
} from 'lucide-react';
import { UserAccount } from '../../types';
import { AuthLayout } from './AuthLayout';

interface LoginPageProps {
  onAuthenticate: (user: UserAccount) => void;
  onNavigateToRegister: () => void;
  mockAccounts: Record<string, { pass: string; user: UserAccount }>;
  successMessage?: string | null;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onAuthenticate,
  onNavigateToRegister,
  mockAccounts,
  successMessage,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Forgot password flow state
  const [forgotPasswordStep, setForgotPasswordStep] = useState<
    'closed' | 'email' | 'code' | 'new_password' | 'success'
  >('closed');
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [forgotPasswordError, setForgotPasswordError] = useState<string | null>(null);

  // Demo autofill quick selector toggle
  const [showDemoAccounts, setShowDemoAccounts] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanUsername = username.trim().toLowerCase();
    if (!cleanUsername || !password) {
      setErrorMessage('Please provide both username and password.');
      return;
    }

    setIsLoading(true);

    // Simulate backend network latency & authentication verification
    setTimeout(() => {
      // Find matching mock user by username or email
      let match = mockAccounts[cleanUsername];
      if (!match) {
        // Search by email
        const entry = Object.values(mockAccounts).find(
          (acc: { pass: string; user: UserAccount }) => acc.user.email.toLowerCase() === cleanUsername
        );
        if (entry) match = entry;
      }

      if (match && match.pass === password) {
        setIsLoading(false);
        onAuthenticate(match.user);
      } else {
        setIsLoading(false);
        setErrorMessage(
          'Invalid credentials. Please check your username/email and password, or use the demo credentials below.'
        );
      }
    }, 600);
  };

  const handleAutofill = (userKey: string) => {
    const acc = mockAccounts[userKey];
    if (acc) {
      setUsername(acc.user.username);
      setPassword(acc.pass);
      setErrorMessage(null);
      setShowDemoAccounts(false);
    }
  };

  const handleForgotPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotPasswordError(null);
    setForgotPasswordLoading(true);

    setTimeout(() => {
      setForgotPasswordLoading(false);
      if (!resetEmail.includes('@')) {
        setForgotPasswordError('Please enter a valid clinical email address.');
        return;
      }
      setForgotPasswordStep('code');
    }, 500);
  };

  const handleVerifyCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotPasswordLoading(true);
    setTimeout(() => {
      setForgotPasswordLoading(false);
      setForgotPasswordStep('new_password');
    }, 500);
  };

  const handleResetPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setForgotPasswordError('Password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setForgotPasswordError('Passwords do not match.');
      return;
    }

    setForgotPasswordLoading(true);
    setTimeout(() => {
      setForgotPasswordLoading(false);
      setForgotPasswordStep('success');
    }, 600);
  };

  return (
    <AuthLayout subtitle="Clinical Authentication Portal">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Sign in to Clinic</h2>
          <p className="text-xs text-slate-500 mt-1">
            Enter your credentials to access your authorized clinical workspace.
          </p>
        </div>

        {/* Registration Success Banner */}
        {successMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
            <div className="font-semibold leading-tight">{successMessage}</div>
          </div>
        )}

        {/* Error Banner */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <div className="leading-tight">{errorMessage}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username / Email Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Email or Clinical Username *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                placeholder="e.g. admin, dr_vance, or sarah.jenkins@example.com"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Password *
              </label>
              <button
                type="button"
                onClick={() => setForgotPasswordStep('email')}
                className="text-[11px] font-medium text-teal-600 hover:text-teal-700 hover:underline"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Enter your security password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
              />
              <span className="text-xs text-slate-600">Remember this workstation</span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !username || !password}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Sign In to Clinical Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Link to Registration Page */}
        <div className="pt-2 text-center text-xs text-slate-500 border-t border-slate-100">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={onNavigateToRegister}
            className="font-semibold text-teal-600 hover:text-teal-700 hover:underline"
          >
            Create an account
          </button>
        </div>

        {/* Quick Demo Credentials Assistant */}
        <div className="pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-teal-600" />
              Demo Roles Quick-Fill
            </span>
            <button
              type="button"
              onClick={() => setShowDemoAccounts(!showDemoAccounts)}
              className="text-[11px] text-teal-600 font-medium hover:underline"
            >
              {showDemoAccounts ? 'Hide' : 'Show All'}
            </button>
          </div>

          {/* Quick-fill pills */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleAutofill('admin')}
              className="p-2 text-left rounded-lg border border-slate-200 hover:border-slate-400 bg-slate-50/70 hover:bg-slate-100 transition-all text-xs"
            >
              <div className="font-bold text-slate-800">Admin</div>
              <div className="text-[10px] text-slate-400 font-mono">admin / admin123</div>
            </button>
            <button
              type="button"
              onClick={() => handleAutofill('dr_vance')}
              className="p-2 text-left rounded-lg border border-slate-200 hover:border-slate-400 bg-slate-50/70 hover:bg-slate-100 transition-all text-xs"
            >
              <div className="font-bold text-teal-700">Doctor</div>
              <div className="text-[10px] text-slate-400 font-mono">dr_vance / doctor123</div>
            </button>
            <button
              type="button"
              onClick={() => handleAutofill('john_doe')}
              className="p-2 text-left rounded-lg border border-slate-200 hover:border-slate-400 bg-slate-50/70 hover:bg-slate-100 transition-all text-xs"
            >
              <div className="font-bold text-sky-700">Patient</div>
              <div className="text-[10px] text-slate-400 font-mono">john_doe / patient123</div>
            </button>
            {showDemoAccounts && (
              <>
                <button
                  type="button"
                  onClick={() => handleAutofill('receptionist')}
                  className="p-2 text-left rounded-lg border border-slate-200 hover:border-slate-400 bg-slate-50/70 hover:bg-slate-100 transition-all text-xs"
                >
                  <div className="font-bold text-indigo-700">Receptionist</div>
                  <div className="text-[10px] text-slate-400 font-mono">receptionist / staff123</div>
                </button>
                <button
                  type="button"
                  onClick={() => handleAutofill('hr_staff')}
                  className="p-2 text-left rounded-lg border border-slate-200 hover:border-slate-400 bg-slate-50/70 hover:bg-slate-100 transition-all text-xs"
                >
                  <div className="font-bold text-purple-700">HR Staff</div>
                  <div className="text-[10px] text-slate-400 font-mono">hr_staff / staff123</div>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* FORGOT PASSWORD MODAL */}
      {forgotPasswordStep !== 'closed' && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[1055] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in">
            {forgotPasswordStep === 'email' && (
              <div>
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-3">
                  <Mail className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Reset Your Security Password</h3>
                <p className="text-xs text-slate-500 mt-1 mb-4">
                  Enter your verified clinical email address to receive a secure password recovery code.
                </p>

                {forgotPasswordError && (
                  <div className="mb-3 p-2.5 rounded-lg bg-rose-50 text-rose-700 text-xs">
                    {forgotPasswordError}
                  </div>
                )}

                <form onSubmit={handleForgotPasswordSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Clinical Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. robert.hayes@healthhub.org"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setForgotPasswordStep('closed')}
                      className="flex-1 py-2 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={forgotPasswordLoading || !resetEmail}
                      className="flex-1 py-2 px-3 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 disabled:opacity-50"
                    >
                      {forgotPasswordLoading ? 'Dispatching...' : 'Send Recovery Code'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {forgotPasswordStep === 'code' && (
              <div>
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-3">
                  <KeyRound className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Enter Security Code</h3>
                <p className="text-xs text-slate-500 mt-1 mb-4">
                  We've sent a 6-digit recovery code to <strong className="text-slate-800">{resetEmail}</strong>.
                </p>

                <form onSubmit={handleVerifyCodeSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      6-Digit Code
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      placeholder="e.g. 849201"
                      value={resetCode}
                      onChange={(e) => setResetCode(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono tracking-widest text-center focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setForgotPasswordStep('email')}
                      className="flex-1 py-2 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={forgotPasswordLoading || resetCode.length < 4}
                      className="flex-1 py-2 px-3 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 disabled:opacity-50"
                    >
                      {forgotPasswordLoading ? 'Validating...' : 'Verify Code'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {forgotPasswordStep === 'new_password' && (
              <div>
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-3">
                  <Lock className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Set New Security Password</h3>
                <p className="text-xs text-slate-500 mt-1 mb-4">
                  Choose a new strong password for your clinical account.
                </p>

                {forgotPasswordError && (
                  <div className="mb-3 p-2.5 rounded-lg bg-rose-50 text-rose-700 text-xs">
                    {forgotPasswordError}
                  </div>
                )}

                <form onSubmit={handleResetPasswordSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      New Password (min 8 chars)
                    </label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setForgotPasswordStep('closed')}
                      className="flex-1 py-2 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={forgotPasswordLoading || !newPassword || !confirmPassword}
                      className="flex-1 py-2 px-3 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 disabled:opacity-50"
                    >
                      {forgotPasswordLoading ? 'Updating...' : 'Update Password'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {forgotPasswordStep === 'success' && (
              <div className="text-center py-3 space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Password Updated Successfully</h3>
                <p className="text-xs text-slate-500">
                  Your credentials have been securely updated. You may now sign in with your new password.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setForgotPasswordStep('closed');
                    setResetEmail('');
                    setResetCode('');
                    setNewPassword('');
                    setConfirmPassword('');
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 mt-2"
                >
                  Return to Sign In
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </AuthLayout>
  );
};
