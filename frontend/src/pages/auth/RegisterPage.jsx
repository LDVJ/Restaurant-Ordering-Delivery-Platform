import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { User, Mail, Phone } from 'lucide-react';

import * as authApi from '../../api/authApi';
import { getErrorMessage } from '../../utils/errors';
import { ROLES, FIELD_LIMITS } from '../../utils/constants';

import AuthLayout from '../../components/auth/AuthLayout';
import RolePicker from '../../components/auth/RolePicker';
import PasswordInput from '../../components/auth/PasswordInput';
import PasswordChecklist from '../../components/auth/PasswordChecklist';
import { isPasswordValid } from '../../utils/validation';
import FormAlert from '../../components/auth/FormAlert';
import AuthSwitchLink from '../../components/auth/AuthSwitchLink';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';

/**
 * RegisterPage Component
 * Sourced from Section 5, 7, 11, 12, and 16 of Frontend Guide.
 */

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

  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

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
    } else if (!isPasswordValid(formData.password)) {
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
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Choose your role and enter your details to sign up"
      alert={<FormAlert message={formError} className="mb-3" />}
      footer={
        <AuthSwitchLink
          text="Already have an account?"
          linkText="Sign in"
          to="/login"
        />
      }
    >
      <form onSubmit={handleSubmit} className="space-y-3" noValidate>
        {/* 1. Role Picker */}
        <RolePicker value={formData.role} onChange={handleRoleSelect} />

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

        {/* 4. Password & Confirm Password (each has its own independent show/hide state) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <PasswordInput
            label="Password"
            name="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            error={fieldErrors.password}
            maxLength={FIELD_LIMITS.PASSWORD_MAX}
            autoComplete="new-password"
            required
          />

          <PasswordInput
            label="Confirm password"
            name="confirmPassword"
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={fieldErrors.confirmPassword}
            maxLength={FIELD_LIMITS.PASSWORD_MAX}
            autoComplete="new-password"
            required
          />
        </div>

        {/* 5. Password Requirements Checklist */}
        <PasswordChecklist password={formData.password} />

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
    </AuthLayout>
  );
}
