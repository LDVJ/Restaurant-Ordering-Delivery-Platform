import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { User, Mail } from 'lucide-react';
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
import Button from '../../components/ui/Button';
import PhoneInput from '../../components/common/PhoneInput';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '', email: '', role: ROLES.CUSTOMER,
    country_code: '+91', phone_number: '', password: '', confirmPassword: '',
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    if (formError) setFormError('');
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
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!validateForm()) return;
    setIsLoading(true);

    try {
      await authApi.register({
        name: formData.name, email: formData.email, password: formData.password,
        role: formData.role, country_code: formData.country_code, phone_number: formData.phone_number,
      });
      toast.success('Registration successful! Please sign in.');
      navigate('/login');
    } catch (err) {
      if (err.response?.status === 422 && err.response?.data?.errors?.length) {
        const backendFieldErrors = {};
        err.response.data.errors.forEach((eItem) => {
          if (eItem.field) backendFieldErrors[eItem.field] = eItem.message;
        });
        setFieldErrors(backendFieldErrors);
      }
      setFormError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Join CampusBite"
      subtitle="Fresh campus meals delivered in minutes. Create your account to get started."
      footer={
        <AuthSwitchLink
          text="Already have an account?"
          linkText="Sign in"
          to="/login"
        />
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {formError && <FormAlert message={formError} />}

        {/* Role Picker (Defaults to Customer with primary border and radio checked) */}
        <RolePicker
          value={formData.role}
          onChange={handleRoleSelect}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Full name"
            name="name"
            placeholder="Asha Verma"
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

        <PhoneInput
          countryCode={formData.country_code}
          phoneNumber={formData.phone_number}
          onChange={handleChange}
          error={fieldErrors.phone_number}
          required
        />

        <div className="space-y-2">
          <PasswordInput
            label="Password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            error={fieldErrors.password}
            placeholder="Create a strong password"
            autoComplete="new-password"
            required
          />
          <PasswordChecklist password={formData.password} />
        </div>

        <PasswordInput
          label="Confirm password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          error={fieldErrors.confirmPassword}
          placeholder="Repeat your password"
          autoComplete="new-password"
          required
        />

        <div className="pt-2">
          <Button type="submit" variant="primary" fullWidth isLoading={isLoading} disabled={isLoading}>
            Create account
          </Button>
        </div>
      </form>
    </AuthLayout>
  );
}
