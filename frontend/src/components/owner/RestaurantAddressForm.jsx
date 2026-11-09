import { useState } from 'react';
import toast from 'react-hot-toast';
import { MapPin, Phone } from 'lucide-react';
import * as ownerApi from '../../api/ownerApi';
import { getErrorMessage } from '../../utils/errors';
import { FIELD_LIMITS } from '../../utils/constants';
import Input from '../ui/Input';
import Button from '../ui/Button';
import FormAlert from '../auth/FormAlert';
import PhoneInput from '../common/PhoneInput';

export default function RestaurantAddressForm({ restaurant, onUpdate }) {
  const addr = restaurant?.address;

  const [formData, setFormData] = useState({
    house: addr?.house || '',
    city: addr?.city || '',
    state: addr?.state || '',
    country: addr?.country || 'India',
    country_code: addr?.country_code || '+91',
    phone_number: addr?.phone_number || '',
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasChanged =
    formData.house.trim() !== (addr?.house || '').trim() ||
    formData.city.trim() !== (addr?.city || '').trim() ||
    formData.state.trim() !== (addr?.state || '').trim() ||
    formData.country.trim() !== (addr?.country || '').trim() ||
    formData.country_code !== (addr?.country_code || '+91') ||
    formData.phone_number.trim() !== (addr?.phone_number || '').trim();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    if (formError) setFormError('');
  };

  const validate = () => {
    const errors = {};
    if (!formData.house.trim()) errors.house = 'House / building is required';
    else if (formData.house.trim().length > FIELD_LIMITS.HOUSE_MAX) errors.house = `Max ${FIELD_LIMITS.HOUSE_MAX} characters`;

    if (!formData.city.trim()) errors.city = 'City is required';
    else if (formData.city.trim().length > FIELD_LIMITS.CITY_MAX) errors.city = `Max ${FIELD_LIMITS.CITY_MAX} characters`;

    if (!formData.state.trim()) errors.state = 'State is required';
    else if (formData.state.trim().length > FIELD_LIMITS.STATE_MAX) errors.state = `Max ${FIELD_LIMITS.STATE_MAX} characters`;

    if (!formData.country.trim()) errors.country = 'Country is required';
    else if (formData.country.trim().length > FIELD_LIMITS.COUNTRY_MAX) errors.country = `Max ${FIELD_LIMITS.COUNTRY_MAX} characters`;

    const digits = formData.phone_number.replace(/\D/g, '');
    if (!digits) errors.phone_number = 'Restaurant contact number is required';
    else if (digits.length < FIELD_LIMITS.PHONE_MIN || digits.length > FIELD_LIMITS.PHONE_MAX) {
      errors.phone_number = `Must be ${FIELD_LIMITS.PHONE_MIN}–${FIELD_LIMITS.PHONE_MAX} digits`;
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!hasChanged || isSubmitting || !validate()) return;

    setIsSubmitting(true);
    setFormError('');

    try {
      const updated = await ownerApi.updateRestaurantAddress(formData);
      onUpdate(updated);
      toast.success('Restaurant address updated');
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
    <div className="bg-white rounded-2xl border border-border p-5 sm:p-6 shadow-2xs space-y-4 text-left">
      <div className="flex items-center gap-2 border-b border-border/70 pb-3">
        <MapPin className="w-5 h-5 text-brand" />
        <div>
          <h2 className="text-base font-bold text-text-main">Address & Contact Phone</h2>
          <p className="text-xs text-muted-text">Pickup location and public order support number.</p>
        </div>
      </div>

      {formError && <FormAlert message={formError} />}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Input label="Shop / building / street" name="house" value={formData.house} onChange={handleChange} error={fieldErrors.house} maxLength={FIELD_LIMITS.HOUSE_MAX} required />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input label="City" name="city" value={formData.city} onChange={handleChange} error={fieldErrors.city} maxLength={FIELD_LIMITS.CITY_MAX} required />
          <Input label="State" name="state" value={formData.state} onChange={handleChange} error={fieldErrors.state} maxLength={FIELD_LIMITS.STATE_MAX} required />
        </div>

        <Input label="Country" name="country" value={formData.country} onChange={handleChange} error={fieldErrors.country} maxLength={FIELD_LIMITS.COUNTRY_MAX} required />

        <div className="space-y-1">
          <PhoneInput label="Restaurant contact number (shown after order)" countryCode={formData.country_code} phoneNumber={formData.phone_number} onChange={handleChange} error={fieldErrors.phone_number} required />
          <p className="text-[11px] text-muted-text flex items-center gap-1"><Phone className="w-3 h-3 text-brand" /> Shown to customers and delivery partners after an order is placed.</p>
        </div>

        <div className="flex justify-end pt-2">
          <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting} disabled={!hasChanged || isSubmitting}>
            Save address
          </Button>
        </div>
      </form>
    </div>
  );
}
