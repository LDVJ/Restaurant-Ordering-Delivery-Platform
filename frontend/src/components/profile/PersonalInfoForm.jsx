import { useState } from 'react';
import toast from 'react-hot-toast';
import { User, Mail } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import * as authApi from '../../api/authApi';
import { getErrorMessage } from '../../utils/errors';
import { FIELD_LIMITS } from '../../utils/constants';
import Input from '../ui/Input';
import Button from '../ui/Button';
import PhoneInput from '../common/PhoneInput';
import FormAlert from '../auth/FormAlert';

export default function PersonalInfoForm() {
  const { user, updateUser } = useAuth();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    country_code: user?.country_code || '+91',
    phone_number: user?.phone_number || '',
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasChanged =
    formData.name.trim() !== (user?.name || '').trim() ||
    formData.country_code !== (user?.country_code || '+91') ||
    formData.phone_number.trim() !== (user?.phone_number || '').trim();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    if (formError) setFormError('');
  };

  const validate = () => {
    const errors = {};
    if (!formData.name.trim() || formData.name.trim().length < FIELD_LIMITS.NAME_MIN) {
      errors.name = `Full name must be at least ${FIELD_LIMITS.NAME_MIN} characters`;
    } else if (formData.name.trim().length > FIELD_LIMITS.NAME_MAX) {
      errors.name = `Name must be at most ${FIELD_LIMITS.NAME_MAX} characters`;
    }

    const digits = formData.phone_number.replace(/\D/g, '');
    if (!digits) {
      errors.phone_number = 'Phone number is required';
    } else if (digits.length < FIELD_LIMITS.PHONE_MIN || digits.length > FIELD_LIMITS.PHONE_MAX) {
      errors.phone_number = `Phone must be between ${FIELD_LIMITS.PHONE_MIN} and ${FIELD_LIMITS.PHONE_MAX} digits`;
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!hasChanged || !validate() || isSubmitting) return;

    setIsSubmitting(true);
    setFormError('');

    try {
      const updatedUser = await authApi.updateProfile({
        name: formData.name.trim(),
        country_code: formData.country_code,
        phone_number: formData.phone_number.trim(),
      });

      updateUser(updatedUser);
      toast.success('Profile updated successfully');
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
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-border p-5 sm:p-6 shadow-2xs text-left space-y-4">
      <div>
        <h2 className="text-base font-bold text-text-main">Personal Information</h2>
        <p className="text-xs text-muted-text mt-0.5">Update your personal contact details.</p>
      </div>

      {formError && <FormAlert message={formError} />}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Input
          label="Full name"
          name="name"
          placeholder="e.g. Asha Verma"
          icon={User}
          value={formData.name}
          onChange={handleChange}
          error={fieldErrors.name}
          maxLength={FIELD_LIMITS.NAME_MAX}
          autoComplete="name"
          required
        />

        {/* Email is read-only */}
        <div>
          <Input
            label="Email address"
            type="email"
            name="email"
            icon={Mail}
            value={user?.email || ''}
            disabled
            className="bg-gray-50 text-muted-text cursor-not-allowed"
          />
          <p className="text-[11px] text-muted-text mt-1">
            Email address is tied to your account login and cannot be changed.
          </p>
        </div>

        <PhoneInput
          countryCode={formData.country_code}
          phoneNumber={formData.phone_number}
          onChange={handleChange}
          error={fieldErrors.phone_number}
          required
        />

        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isSubmitting}
            disabled={!hasChanged || isSubmitting}
          >
            Save changes
          </Button>
        </div>
      </form>
    </div>
  );
}
