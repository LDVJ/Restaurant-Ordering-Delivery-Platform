import { useState } from 'react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import PhoneInput from '../common/PhoneInput';
import FormAlert from '../auth/FormAlert';
import { FIELD_LIMITS } from '../../utils/constants';

/**
 * AddressForm Component
 * Used for creating and editing customer saved addresses.
 */
export default function AddressForm({
  initialAddress = null,
  hasExistingAddresses = false,
  onSubmit,
  onCancel,
  submitLabel = 'Save address',
  isSubmitting = false,
}) {
  const isEdit = Boolean(initialAddress?.id);

  const [formData, setFormData] = useState({
    house: initialAddress?.house || '',
    city: initialAddress?.city || '',
    state: initialAddress?.state || '',
    country: initialAddress?.country || 'India',
    country_code: initialAddress?.country_code || '+91',
    phone_number: initialAddress?.phone_number || '',
    is_default: Boolean(initialAddress?.is_default) || false,
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    setFormData((prev) => ({ ...prev, [name]: val }));
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    if (formError) setFormError('');
  };

  const validate = () => {
    const errors = {};
    if (!formData.house.trim()) {
      errors.house = 'Flat, house no. or building is required';
    } else if (formData.house.trim().length > FIELD_LIMITS.HOUSE_MAX) {
      errors.house = `House details must be at most ${FIELD_LIMITS.HOUSE_MAX} characters`;
    }

    if (!formData.city.trim()) {
      errors.city = 'City is required';
    } else if (formData.city.trim().length > FIELD_LIMITS.CITY_MAX) {
      errors.city = `City must be at most ${FIELD_LIMITS.CITY_MAX} characters`;
    }

    if (!formData.state.trim()) {
      errors.state = 'State is required';
    } else if (formData.state.trim().length > FIELD_LIMITS.STATE_MAX) {
      errors.state = `State must be at most ${FIELD_LIMITS.STATE_MAX} characters`;
    }

    if (!formData.country.trim()) {
      errors.country = 'Country is required';
    } else if (formData.country.trim().length > FIELD_LIMITS.COUNTRY_MAX) {
      errors.country = `Country must be at most ${FIELD_LIMITS.COUNTRY_MAX} characters`;
    }

    const digits = formData.phone_number.replace(/\D/g, '');
    if (!digits) {
      errors.phone_number = 'Contact phone number is required';
    } else if (digits.length < FIELD_LIMITS.PHONE_MIN || digits.length > FIELD_LIMITS.PHONE_MAX) {
      errors.phone_number = `Phone must be between ${FIELD_LIMITS.PHONE_MIN} and ${FIELD_LIMITS.PHONE_MAX} digits`;
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate() || isSubmitting) return;

    try {
      const payload = {
        house: formData.house.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        country: formData.country.trim(),
        country_code: formData.country_code,
        phone_number: formData.phone_number.trim(),
      };
      // In create mode with existing addresses, send is_default if checked
      if (!isEdit && hasExistingAddresses) {
        payload.is_default = formData.is_default;
      }
      await onSubmit(payload);
    } catch (err) {
      if (err.response?.status === 422 && err.response?.data?.errors?.length) {
        const backendFieldErrors = {};
        err.response.data.errors.forEach((eItem) => {
          if (eItem.field) backendFieldErrors[eItem.field] = eItem.message;
        });
        setFieldErrors(backendFieldErrors);
      }
      setFormError(err.response?.data?.detail || 'Failed to save address. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-left" noValidate>
      {formError && <FormAlert message={formError} />}

      <Input
        label="Flat, house no., building or campus hostel"
        name="house"
        placeholder="e.g. Room 302, Hostel B, North Campus"
        value={formData.house}
        onChange={handleChange}
        error={fieldErrors.house}
        maxLength={FIELD_LIMITS.HOUSE_MAX}
        required
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input
          label="City"
          name="city"
          placeholder="e.g. Ghaziabad"
          value={formData.city}
          onChange={handleChange}
          error={fieldErrors.city}
          maxLength={FIELD_LIMITS.CITY_MAX}
          required
        />
        <Input
          label="State"
          name="state"
          placeholder="e.g. Uttar Pradesh"
          value={formData.state}
          onChange={handleChange}
          error={fieldErrors.state}
          maxLength={FIELD_LIMITS.STATE_MAX}
          required
        />
      </div>

      <Input
        label="Country"
        name="country"
        placeholder="e.g. India"
        value={formData.country}
        onChange={handleChange}
        error={fieldErrors.country}
        maxLength={FIELD_LIMITS.COUNTRY_MAX}
        required
      />

      <PhoneInput
        label="Delivery contact phone"
        countryCode={formData.country_code}
        phoneNumber={formData.phone_number}
        onChange={handleChange}
        error={fieldErrors.phone_number}
        required
      />

      {/* Show checkbox ONLY when creating and user already has saved addresses */}
      {!isEdit && hasExistingAddresses && (
        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="is_default"
            name="is_default"
            checked={formData.is_default}
            onChange={handleChange}
            className="w-4 h-4 rounded-sm border-border text-brand focus:ring-brand focus:ring-offset-0 cursor-pointer"
          />
          <label htmlFor="is_default" className="text-xs font-medium text-text-main cursor-pointer select-none">
            Make this my default address
          </label>
        </div>
      )}

      <div className="flex items-center justify-end gap-3 pt-3">
        {onCancel && (
          <Button type="button" variant="outline" size="sm" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
        )}
        <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting} disabled={isSubmitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
