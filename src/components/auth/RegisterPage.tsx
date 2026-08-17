import React, { useState, useMemo } from 'react';
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Calendar,
  Droplet,
  MapPin,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Shield,
} from 'lucide-react';
import { AuthLayout } from './AuthLayout';

export interface RegistrationFormData {
  fullName: string;
  email: string;
  phone: string;
  dob: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';
  bloodGroup: string;
  password: string;
  confirmPassword: string;
  address?: string;
}

interface RegisterPageProps {
  onProceedToOtp: (data: RegistrationFormData) => void;
  onNavigateToLogin: () => void;
  initialData?: Partial<RegistrationFormData>;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({
  onProceedToOtp,
  onNavigateToLogin,
  initialData,
}) => {
  const [formData, setFormData] = useState<RegistrationFormData>({
    fullName: initialData?.fullName || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    dob: initialData?.dob || '',
    gender: initialData?.gender || 'MALE',
    bloodGroup: initialData?.bloodGroup || 'O+',
    password: initialData?.password || '',
    confirmPassword: initialData?.confirmPassword || '',
    address: initialData?.address || '',
  });

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const markTouched = (field: keyof RegistrationFormData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  // Password strength calculation
  const passwordStrength = useMemo(() => {
    const pwd = formData.password;
    if (!pwd) return { score: 0, label: 'None', color: 'bg-slate-200', text: 'text-slate-400' };

    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score += 1;
    if (/\d/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd) || pwd.length >= 12) score += 1;

    if (score <= 1) {
      return { score: 1, label: 'Weak', color: 'bg-rose-500', text: 'text-rose-600', percent: '33%' };
    }
    if (score === 2 || score === 3) {
      return { score: 2, label: 'Medium', color: 'bg-amber-500', text: 'text-amber-600', percent: '66%' };
    }
    return { score: 3, label: 'Strong', color: 'bg-teal-500', text: 'text-teal-600', percent: '100%' };
  }, [formData.password]);

  // Inline Validation checks
  const errors = useMemo(() => {
    const errs: Record<string, string> = {};

    // Full Name
    if (!formData.fullName.trim()) {
      errs.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 3) {
      errs.fullName = 'Name must be at least 3 characters';
    }

    // Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      errs.email = 'Email address is required';
    } else if (!emailRegex.test(formData.email.trim())) {
      errs.email = 'Invalid email address format (e.g. name@example.com)';
    }

    // Phone
    const cleanPhone = formData.phone.replace(/\D/g, '');
    if (!formData.phone.trim()) {
      errs.phone = 'Phone number is required';
    } else if (cleanPhone.length < 10) {
      errs.phone = 'Please enter a valid 10-digit phone number';
    }

    // Date of birth
    if (!formData.dob) {
      errs.dob = 'Date of birth is required';
    } else {
      const selected = new Date(formData.dob);
      const today = new Date();
      if (selected > today) {
        errs.dob = 'Date of birth cannot be in the future';
      }
    }

    // Password
    if (!formData.password) {
      errs.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errs.password = 'Password must be at least 8 characters';
    }

    // Confirm Password
    if (!formData.confirmPassword) {
      errs.confirmPassword = 'Confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }

    return errs;
  }, [formData]);

  const isValid = Object.keys(errors).length === 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mark all as touched
    setTouched({
      fullName: true,
      email: true,
      phone: true,
      dob: true,
      gender: true,
      bloodGroup: true,
      password: true,
      confirmPassword: true,
    });

    if (!isValid) return;

    setIsSubmitting(true);
    // Simulate short network delay before transitioning to OTP verification
    setTimeout(() => {
      setIsSubmitting(false);
      onProceedToOtp(formData);
    }, 600);
  };

  return (
    <AuthLayout subtitle="Patient Registration Portal" stepContext="Step 1 of 2">
      <div className="space-y-6">
        {/* Progress & Header */}
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-teal-50 text-teal-700 border border-teal-100 text-[11px] font-semibold mb-2">
            <Shield className="w-3.5 h-3.5 text-teal-600" />
            <span>Step 1 of 2: Patient Account Setup</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Create Patient Account</h2>
          <p className="text-xs text-slate-500 mt-1">
            Register to book specialist appointments, access electronic prescriptions, and manage medical records.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Full Legal Name *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="e.g. Eleanor Vance"
                value={formData.fullName}
                onBlur={() => markTouched('fullName')}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className={`w-full bg-white border rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all ${
                  touched.fullName && errors.fullName
                    ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/20'
                    : 'border-slate-200 focus:border-teal-600 focus:ring-teal-500/20'
                }`}
              />
            </div>
            {touched.fullName && errors.fullName && (
              <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{errors.fullName}</span>
              </p>
            )}
          </div>

          {/* Email & Phone Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onBlur={() => markTouched('email')}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full bg-white border rounded-xl pl-10 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all ${
                    touched.email && errors.email
                      ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/20'
                      : 'border-slate-200 focus:border-teal-600 focus:ring-teal-500/20'
                  }`}
                />
              </div>
              {touched.email && errors.email && (
                <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{errors.email}</span>
                </p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phone Number *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  placeholder="(555) 000-0000"
                  value={formData.phone}
                  onBlur={() => markTouched('phone')}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className={`w-full bg-white border rounded-xl pl-10 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all ${
                    touched.phone && errors.phone
                      ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/20'
                      : 'border-slate-200 focus:border-teal-600 focus:ring-teal-500/20'
                  }`}
                />
              </div>
              {touched.phone && errors.phone && (
                <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{errors.phone}</span>
                </p>
              )}
            </div>
          </div>

          {/* DOB, Gender & Blood Group Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Date of Birth */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Date of Birth *
              </label>
              <div className="relative">
                <input
                  type="date"
                  max={new Date().toISOString().split('T')[0]}
                  value={formData.dob}
                  onBlur={() => markTouched('dob')}
                  onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                  className={`w-full bg-white border rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 transition-all ${
                    touched.dob && errors.dob
                      ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/20'
                      : 'border-slate-200 focus:border-teal-600 focus:ring-teal-500/20'
                  }`}
                />
              </div>
              {touched.dob && errors.dob && (
                <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{errors.dob}</span>
                </p>
              )}
            </div>

            {/* Gender */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Gender *
              </label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
              >
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
                <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
              </select>
            </div>

            {/* Blood Group */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Blood Group
              </label>
              <select
                value={formData.bloodGroup}
                onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
              >
                {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'Unknown'].map((bg) => (
                  <option key={bg} value={bg}>
                    {bg}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Password & Strength Indicator */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">
                Password *
              </label>
              {formData.password && (
                <span className={`text-[11px] font-bold ${passwordStrength.text}`}>
                  Strength: {passwordStrength.label}
                </span>
              )}
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a strong password (min 8 characters)"
                value={formData.password}
                onBlur={() => markTouched('password')}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className={`w-full bg-white border rounded-xl pl-10 pr-10 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all ${
                  touched.password && errors.password
                    ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/20'
                    : 'border-slate-200 focus:border-teal-600 focus:ring-teal-500/20'
                }`}
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

            {/* Password strength meter bar */}
            {formData.password && (
              <div className="mt-2 space-y-1">
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                    style={{ width: passwordStrength.percent || '0%' }}
                  />
                </div>
                <div className="flex items-center gap-3 text-[10px] text-slate-500">
                  <span className={formData.password.length >= 8 ? 'text-teal-600 font-semibold' : ''}>
                    &bull; 8+ chars
                  </span>
                  <span className={/[A-Z]/.test(formData.password) && /[a-z]/.test(formData.password) ? 'text-teal-600 font-semibold' : ''}>
                    &bull; Uppercase & lowercase
                  </span>
                  <span className={/\d/.test(formData.password) ? 'text-teal-600 font-semibold' : ''}>
                    &bull; Number
                  </span>
                </div>
              </div>
            )}

            {touched.password && errors.password && (
              <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{errors.password}</span>
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Confirm Password *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Re-enter your password"
                value={formData.confirmPassword}
                onBlur={() => markTouched('confirmPassword')}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className={`w-full bg-white border rounded-xl pl-10 pr-10 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all ${
                  touched.confirmPassword && errors.confirmPassword
                    ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/20'
                    : 'border-slate-200 focus:border-teal-600 focus:ring-teal-500/20'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                title={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {touched.confirmPassword && errors.confirmPassword && (
              <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{errors.confirmPassword}</span>
              </p>
            )}
          </div>

          {/* Address (Optional) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Residential Address <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <textarea
                rows={2}
                placeholder="Street address, City, State, ZIP code"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all resize-none"
              />
            </div>
          </div>

          {/* Submit CTA Button */}
          <button
            type="submit"
            disabled={!isValid || isSubmitting}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Creating Account...</span>
              </div>
            ) : (
              <>
                <span>Create Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Bottom Link Back to Login */}
        <div className="pt-2 text-center text-xs text-slate-500 border-t border-slate-100">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onNavigateToLogin}
            className="font-semibold text-teal-600 hover:text-teal-700 hover:underline"
          >
            Sign In
          </button>
        </div>
      </div>
    </AuthLayout>
  );
};
