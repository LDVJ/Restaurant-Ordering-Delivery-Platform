import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Zap,
  UtensilsCrossed,
  ShieldCheck,
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import { getErrorMessage } from '../../utils/errors';
import { ROLE_HOME_PATHS } from '../../utils/constants';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

/**
 * LoginPage Component (Responsive Row-wise Layout)
 * Sourced from Section 5, 7, and 12 of Frontend Guide.
 */
export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Controlled input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (formError) {
      setFormError('');
    }
  };

  // Client-side validation before submission
  const validateForm = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email.trim())) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setFormError('');

    try {
      const user = await login(formData.email, formData.password);
      toast.success(`Welcome back, ${user.name}!`);

      const destination =
        location.state?.from?.pathname || ROLE_HOME_PATHS[user.role] || '/';
      navigate(destination, { replace: true });
    } catch (error) {
      const errorMsg = getErrorMessage(error);
      setFormError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-page flex items-center justify-center p-3 sm:p-5 lg:p-6">
      {/* Row-wise Split Card Container */}
      <div className="w-full max-w-4xl bg-white rounded-2xl sm:rounded-3xl border border-border shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Left Side: Brand Story & Highlights (Hidden on mobile, 2-cols on iPad/tablet, stacked sidebar on PC) */}
        <div className="hidden md:flex lg:col-span-5 bg-gradient-to-br from-brand-tint/70 via-orange-50/40 to-white p-6 sm:p-8 lg:p-9 flex-col justify-between border-b lg:border-b-0 lg:border-r border-border text-left">
          <div>
            {/* Logo */}
            <Link
              to="/"
              className="inline-flex items-center gap-2.5 text-2xl font-extrabold text-brand tracking-tight mb-5 lg:mb-7"
            >
              <span className="w-8 h-8 rounded-xl bg-brand text-white flex items-center justify-center text-base font-black shadow-sm">
                CB
              </span>
              <span>CampusBite</span>
            </Link>

            <h2 className="text-xl sm:text-2xl font-bold text-text-main tracking-tight leading-snug">
              Craving something delicious on campus?
            </h2>
            <p className="text-xs sm:text-sm text-muted-text mt-1.5 leading-relaxed">
              Order fresh meals and snacks from top campus canteens delivered right to your study spot.
            </p>

            {/* Feature highlights: 2 columns on iPad (md), 1 column on desktop (lg) */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-3.5">
              <div className="flex items-start gap-2.5 p-2 rounded-xl bg-white/70 border border-border/70 shadow-2xs">
                <div className="p-1.5 rounded-lg bg-white border border-border/80 text-brand shrink-0">
                  <Zap className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <span className="font-semibold text-text-main block">
                    Fast campus delivery
                  </span>
                  <span className="text-muted-text text-[11px]">
                    Direct to your hostel or lab.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2 rounded-xl bg-white/70 border border-border/70 shadow-2xs">
                <div className="p-1.5 rounded-lg bg-white border border-border/80 text-brand shrink-0">
                  <UtensilsCrossed className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <span className="font-semibold text-text-main block">
                    Top campus kitchens
                  </span>
                  <span className="text-muted-text text-[11px]">
                    Daily canteen specials & snacks.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2 rounded-xl bg-white/70 border border-border/70 shadow-2xs md:col-span-2 lg:col-span-1">
                <div className="p-1.5 rounded-lg bg-white border border-border/80 text-brand shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <span className="font-semibold text-text-main block">
                    Real-time order tracking
                  </span>
                  <span className="text-muted-text text-[11px]">
                    Live status updates from prep to delivery.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Social Proof Pill */}
          <div className="mt-6 pt-4 border-t border-border/60">
            <span className="inline-flex items-center gap-2 text-xs font-medium text-muted-text">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              Serving students, kitchen owners & delivery riders
            </span>
          </div>
        </div>

        {/* Right Side: Form (Directly visible on mobile with compact logo) */}
        <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-center text-left">
          <div className="max-w-md mx-auto w-full">
            {/* Mobile Only: Compact Logo header */}
            <div className="flex md:hidden items-center justify-center gap-2 mb-4">
              <span className="w-7 h-7 rounded-lg bg-brand text-white flex items-center justify-center text-xs font-black shadow-sm">
                CB
              </span>
              <span className="text-lg font-bold text-brand tracking-tight">CampusBite</span>
            </div>

            <div className="mb-5">
              <h1 className="text-2xl font-bold text-text-main tracking-tight">
                Welcome back
              </h1>
              <p className="text-xs sm:text-sm text-muted-text mt-1">
                Enter your campus credentials to sign in
              </p>
            </div>

            {formError && (
              <div
                role="alert"
                className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs sm:text-sm text-danger"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {/* Email Field */}
              <Input
                label="Email address"
                type="email"
                name="email"
                placeholder="you@campus.edu"
                icon={Mail}
                value={formData.email}
                onChange={handleChange}
                error={fieldErrors.email}
                autoComplete="email"
                required
              />

              {/* Password Field with Show/Hide toggle */}
              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="••••••••"
                  icon={Lock}
                  value={formData.password}
                  onChange={handleChange}
                  error={fieldErrors.password}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-[34px] text-muted-text hover:text-text-main transition-colors p-1 focus:outline-none cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full mt-2 py-2.5"
                isLoading={isLoading}
              >
                Sign in
              </Button>
            </form>

            {/* Switch to Register */}
            <div className="mt-6 pt-4 border-t border-border text-center">
              <p className="text-xs sm:text-sm text-muted-text">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="font-semibold text-brand hover:text-brand-dark transition-colors"
                >
                  Create an account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
