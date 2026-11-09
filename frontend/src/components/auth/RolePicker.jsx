import { ShoppingBag, Store, Bike } from 'lucide-react';
import { ROLES } from '../../utils/constants';

const ROLE_OPTIONS = [
  {
    role: ROLES.CUSTOMER,
    title: 'Customer',
    description: 'Order food to dorms',
    icon: ShoppingBag,
  },
  {
    role: ROLES.RESTAURANT_OWNER,
    title: 'Restaurant Owner',
    description: 'Manage menu & orders',
    icon: Store,
  },
  {
    role: ROLES.DELIVERY_PARTNER,
    title: 'Delivery Partner',
    description: 'Deliver across campus',
    icon: Bike,
  },
];

/**
 * RolePicker Component
 * Three compact selectable cards for role selection.
 * Supports both value/onChange and selectedRole/onSelect props.
 */
export default function RolePicker({ value, selectedRole, onChange, onSelect }) {
  const currentRole = value ?? selectedRole ?? ROLES.CUSTOMER;

  const handleClick = (role) => {
    if (onChange) onChange(role);
    if (onSelect) onSelect(role);
  };

  return (
    <div className="space-y-1 text-left">
      <label className="text-xs font-semibold text-text-main block">
        Choose your role <span className="text-danger">*</span>
      </label>

      <div className="grid grid-cols-3 gap-2">
        {ROLE_OPTIONS.map((opt) => {
          const isSelected = currentRole === opt.role;
          const Icon = opt.icon;

          return (
            <button
              key={opt.role}
              type="button"
              onClick={() => handleClick(opt.role)}
              className={`relative flex flex-col items-start p-2 sm:p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                isSelected
                  ? 'border-brand bg-brand-tint/40 ring-1.5 ring-brand shadow-2xs'
                  : 'border-border bg-white hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <div
                  className={`p-1 rounded-md ${
                    isSelected
                      ? 'bg-brand text-white'
                      : 'bg-gray-100 text-muted-text'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span
                  className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                    isSelected
                      ? 'border-brand bg-brand text-white'
                      : 'border-gray-300'
                  }`}
                >
                  {isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  )}
                </span>
              </div>

              <span className="font-semibold text-xs text-text-main leading-tight truncate w-full">
                {opt.title}
              </span>
              <span className="text-[10px] text-muted-text truncate w-full mt-0.5">
                {opt.description}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
