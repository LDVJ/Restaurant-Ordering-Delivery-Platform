import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Mail } from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import { getErrorMessage } from '../../utils/errors';
import { ROLES, ROLE_HOME_PATHS } from '../../utils/constants';

import AuthLayout from '../../components/auth/AuthLayout';
import PasswordInput from '../../components/auth/PasswordInput';
import FormAlert from '../../components/auth/FormAlert';
import AuthSwitchLink from '../../components/auth/AuthSwitchLink';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

/**
 * LoginPage Component
 * Sourced from Section 5, 7, 12, and 16 of Frontend Guide.
 */
export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Check and display session expiration toast on mount
  useEffect(() => {
    if (sessionStorage.getItem('campusbite_session_expired') === 'true') {
      sessionStorage.removeItem('campusbite_session_expired');
      toast.error('Your session expired. Please log in again.');
    }
  }, []);

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

      // Validate attempted destination matches the user's role
      const attempted = location.state?.from?.pathname;
      const isAllowedAttempt =
        attempted &&
        (user.role === ROLES.CUSTOMER
          ? attempted.startsWith('/restaurants') || attempted === '/cart'
          : user.role === ROLES.RESTAURANT_OWNER
          ? attempted.startsWith('/owner')
          : attempted.startsWith('/delivery'));

      const destination = isAllowedAttempt
        ? attempted
        : ROLE_HOME_PATHS[user.role] || '/';
      navigate(destination, { replace: true });
    } catch (error) {
      const errorMsg = getErrorMessage(error);
      // Login errors show inline with FormAlert only, not also as a toast
      setFormError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Enter your campus credentials to sign in"
      alert={<FormAlert message={formError} className="mb-4" />}
      footer={
        <AuthSwitchLink
          text="Don't have an account?"
          linkText="Create an account"
          to="/register"
        />
      }
    >
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

        {/* Password Field (self-contained show/hide state & trailing slot) */}
        <PasswordInput
          label="Password"
          name="password"
          placeholder="••••••••"
          value={formData.password}
          onChange={handleChange}
          error={fieldErrors.password}
          autoComplete="current-password"
          required
        />

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
    </AuthLayout>
  );
}
