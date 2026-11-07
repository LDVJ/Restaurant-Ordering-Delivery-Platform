import { CheckCircle2 } from 'lucide-react';
import { getPasswordCriteria } from '../../utils/validation';

/**
 * PasswordChecklist Component
 * Renders compact live criteria checklist
 */
export default function PasswordChecklist({ password = '' }) {
  const criteria = getPasswordCriteria(password);

  const items = [
    { key: 'length', label: '8 characters', valid: criteria.length },
    { key: 'hasUpper', label: '1 uppercase', valid: criteria.hasUpper },
    { key: 'hasLower', label: '1 lowercase', valid: criteria.hasLower },
    { key: 'hasDigit', label: '1 number', valid: criteria.hasDigit },
    { key: 'hasSpecial', label: '1 special char', valid: criteria.hasSpecial, colSpan: true },
  ];

  return (
    <div className="p-2 bg-page rounded-lg text-left border border-border/60">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 text-[10.5px]">
        {items.map((item) => (
          <div
            key={item.key}
            className={`flex items-center gap-1 ${item.colSpan ? 'col-span-2 sm:col-span-2' : ''}`}
          >
            <CheckCircle2
              className={`w-3 h-3 shrink-0 ${
                item.valid ? 'text-success' : 'text-gray-300'
              }`}
            />
            <span className={item.valid ? 'text-text-main font-medium' : 'text-muted-text'}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
