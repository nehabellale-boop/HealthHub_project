import React, { useState, useEffect, useRef } from 'react';
import {
  Mail,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Clock,
  RotateCw,
  Shield,
  KeyRound,
} from 'lucide-react';
import { AuthLayout } from './AuthLayout';

interface VerifyOtpPageProps {
  email: string;
  onVerificationSuccess: () => void;
  onChangeEmail: () => void;
}

export const VerifyOtpPage: React.FC<VerifyOtpPageProps> = ({
  email,
  onVerificationSuccess,
  onChangeEmail,
}) => {
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [attemptsRemaining, setAttemptsRemaining] = useState(3);
  const [isExpired, setIsExpired] = useState(false);

  // 10-minute code expiry countdown (600 seconds)
  const [expirySeconds, setExpirySeconds] = useState(600);
  // 45-second resend cooldown timer
  const [resendCooldown, setResendCooldown] = useState(45);
  const [resendSuccess, setResendSuccess] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Mask email utility (e.g. sarah.jenkins@example.com -> s***s@example.com)
  const maskEmail = (rawEmail: string) => {
    if (!rawEmail || !rawEmail.includes('@')) return rawEmail;
    const [user, domain] = rawEmail.split('@');
    if (user.length <= 2) {
      return `${user[0]}***@${domain}`;
    }
    return `${user[0]}***${user[user.length - 1]}@${domain}`;
  };

  // Expiry countdown timer
  useEffect(() => {
    if (expirySeconds <= 0) {
      setIsExpired(true);
      setErrorMessage('Verification code has expired. Please request a new code.');
      return;
    }

    const timer = setInterval(() => {
      setExpirySeconds((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [expirySeconds]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;

    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Format mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Focus first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleInputChange = (index: number, value: string) => {
    if (isExpired || isSuccess || isVerifying) return;
    setErrorMessage(null);
    setResendSuccess(false);

    // Clean numeric input
    const cleanChar = value.replace(/\D/g, '').slice(-1);

    const newDigits = [...digits];
    newDigits[index] = cleanChar;
    setDigits(newDigits);

    // If character entered, advance focus to next box
    if (cleanChar && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // If all 6 filled, auto-submit
    if (newDigits.every((d) => d !== '')) {
      verifyCode(newDigits.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        // Move to previous box if current is already empty
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    if (isExpired || isSuccess || isVerifying) return;

    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pastedData) return;

    const newDigits = [...digits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = pastedData[i] || '';
    }
    setDigits(newDigits);

    // Focus appropriate input
    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();

    // Auto verify if full 6 digits
    if (pastedData.length === 6) {
      verifyCode(pastedData);
    }
  };

  const verifyCode = (code: string) => {
    if (isExpired) {
      setErrorMessage('Verification code has expired. Please request a new code.');
      return;
    }

    setIsVerifying(true);
    setErrorMessage(null);

    // Simulate backend verification
    setTimeout(() => {
      setIsVerifying(false);

      // "000000" can simulate an invalid code, while standard codes succeed
      if (code === '000000') {
        const nextAttempts = attemptsRemaining - 1;
        setAttemptsRemaining(nextAttempts);
        if (nextAttempts <= 0) {
          setIsExpired(true);
          setErrorMessage('Maximum verification attempts exceeded. Please request a new code.');
        } else {
          setErrorMessage(`Incorrect code. ${nextAttempts} attempt${nextAttempts > 1 ? 's' : ''} remaining.`);
        }
        setDigits(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
        return;
      }

      // Successful verification
      setIsSuccess(true);
      setTimeout(() => {
        onVerificationSuccess();
      }, 1400);
    }, 700);
  };

  const handleResend = () => {
    if (resendCooldown > 0) return;

    setResendCooldown(45);
    setExpirySeconds(600);
    setIsExpired(false);
    setAttemptsRemaining(3);
    setErrorMessage(null);
    setResendSuccess(true);
    setDigits(['', '', '', '', '', '']);
    inputRefs.current[0]?.focus();
  };

  return (
    <AuthLayout subtitle="Account Verification" stepContext="Step 2 of 2">
      <div className="space-y-6">
        {/* Step Progress & Header */}
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-teal-50 text-teal-700 border border-teal-100 text-[11px] font-semibold mb-2">
            <Shield className="w-3.5 h-3.5 text-teal-600" />
            <span>Step 2 of 2: Email Verification</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Verify Your Email</h2>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            We sent a 6-digit security code to{' '}
            <strong className="text-slate-800 font-semibold">{maskEmail(email)}</strong>. Enter the
            code below to complete your registration.
          </p>
          <div className="mt-1.5">
            <button
              type="button"
              onClick={onChangeEmail}
              className="text-xs font-semibold text-teal-600 hover:text-teal-700 hover:underline inline-flex items-center gap-1"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>Change email address</span>
            </button>
          </div>
        </div>

        {/* Error Banner */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <div className="leading-tight">{errorMessage}</div>
          </div>
        )}

        {/* Resend Success Banner */}
        {resendSuccess && (
          <div className="p-3.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 text-xs flex items-start gap-2.5 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-teal-600" />
            <div className="leading-tight">
              A fresh 6-digit code has been dispatched to {maskEmail(email)}.
            </div>
          </div>
        )}

        {/* Success Transition State */}
        {isSuccess ? (
          <div className="p-8 rounded-2xl bg-teal-50/60 border border-teal-200/80 text-center space-y-3 animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-teal-600 text-white flex items-center justify-center mx-auto shadow-md shadow-teal-700/20">
              <CheckCircle2 className="w-7 h-7 animate-in fade-in" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Email Verified ✓</h3>
            <p className="text-xs text-slate-600 max-w-xs mx-auto">
              Your patient credentials have been securely activated. Redirecting you to sign in...
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* 6 OTP Input Boxes */}
            <div className="flex justify-between gap-2 sm:gap-3" onPaste={handlePaste}>
              {digits.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={digit}
                  disabled={isExpired || isVerifying}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className={`w-12 h-14 sm:w-14 sm:h-16 text-center text-xl font-bold rounded-xl border bg-white text-slate-900 transition-all focus:outline-none focus:ring-2 ${
                    isExpired
                      ? 'border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed'
                      : digit
                      ? 'border-teal-600 ring-2 ring-teal-500/20 bg-teal-50/10'
                      : 'border-slate-300 focus:border-teal-600 focus:ring-teal-500/20'
                  }`}
                />
              ))}
            </div>

            {/* Countdown and Timer Details */}
            <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
              <div className="flex items-center gap-1.5 text-slate-500">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  {isExpired ? (
                    <strong className="text-rose-600">Code expired</strong>
                  ) : (
                    <>
                      Code expires in <strong className="text-slate-700">{formatTime(expirySeconds)}</strong>
                    </>
                  )}
                </span>
              </div>

              {/* Resend Code Button with Cooldown */}
              <div>
                {resendCooldown > 0 ? (
                  <span className="text-slate-400 cursor-not-allowed">
                    Resend code in <span className="font-mono font-medium">{resendCooldown}s</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResend}
                    className="font-semibold text-teal-600 hover:text-teal-700 hover:underline flex items-center gap-1"
                  >
                    <RotateCw className="w-3 h-3" />
                    <span>Resend Code</span>
                  </button>
                )}
              </div>
            </div>

            {/* Manual Verification / Status CTA */}
            <button
              type="button"
              disabled={digits.some((d) => d === '') || isVerifying || isExpired}
              onClick={() => verifyCode(digits.join(''))}
              className="w-full py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              {isVerifying ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verifying Code...</span>
                </div>
              ) : (
                <span>Verify & Activate Account</span>
              )}
            </button>

            {/* Subtle demo hint */}
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 text-[11px] text-slate-500 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-teal-600" />
                <span>Demo testing code: <strong className="font-mono text-slate-700">123456</strong> (or enter 000000 for invalid test)</span>
              </span>
            </div>
          </div>
        )}
      </div>
    </AuthLayout>
  );
};
