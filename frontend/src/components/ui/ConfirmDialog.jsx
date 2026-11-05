import Modal from './Modal';
import Button from './Button';
import { AlertTriangle, HelpCircle } from 'lucide-react';

/**
 * ConfirmDialog Component
 * Built on top of Modal
 * Sourced from Section 8 of Frontend Guide
 */
export default function ConfirmDialog({
  isOpen,
  title = 'Are you sure?',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
  isLoading = false,
  onConfirm,
  onCancel,
}) {
  const isDanger = variant === 'danger';

  return (
    <Modal isOpen={isOpen} onClose={isLoading ? undefined : onCancel} title={title}>
      <div className="flex flex-col gap-4">
        {/* Header with Icon and Title */}
        <div className="flex items-start gap-3">
          <div
            className={`p-2.5 rounded-full shrink-0 ${
              isDanger
                ? 'bg-red-100 text-danger'
                : 'bg-brand-tint text-brand'
            }`}
          >
            {isDanger ? (
              <AlertTriangle className="w-5 h-5" />
            ) : (
              <HelpCircle className="w-5 h-5" />
            )}
          </div>

          <div className="flex flex-col gap-1">
            <h3 id="modal-title" className="text-lg font-semibold text-text-main">
              {title}
            </h3>
            {message && (
              <div className="text-sm text-muted-text leading-relaxed">
                {message}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 mt-2 pt-2 border-t border-border">
          <Button
            variant="secondary"
            onClick={onCancel}
            disabled={isLoading}
          >
            {cancelText}
          </Button>

          <Button
            variant={isDanger ? 'danger' : 'primary'}
            onClick={onConfirm}
            isLoading={isLoading}
            autoFocus
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
