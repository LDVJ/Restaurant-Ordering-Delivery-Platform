import { useState } from 'react';
import { FIELD_LIMITS } from '../../utils/constants';
import Input from '../ui/Input';
import Button from '../ui/Button';
import FormAlert from '../auth/FormAlert';

export default function DishForm({
  initialDish = null,
  onSubmit,
  onCancel,
  isSubmitting = false,
}) {
  const isEdit = Boolean(initialDish?.id);

  const [formData, setFormData] = useState({
    name: initialDish?.name || '',
    description: initialDish?.description || '',
    price: initialDish?.price ? String(initialDish.price) : '',
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');

  const hasChanged = isEdit
    ? formData.name.trim() !== (initialDish?.name || '').trim() ||
      formData.description.trim() !== (initialDish?.description || '').trim() ||
      Number(formData.price).toFixed(2) !== Number(initialDish?.price || 0).toFixed(2)
    : true;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    if (formError) setFormError('');
  };

  const validate = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Dish name is required';
    else if (formData.name.trim().length > FIELD_LIMITS.DISH_NAME_MAX) errors.name = `Max ${FIELD_LIMITS.DISH_NAME_MAX} characters`;

    if (!formData.description.trim()) errors.description = 'Description is required';
    else if (formData.description.trim().length > FIELD_LIMITS.DISH_DESC_MAX) {
      errors.description = `Max ${FIELD_LIMITS.DISH_DESC_MAX} characters`;
    }

    const numPrice = Number(formData.price);
    const priceRegex = /^\d+(\.\d{1,2})?$/;
    if (!formData.price.trim()) {
      errors.price = 'Price is required';
    } else if (isNaN(numPrice) || numPrice <= 0) {
      errors.price = 'Price must be greater than 0';
    } else if (numPrice > FIELD_LIMITS.DISH_PRICE_MAX) {
      errors.price = `Price cannot exceed ${FIELD_LIMITS.DISH_PRICE_MAX}`;
    } else if (!priceRegex.test(formData.price.trim())) {
      errors.price = 'Price can have at most 2 decimal places';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting || !validate()) return;
    if (isEdit && !hasChanged) return;

    try {
      if (isEdit) {
        const changed = {};
        if (formData.name.trim() !== initialDish.name.trim()) changed.name = formData.name.trim();
        if (formData.description.trim() !== initialDish.description.trim()) changed.description = formData.description.trim();
        if (Number(formData.price).toFixed(2) !== Number(initialDish.price).toFixed(2)) {
          changed.price = Number(formData.price).toFixed(2);
        }
        await onSubmit(changed);
      } else {
        await onSubmit({
          name: formData.name.trim(),
          description: formData.description.trim(),
          price: Number(formData.price).toFixed(2),
        });
      }
    } catch (err) {
      if (err.response?.status === 422 && err.response?.data?.errors?.length) {
        const backendFieldErrors = {};
        err.response.data.errors.forEach((eItem) => {
          if (eItem.field) backendFieldErrors[eItem.field] = eItem.message;
        });
        setFieldErrors(backendFieldErrors);
      }
      setFormError(err.response?.data?.detail || 'Failed to save dish. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-left" noValidate>
      {formError && <FormAlert message={formError} />}

      <Input
        label="Dish name"
        name="name"
        placeholder="e.g. Paneer Butter Masala"
        value={formData.name}
        onChange={handleChange}
        error={fieldErrors.name}
        maxLength={FIELD_LIMITS.DISH_NAME_MAX}
        required
      />

      <div className="space-y-1">
        <label className="text-xs font-semibold text-text-main block">
          Short description <span className="text-danger">*</span>
        </label>
        <textarea
          name="description"
          rows={3}
          placeholder="e.g. Cottage cheese cooked in rich tomato and cashew gravy"
          value={formData.description}
          onChange={handleChange}
          maxLength={FIELD_LIMITS.DISH_DESC_MAX}
          className={`w-full p-3 rounded-xl border bg-white text-sm text-text-main focus:outline-hidden focus:ring-2 focus:ring-brand/20 focus:border-brand resize-none ${
            fieldErrors.description ? 'border-danger' : 'border-border'
          }`}
        />
        <div className="flex justify-between text-[11px] text-muted-text">
          <span>{fieldErrors.description && <span className="text-danger">{fieldErrors.description}</span>}</span>
          <span>{formData.description.length}/{FIELD_LIMITS.DISH_DESC_MAX}</span>
        </div>
      </div>

      <Input
        label="Price (₹)"
        name="price"
        type="number"
        step="0.01"
        placeholder="199.00"
        value={formData.price}
        onChange={handleChange}
        error={fieldErrors.price}
        required
      />

      <div className="flex items-center justify-end gap-3 pt-3 border-t border-border/70">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          size="sm"
          isLoading={isSubmitting}
          disabled={isSubmitting || (isEdit && !hasChanged)}
        >
          {isEdit ? 'Save changes' : 'Add dish'}
        </Button>
      </div>
    </form>
  );
}
