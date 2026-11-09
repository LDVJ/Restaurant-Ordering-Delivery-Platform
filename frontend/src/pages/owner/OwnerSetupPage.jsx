import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Store, MapPin, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import * as ownerApi from '../../api/ownerApi';
import { getErrorMessage } from '../../utils/errors';
import { FIELD_LIMITS } from '../../utils/constants';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import FormAlert from '../../components/auth/FormAlert';
import PhoneInput from '../../components/common/PhoneInput';

export default function OwnerSetupPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isChecking, setIsChecking] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const [formData, setFormData] = useState({
    name: '', description: '', cuisine: '',
    owner_country_code: user?.country_code || '+91', owner_phone: user?.phone_number || '',
    house: '', city: '', state: '', country: 'India',
    rest_country_code: '+91', rest_phone: '',
  });

  useEffect(() => {
    let ignore = false;
    async function checkExisting() {
      try {
        await ownerApi.getRestaurant();
        if (!ignore) navigate('/owner', { replace: true });
      } catch (err) {
        if (!ignore) {
          if (err.response?.status !== 404) setFormError(getErrorMessage(err));
          setIsChecking(false);
        }
      }
    }
    checkExisting();
    return () => { ignore = true; };
  }, [navigate]);

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
    else if (formData.description.trim().length > FIELD_LIMITS.RESTAURANT_DESC_MAX) errors.description = `Max ${FIELD_LIMITS.RESTAURANT_DESC_MAX} characters`;
    if (!formData.cuisine.trim()) errors.cuisine = 'Cuisine is required';
    else if (formData.cuisine.trim().length > FIELD_LIMITS.RESTAURANT_CUISINE_MAX) errors.cuisine = `Max ${FIELD_LIMITS.RESTAURANT_CUISINE_MAX} characters`;

    const oPhone = formData.owner_phone.replace(/\D/g, '');
    if (!oPhone) errors.owner_phone = 'Owner contact number is required';
    else if (oPhone.length < FIELD_LIMITS.PHONE_MIN || oPhone.length > FIELD_LIMITS.PHONE_MAX) errors.owner_phone = `Must be ${FIELD_LIMITS.PHONE_MIN}–${FIELD_LIMITS.PHONE_MAX} digits`;

    if (!formData.house.trim()) errors.house = 'House / building is required';
    if (!formData.city.trim()) errors.city = 'City is required';
    if (!formData.state.trim()) errors.state = 'State is required';
    if (!formData.country.trim()) errors.country = 'Country is required';

    const rPhone = formData.rest_phone.replace(/\D/g, '');
    if (!rPhone) errors.rest_phone = 'Restaurant contact number is required';
    else if (rPhone.length < FIELD_LIMITS.PHONE_MIN || rPhone.length > FIELD_LIMITS.PHONE_MAX) errors.rest_phone = `Must be ${FIELD_LIMITS.PHONE_MIN}–${FIELD_LIMITS.PHONE_MAX} digits`;

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting || !validate()) return;
    setIsSubmitting(true);
    setFormError('');

    try {
      await ownerApi.createRestaurant({
        name: formData.name.trim(), description: formData.description.trim(), cuisine: formData.cuisine.trim(),
        country_code: formData.owner_country_code, phone_number: formData.owner_phone.trim(),
        address: {
          house: formData.house.trim(), city: formData.city.trim(), state: formData.state.trim(),
          country: formData.country.trim(), country_code: formData.rest_country_code, phone_number: formData.rest_phone.trim(),
        },
      });
      toast.success('Restaurant set up successfully!');
      navigate('/owner');
    } catch (err) {
      if (err.response?.status === 422 && err.response?.data?.errors?.length) {
        const backendFieldErrors = {};
        err.response.data.errors.forEach((eItem) => { if (eItem.field) backendFieldErrors[eItem.field] = eItem.message; });
        setFieldErrors(backendFieldErrors);
      }
      setFormError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isChecking) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3">
        <Spinner size="lg" />
        <p className="text-sm text-muted-text">Checking restaurant status...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-6 pb-20 text-left space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-text-main tracking-tight">Set Up Your Restaurant</h1>
        <p className="text-xs sm:text-sm text-muted-text mt-1">Register your kitchen to start receiving campus orders.</p>
      </div>

      {formError && <FormAlert message={formError} />}

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <div className="bg-white rounded-2xl border border-border p-5 sm:p-6 space-y-4 shadow-2xs">
          <div className="flex items-center gap-2 border-b border-border/70 pb-3">
            <Store className="w-5 h-5 text-brand" />
            <h2 className="text-base font-bold text-text-main">Restaurant Details</h2>
          </div>
          <Input label="Restaurant name" name="name" placeholder="e.g. Spice Hub" value={formData.name} onChange={handleChange} error={fieldErrors.name} maxLength={FIELD_LIMITS.NAME_MAX} required />
          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-main block">Description <span className="text-danger">*</span></label>
            <textarea name="description" rows={3} placeholder="Tell students about your specialty dishes..." value={formData.description} onChange={handleChange} maxLength={FIELD_LIMITS.RESTAURANT_DESC_MAX} className={`w-full p-3 rounded-xl border bg-white text-sm text-text-main focus:outline-hidden focus:ring-2 focus:ring-brand/20 focus:border-brand resize-none ${fieldErrors.description ? 'border-danger' : 'border-border'}`} />
            <div className="flex justify-between text-[11px] text-muted-text">
              <span>{fieldErrors.description && <span className="text-danger">{fieldErrors.description}</span>}</span>
              <span>{formData.description.length}/{FIELD_LIMITS.RESTAURANT_DESC_MAX}</span>
            </div>
          </div>
          <div>
            <Input label="Cuisine" name="cuisine" placeholder="e.g. North Indian" value={formData.cuisine} onChange={handleChange} error={fieldErrors.cuisine} maxLength={FIELD_LIMITS.RESTAURANT_CUISINE_MAX} required />
            <p className="text-[11px] text-muted-text mt-1">Note: Cuisine is automatically saved in Title Case (e.g. North Indian, Fast Food).</p>
          </div>
          <div className="space-y-1">
            <PhoneInput label="Owner contact number (private)" countryCode={formData.owner_country_code} phoneNumber={formData.owner_phone} countryCodeName="owner_country_code" name="owner_phone" onChange={handleChange} error={fieldErrors.owner_phone} required />
            <p className="text-[11px] text-muted-text flex items-center gap-1"><Shield className="w-3 h-3 text-brand" /> Private to your account; never visible to customers or drivers.</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-border p-5 sm:p-6 space-y-4 shadow-2xs">
          <div className="flex items-center gap-2 border-b border-border/70 pb-3">
            <MapPin className="w-5 h-5 text-brand" />
            <h2 className="text-base font-bold text-text-main">Kitchen Location & Pickup Phone</h2>
          </div>
          <Input label="Shop / building / street" name="house" placeholder="e.g. Shop 4, Campus Market" value={formData.house} onChange={handleChange} error={fieldErrors.house} maxLength={FIELD_LIMITS.HOUSE_MAX} required />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input label="City" name="city" placeholder="e.g. Ghaziabad" value={formData.city} onChange={handleChange} error={fieldErrors.city} maxLength={FIELD_LIMITS.CITY_MAX} required />
            <Input label="State" name="state" placeholder="e.g. Uttar Pradesh" value={formData.state} onChange={handleChange} error={fieldErrors.state} maxLength={FIELD_LIMITS.STATE_MAX} required />
          </div>
          <Input label="Country" name="country" placeholder="e.g. India" value={formData.country} onChange={handleChange} error={fieldErrors.country} maxLength={FIELD_LIMITS.COUNTRY_MAX} required />
          <div className="space-y-1">
            <PhoneInput label="Restaurant contact number (shown after order)" countryCode={formData.rest_country_code} phoneNumber={formData.rest_phone} countryCodeName="rest_country_code" name="rest_phone" onChange={handleChange} error={fieldErrors.rest_phone} required />
            <p className="text-[11px] text-muted-text">Visible only to customers and assigned delivery partners once an order is placed.</p>
          </div>
        </div>

        <Button type="submit" variant="primary" size="lg" fullWidth isLoading={isSubmitting} disabled={isSubmitting}>
          Create Restaurant
        </Button>
      </form>
    </div>
  );
}
