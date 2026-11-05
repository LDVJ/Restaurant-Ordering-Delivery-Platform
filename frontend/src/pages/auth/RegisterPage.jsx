import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  User,
  Mail,
  Lock,
  Phone,
  Eye,
  EyeOff,
  ShoppingBag,
  Store,
  Bike,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';

import * as authApi from '../../api/authApi';
import { getErrorMessage } from '../../utils/errors';
import { ROLES, FIELD_LIMITS } from '../../utils/constants';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';

/**
 * RegisterPage Component (Responsive Row-wise Layout)
 * Sourced from Section 5, 7, 11, and 12 of Frontend Guide.
 */

const ROLE_OPTIONS = [
  {
    role: ROLES.CUSTOMER,
    title: 'Customer',
    description: 'Order food to dorms',
    icon: ShoppingBag,
  },
  {
    role: ROLES.RESTAURANT_OWNER,
    title: 'Restaurant Owner',
    description: 'Manage menu & orders',
    icon: Store,
  },
  {
    role: ROLES.DELIVERY_PARTNER,
    title: 'Delivery Partner',
    description: 'Deliver across campus',
    icon: Bike,
  },
];

const COUNTRY_CODES = [
  { value: '+91', label: '+91 (IN)' },
  { value: '+1', label: '+1 (US)' },
  { value: '+44', label: '+44 (UK)' },
  { value: '+61', label: '+61 (AU)' },
  { value: '+971', label: '+971 (AE)' },
];

export default function RegisterPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: ROLES.CUSTOMER,
    country_code: '+91',
    phone_number: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Password criteria checks
  const passwordCriteria = {
    length: formData.password.length >= 8 && formData.password.length <= 72,
    hasUpper: /[A-Z]/.test(formData.password),
    hasLower: /[a-z]/.test(formData.password),
    hasDigit: /\d/.test(formData.password),
    hasSpecial: /[^A-Za-z0-9]/.test(formData.password),
  };

  const isPasswordValid = Object.values(passwordCriteria).every(Boolean);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Restrict phone to digits only
    if (name === 'phone_number') {
      const digitsOnly = value.replace(/\D/g, '');
      setFormData((prev) => ({ ...prev, phone_number: digitsOnly }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (formError) {
      setFormError('');
    }
  };

  const handleRoleSelect = (selectedRole) => {
    setFormData((prev) => ({ ...prev, role: selectedRole }));
  };

  const validateForm = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.name.trim() || formData.name.trim().length < 2) {
      errors.name = 'Full name must be at least 2 characters';
    } else if (formData.name.trim().length > FIELD_LIMITS.NAME_MAX) {
      errors.name = `Name must be at most ${FIELD_LIMITS.NAME_MAX} characters`;
    }

    if (!formData.email.trim()) {
      errors.email = 'Email address is required';
    } else if (!emailRegex.test(formData.email.trim())) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.phone_number) {
      errors.phone_number = 'Phone number is required';
    } else if (formData.phone_number.length < 6 || formData.phone_number.length > 15) {
      errors.phone_number = 'Phone number must be between 6 and 15 digits';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (!isPasswordValid) {
      errors.password = 'Please meet all password requirements below';
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
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
      await authApi.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        country_code: formData.country_code,
        phone_number: formData.phone_number,
      });

      toast.success('Account created successfully! Please log in.');
      navigate('/login');
    } catch (error) {
      const msg = getErrorMessage(error);
      setFormError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-page flex items-center justify-center p-2.5 sm:p-4 lg:p-6">
      {/* Row-wise Split Card Container */}
      <div className="w-full max-w-5xl bg-white rounded-2xl sm:rounded-3xl border border-border shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Left Side: Brand Story & Roles (Hidden on mobile, 2-cols on iPad, stacked sidebar on PC) */}
        <div className="hidden md:flex lg:col-span-5 bg-gradient-to-br from-brand-tint/70 via-orange-50/40 to-white p-5 sm:p-7 lg:py-6 lg:px-8 flex-col justify-between border-b lg:border-b-0 lg:border-r border-border text-left">
          <div>
            {/* Logo */}
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-xl sm:text-2xl font-extrabold text-brand tracking-tight mb-4 lg:mb-6"
            >
              <span className="w-8 h-8 rounded-xl bg-brand text-white flex items-center justify-center text-base font-black shadow-sm">
                CB
              </span>
              <span>CampusBite</span>
            </Link>

            <h2 className="text-xl sm:text-2xl font-bold text-text-main tracking-tight leading-snug">
              Join the CampusBite network
            </h2>
            <p className="text-xs sm:text-sm text-muted-text mt-1.5 leading-relaxed">
              One platform connecting students, campus kitchens, and delivery partners across the college grounds.
            </p>

            {/* Role highlights: 2 columns on iPad (md), 1 column on desktop (lg) */}
            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-2.5">
              <div className="flex items-start gap-2.5 p-2 rounded-xl bg-white/70 border border-border/70 shadow-2xs">
                <div className="p-1.5 rounded-lg bg-white border border-border/80 text-brand shrink-0">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <span className="font-semibold text-text-main block">
                    Campus Customers
                  </span>
                  <span className="text-muted-text text-[11px]">
                    Doorstep food delivery to your hostel or desk.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2 rounded-xl bg-white/70 border border-border/70 shadow-2xs">
                <div className="p-1.5 rounded-lg bg-white border border-border/80 text-brand shrink-0">
                  <Store className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <span className="font-semibold text-text-main block">
                    Kitchen Owners
                  </span>
                  <span className="text-muted-text text-[11px]">
                    Manage live orders, prep queue & menus.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2 rounded-xl bg-white/70 border border-border/70 shadow-2xs md:col-span-2 lg:col-span-1">
                <div className="p-1.5 rounded-lg bg-white border border-border/80 text-brand shrink-0">
                  <Bike className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <span className="font-semibold text-text-main block">
                    Delivery Partners
                  </span>
                  <span className="text-muted-text text-[11px]">
                    Earn flexibly delivering meals between classes.
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3.5 border-t border-border/60">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-muted-text">
              <ShieldCheck className="w-3.5 h-3.5 text-brand shrink-0" />
              100% verified campus accounts & role-based routing
            </span>
          </div>
        </div>

        {/* Right Side: Form (Directly visible on mobile with compact logo, compact on PC to prevent scroll) */}
        <div className="lg:col-span-7 p-4 sm:p-6 lg:py-5 lg:px-8 text-left flex flex-col justify-center">
          {/* Mobile Only: Compact Logo header */}
          <div className="flex md:hidden items-center justify-center gap-2 mb-3">
            <span className="w-7 h-7 rounded-lg bg-brand text-white flex items-center justify-center text-xs font-black shadow-sm">
              CB
            </span>
            <span className="text-lg font-bold text-brand tracking-tight">CampusBite</span>
          </div>

          <div className="mb-3">
            <h1 className="text-xl sm:text-2xl font-bold text-text-main tracking-tight">
              Create your account
            </h1>
            <p className="text-xs text-muted-text mt-0.5">
              Choose your role and enter your details to sign up
            </p>
          </div>

          {formError && (
            <div
              role="alert"
              className="mb-3 p-2.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2 text-xs text-danger"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3" noValidate>
            {/* 1. Role Picker: Three Compact Selectable Cards */}
            <div className="space-y-1 text-left">
              <label className="text-xs font-semibold text-text-main block">
                Choose your role <span className="text-danger">*</span>
              </label>

              <div className="grid grid-cols-3 gap-2">
                {ROLE_OPTIONS.map((opt) => {
                  const isSelected = formData.role === opt.role;
                  const Icon = opt.icon;

                  return (
                    <button
                      key={opt.role}
                      type="button"
                      onClick={() => handleRoleSelect(opt.role)}
                      className={`relative flex flex-col items-start p-2 sm:p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'border-brand bg-brand-tint/40 ring-1.5 ring-brand shadow-2xs'
                          : 'border-border bg-white hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <div
                          className={`p-1 rounded-md ${
                            isSelected
                              ? 'bg-brand text-white'
                              : 'bg-gray-100 text-muted-text'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <span
                          className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                            isSelected
                              ? 'border-brand bg-brand text-white'
                              : 'border-gray-300'
                          }`}
                        >
                          {isSelected && (
                            <span className="w-1.5 h-1.5 rounded-full bg-white" />
                          )}
                        </span>
                      </div>

                      <span className="font-semibold text-xs text-text-main leading-tight truncate w-full">
                        {opt.title}
                      </span>
                      <span className="text-[10px] text-muted-text truncate w-full mt-0.5">
                        {opt.description}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Full Name & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <Input
                label="Full name"
                name="name"
                placeholder="Asha Sharma"
                icon={User}
                value={formData.name}
                onChange={handleChange}
                error={fieldErrors.name}
                maxLength={FIELD_LIMITS.NAME_MAX}
                autoComplete="name"
                required
              />

              <Input
                label="Email address"
                type="email"
                name="email"
                placeholder="asha@example.com"
                icon={Mail}
                value={formData.email}
                onChange={handleChange}
                error={fieldErrors.email}
                maxLength={FIELD_LIMITS.EMAIL_MAX}
                autoComplete="email"
                required
              />
            </div>

            {/* 3. Phone: Country Code + Digits Only */}
            <div className="text-left space-y-1">
              <label className="text-xs font-semibold text-text-main block">
                Phone number <span className="text-danger">*</span>
              </label>

              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                <div className="col-span-1">
                  <Select
                    name="country_code"
                    value={formData.country_code}
                    onChange={handleChange}
                    options={COUNTRY_CODES}
                    placeholder=""
                  />
                </div>
                <div className="col-span-2 sm:col-span-3">
                  <Input
                    name="phone_number"
                    type="tel"
                    placeholder="9876543210 (digits only)"
                    icon={Phone}
                    value={formData.phone_number}
                    onChange={handleChange}
                    error={fieldErrors.phone_number}
                    maxLength={15}
                    autoComplete="tel-national"
                    required
                  />
                </div>
              </div>
            </div>

            {/* 4. Password & Confirm Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
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
                  maxLength={FIELD_LIMITS.PASSWORD_MAX}
                  autoComplete="new-password"
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

              <Input
                label="Confirm password"
                type={showPassword ? 'text' : 'password'}
                name="confirmPassword"
                placeholder="••••••••"
                icon={Lock}
                value={formData.confirmPassword}
                onChange={handleChange}
                error={fieldErrors.confirmPassword}
                maxLength={FIELD_LIMITS.PASSWORD_MAX}
                autoComplete="new-password"
                required
              />
            </div>

            {/* Password Requirements Checklist (Ultra-compact 2-col chip list) */}
            <div className="p-2 bg-page rounded-lg text-left border border-border/60">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 text-[10.5px]">
                <div className="flex items-center gap-1">
                  <CheckCircle2
                    className={`w-3 h-3 shrink-0 ${
                      passwordCriteria.length ? 'text-success' : 'text-gray-300'
                    }`}
                  />
                  <span className={passwordCriteria.length ? 'text-text-main' : 'text-muted-text'}>
                    8-72 chars
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle2
                    className={`w-3 h-3 shrink-0 ${
                      passwordCriteria.hasUpper ? 'text-success' : 'text-gray-300'
                    }`}
                  />
                  <span className={passwordCriteria.hasUpper ? 'text-text-main' : 'text-muted-text'}>
                    1 uppercase
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle2
                    className={`w-3 h-3 shrink-0 ${
                      passwordCriteria.hasLower ? 'text-success' : 'text-gray-300'
                    }`}
                  />
                  <span className={passwordCriteria.hasLower ? 'text-text-main' : 'text-muted-text'}>
                    1 lowercase
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle2
                    className={`w-3 h-3 shrink-0 ${
                      passwordCriteria.hasDigit ? 'text-success' : 'text-gray-300'
                    }`}
                  />
                  <span className={passwordCriteria.hasDigit ? 'text-text-main' : 'text-muted-text'}>
                    1 number
                  </span>
                </div>
                <div className="flex items-center gap-1 col-span-2 sm:col-span-2">
                  <CheckCircle2
                    className={`w-3 h-3 shrink-0 ${
                      passwordCriteria.hasSpecial ? 'text-success' : 'text-gray-300'
                    }`}
                  />
                  <span className={passwordCriteria.hasSpecial ? 'text-text-main' : 'text-muted-text'}>
                    1 special char (!@#$)
                  </span>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full py-2.5"
              isLoading={isLoading}
            >
              Create account
            </Button>
          </form>

          {/* Switch to Login */}
          <div className="mt-3.5 pt-2.5 border-t border-border text-center">
            <p className="text-xs text-muted-text">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-semibold text-brand hover:text-brand-dark transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
