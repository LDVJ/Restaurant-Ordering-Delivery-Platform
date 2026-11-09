import { useState } from 'react';
import toast from 'react-hot-toast';
import { requestReturn } from '../../api/orderApi';
import { useConfirm } from '../../context/ConfirmContext';
import { getErrorMessage } from '../../utils/errors';
import { FIELD_LIMITS } from '../../utils/constants';

import Modal from '../ui/Modal';
import Button from '../ui/Button';
import FormAlert from '../auth/FormAlert';

/**
 * ReturnRequestModal Component
 * Allows customer to submit a return request with a mandatory reason (10-500 chars).
 * Triggering submit launches a confirmation dialog prior to sending the API request.
 */
export default function ReturnRequestModal({
  isOpen,
  onClose,
  orderId,
  restaurantName,
  onSubmitSuccess,
}) {
  const confirm = useConfirm();

  const [reason, setReason] = useState('');
  const [reasonError, setReasonError] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = () => {
    setReason('');
    setReasonError('');
    setFormError('');
    onClose?.();
  };

  const validate = () => {
    setReasonError('');
    setFormError('');

    const trimmed = reason.trim();
    if (trimmed.length < FIELD_LIMITS.RETURN_REASON_MIN) {
      setReasonError(`Please provide at least ${FIELD_LIMITS.RETURN_REASON_MIN} characters explaining the issue.`);
      return false;
    }
    if (trimmed.length > FIELD_LIMITS.RETURN_REASON_MAX) {
      setReasonError(`Reason cannot exceed ${FIELD_LIMITS.RETURN_REASON_MAX} characters.`);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting || !validate()) return;

    // Open confirmation dialog before submitting return request
    const ok = await confirm({
      title: 'Submit return request?',
      message: `Are you sure you want to request a return for this order from ${
        restaurantName || 'the kitchen'
      }? The restaurant manager will review your request.`,
      confirmText: 'Yes, submit return',
      cancelText: 'Cancel',
      variant: 'danger',
    });

    if (!ok) return;

    setIsSubmitting(true);
    setFormError('');

    try {
      const returnData = await requestReturn(orderId, {
        reason: reason.trim(),
      });
      toast.success('Return requested');
      onSubmitSuccess?.(returnData);
      handleClose();
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Request a return"
      showCloseButton={!isSubmitting}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        <div>
          <h2 id="modal-title" className="text-lg font-bold text-text-main">
            Request a return
          </h2>
          <p className="text-xs text-muted-text mt-0.5">
            Tell the restaurant why you are requesting a return or refund for this order.
          </p>
        </div>

        {formError && <FormAlert message={formError} />}

        <div>
          <label htmlFor="return-reason" className="block text-xs font-semibold text-text-main mb-1">
            Reason for return <span className="text-danger">*</span>
          </label>
          <textarea
            id="return-reason"
            rows={4}
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              if (reasonError) setReasonError('');
            }}
            placeholder="e.g. Received incorrect dish, items spilled during delivery, or food quality issue..."
            maxLength={FIELD_LIMITS.RETURN_REASON_MAX}
            className={`w-full p-3 rounded-xl border bg-white text-xs sm:text-sm text-text-main focus:outline-hidden focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors resize-none ${
              reasonError ? 'border-danger' : 'border-border'
            }`}
          />
          <div className="flex justify-between items-center text-[11px] text-muted-text mt-1">
            <span>
              {reasonError ? (
                <span className="text-danger font-medium">{reasonError}</span>
              ) : (
                'Minimum 10 characters required'
              )}
            </span>
            <span>{reason.length}/{FIELD_LIMITS.RETURN_REASON_MAX}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/70">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="danger"
            size="sm"
            isLoading={isSubmitting}
            disabled={isSubmitting}
          >
            Submit request
          </Button>
        </div>
      </form>
    </Modal>
  );
}
