import { Phone } from 'lucide-react';
import Select from '../ui/Select';
import Input from '../ui/Input';
import { COUNTRY_CODES, FIELD_LIMITS } from '../../utils/constants';

/**
 * PhoneInput Component
 * Reusable composite input for country code and digits-only phone number.
 */
export default function PhoneInput({
  countryCode = '+91',
  phoneNumber = '',
  onChange,
  onCountryCodeChange,
  onPhoneNumberChange,
  error = '',
  label = 'Phone number',
  required = false,
  disabled = false,
  name = 'phone_number',
  countryCodeName = 'country_code',
  id = 'phone_number',
  autoComplete = 'tel-national',
}) {
  const handleCountryChange = (e) => {
    const val = e.target.value;
    if (onCountryCodeChange) {
      onCountryCodeChange(val);
    }
    if (onChange) {
      onChange({ target: { name: countryCodeName, value: val } });
    }
  };

  const handlePhoneChange = (e) => {
    const digitsOnly = e.target.value.replace(/\D/g, '');
    if (onPhoneNumberChange) {
      onPhoneNumberChange(digitsOnly);
    }
    if (onChange) {
      onChange({ target: { name, value: digitsOnly } });
    }
  };

  return (
    <div className="text-left space-y-1">
      {label && (
        <label htmlFor={id} className="text-xs font-semibold text-text-main block">
          {label} {required && <span className="text-danger">*</span>}
        </label>
      )}

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        <div className="col-span-1">
          <Select
            name={countryCodeName}
            value={countryCode}
            onChange={handleCountryChange}
            options={COUNTRY_CODES}
            disabled={disabled}
            placeholder=""
          />
        </div>
        <div className="col-span-2 sm:col-span-3">
          <Input
            id={id}
            name={name}
            type="tel"
            placeholder="9876543210 (digits only)"
            icon={Phone}
            value={phoneNumber}
            onChange={handlePhoneChange}
            error={error}
            maxLength={FIELD_LIMITS.PHONE_MAX}
            autoComplete={autoComplete}
            required={required}
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  );
}
