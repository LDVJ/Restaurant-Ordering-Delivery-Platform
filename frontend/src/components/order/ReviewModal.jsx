import { useState, useCallback } from 'react';
import { Star } from 'lucide-react';
import toast from 'react-hot-toast';
import { submitReview } from '../../api/orderApi';
import { getErrorMessage } from '../../utils/errors';
import { FIELD_LIMITS } from '../../utils/constants';

import Modal from '../ui/Modal';
import Button from '../ui/Button';
import FormAlert from '../auth/FormAlert';

const RATING_LABELS = {
  1: 'Poor',
  2: 'Fair',
  3: 'Good',
  4: 'Very good',
  5: 'Excellent',
};

/**
 * ReviewModal Component
 * Allows customer to rate (1-5 stars) and comment on a delivered order.
 * Accessible with keyboard; no confirmation dialog per spec.
 */
export default function ReviewModal({
  isOpen,
  onClose,
  orderId,
  restaurantName,
  onSubmitSuccess,
}) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const handleClose = useCallback(() => {
    setRating(5);
    setHoverRating(0);
    setComment('');
    setFormError('');
    onClose?.();
  }, [onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!rating || rating < 1 || rating > 5) {
      setFormError('Please select a rating between 1 and 5 stars.');
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    try {
      const reviewData = await submitReview(orderId, {
        rating,
        comment: comment.trim(),
      });
      toast.success('Review submitted');
      onSubmitSuccess?.(reviewData);
      handleClose();
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeStarCount = hoverRating || rating;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Rate your order"
      showCloseButton={!isSubmitting}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        <div>
          <h2 id="modal-title" className="text-lg font-bold text-text-main">
            Rate your order
          </h2>
          <p className="text-xs text-muted-text mt-0.5">
            How was your meal from{' '}
            <span className="font-semibold text-text-main">
              {restaurantName || 'the restaurant'}
            </span>
            ?
          </p>
        </div>

        {formError && <FormAlert message={formError} />}

        {/* 1 to 5 Star Selector with Keyboard Navigation */}
        <div className="space-y-2 text-center py-2 bg-gray-50/70 rounded-xl border border-border/70">
          <div
            className="flex items-center justify-center gap-2"
            role="radiogroup"
            aria-label="Order rating out of 5 stars"
          >
            {[1, 2, 3, 4, 5].map((starVal) => {
              const isFilled = starVal <= activeStarCount;
              return (
                <button
                  key={starVal}
                  type="button"
                  role="radio"
                  aria-checked={rating === starVal}
                  aria-label={`${starVal} star${starVal > 1 ? 's' : ''} - ${RATING_LABELS[starVal]}`}
                  onClick={() => setRating(starVal)}
                  onMouseEnter={() => setHoverRating(starVal)}
                  onMouseLeave={() => setHoverRating(0)}
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowRight' && starVal < 5) setRating(starVal + 1);
                    if (e.key === 'ArrowLeft' && starVal > 1) setRating(starVal - 1);
                  }}
                  className="p-1 rounded-lg focus:outline-hidden focus-visible:ring-2 focus-visible:ring-brand transition-transform hover:scale-110 active:scale-95"
                >
                  <Star
                    className={`w-7 h-7 transition-colors ${
                      isFilled
                        ? 'text-amber-400 fill-amber-400 stroke-amber-500'
                        : 'text-gray-300 stroke-gray-300'
                    }`}
                  />
                </button>
              );
            })}
          </div>

          <p className="text-xs font-semibold text-text-main min-h-[16px]">
            {RATING_LABELS[activeStarCount] || ''}
          </p>
        </div>

        {/* Optional Comment */}
        <div>
          <label htmlFor="review-comment" className="block text-xs font-semibold text-text-main mb-1">
            Feedback comment <span className="text-muted-text font-normal">(Optional)</span>
          </label>
          <textarea
            id="review-comment"
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="What was great? Any food or packaging feedback?"
            maxLength={FIELD_LIMITS.REVIEW_COMMENT_MAX}
            className="w-full p-3 rounded-xl border border-border bg-white text-xs sm:text-sm text-text-main focus:outline-hidden focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors resize-none"
          />
          <div className="flex justify-end text-[11px] text-muted-text mt-1">
            <span>{comment.length}/{FIELD_LIMITS.REVIEW_COMMENT_MAX}</span>
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
            variant="primary"
            size="sm"
            isLoading={isSubmitting}
            disabled={isSubmitting}
          >
            Submit review
          </Button>
        </div>
      </form>
    </Modal>
  );
}
