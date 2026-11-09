import { useState } from 'react';
import toast from 'react-hot-toast';
import { Store, Shield } from 'lucide-react';
import * as ownerApi from '../../api/ownerApi';
import { getErrorMessage } from '../../utils/errors';
import { FIELD_LIMITS } from '../../utils/constants';
import Input from '../ui/Input';
import Button from '../ui/Button';
import FormAlert from '../auth/FormAlert';
import PhoneInput from '../common/PhoneInput';

export default function RestaurantDetailsForm({ restaurant, onUpdate }) {
  const [formData, setFormData] = useState({
    name: restaurant?.name || '',
    description: restaurant?.description || '',
    cuisine: restaurant?.cuisine || '',
    country_code: restaurant?.country_code || '+91',
    phone_number: restaurant?.phone_number || '',
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasChanged =
    formData.name.trim() !== (restaurant?.name || '').trim() ||
    formData.description.trim() !== (restaurant?.description || '').trim() ||
    formData.cuisine.trim() !== (restaurant?.cuisine || '').trim() ||
    formData.country_code !== (restaurant?.country_code || '+91') ||
    formData.phone_number.trim() !== (restaurant?.phone_number || '').trim();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    if (formError) setFormError('');
  };

  const validate = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Restaurant name is required';
    else if (formData.name.trim().length > FIELD_LIMITS.NAME_MAX) errors.name = `Max ${FIELD_LIMITS.NAME_MAX} characters`;

    if (!formData.description.trim()) errors.description = 'Description is required';
    else if (formData.description.trim().length > FIELD_LIMITS.RESTAURANT_DESC_MAX) {
      errors.description = `Max ${FIELD_LIMITS.RESTAURANT_DESC_MAX} characters`;
    }

    if (!formData.cuisine.trim()) errors.cuisine = 'Cuisine is required';
    else if (formData.cuisine.trim().length > FIELD_LIMITS.RESTAURANT_CUISINE_MAX) {
      errors.cuisine = `Max ${FIELD_LIMITS.RESTAURANT_CUISINE_MAX} characters`;
    }

    const digits = formData.phone_number.replace(/\D/g, '');
    if (!digits) errors.phone_number = 'Owner contact number is required';
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
      const updated = await ownerApi.updateRestaurant(formData);
      onUpdate(updated);
      toast.success('Restaurant details updated');
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
        <Store className="w-5 h-5 text-brand" />
        <div>
          <h2 className="text-base font-bold text-text-main">Restaurant Details</h2>
          <p className="text-xs text-muted-text">Update public information and private owner contact.</p>
        </div>
      </div>

      {formError && <FormAlert message={formError} />}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Input label="Restaurant name" name="name" value={formData.name} onChange={handleChange} error={fieldErrors.name} maxLength={FIELD_LIMITS.NAME_MAX} required />

        <div className="space-y-1">
          <label className="text-xs font-semibold text-text-main block">Description <span className="text-danger">*</span></label>
          <textarea name="description" rows={3} value={formData.description} onChange={handleChange} maxLength={FIELD_LIMITS.RESTAURANT_DESC_MAX} className={`w-full p-3 rounded-xl border bg-white text-sm text-text-main focus:outline-hidden focus:ring-2 focus:ring-brand/20 focus:border-brand resize-none ${fieldErrors.description ? 'border-danger' : 'border-border'}`} />
          <div className="flex justify-between text-[11px] text-muted-text">
            <span>{fieldErrors.description && <span className="text-danger">{fieldErrors.description}</span>}</span>
            <span>{formData.description.length}/{FIELD_LIMITS.RESTAURANT_DESC_MAX}</span>
          </div>
        </div>

        <div>
          <Input label="Cuisine" name="cuisine" value={formData.cuisine} onChange={handleChange} error={fieldErrors.cuisine} maxLength={FIELD_LIMITS.RESTAURANT_CUISINE_MAX} required />
          <p className="text-[11px] text-muted-text mt-1">Saved in Title Case (e.g. North Indian, Fast Food).</p>
        </div>

        <div className="space-y-1">
          <PhoneInput label="Owner contact number (private)" countryCode={formData.country_code} phoneNumber={formData.phone_number} onChange={handleChange} error={fieldErrors.phone_number} required />
          <p className="text-[11px] text-muted-text flex items-center gap-1"><Shield className="w-3 h-3 text-brand" /> Private to your account; never visible to customers or drivers.</p>
        </div>

        <div className="flex justify-end pt-2">
          <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting} disabled={!hasChanged || isSubmitting}>
            Save details
          </Button>
        </div>
      </form>
    </div>
  );
}
