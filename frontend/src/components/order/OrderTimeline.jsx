import { Check, XCircle, RotateCcw } from 'lucide-react';
import { ORDER_STATUSES, ORDER_TIMELINE_STEPS, ORDER_STATUS_CONFIG } from '../../utils/constants';

/**
 * OrderTimeline Component
 * Displays a progressive timeline for active order lifecycle.
 * In terminal states (CANCELLED, REFUNDED), replaces the stepper with a clear end-state card.
 * Supports vertical=true for modal views (top to bottom) and horizontal for wide views.
 */
export default function OrderTimeline({ status, vertical = false }) {
  if (status === ORDER_STATUSES.CANCELLED) {
    return (
      <div className="p-4 sm:p-5 rounded-2xl bg-gray-50 border border-gray-200 text-left">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center shrink-0">
            <XCircle className="w-5 h-5 text-gray-600" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-text-main">Order cancelled</h3>
            <p className="text-xs sm:text-sm text-muted-text mt-0.5">
              This order was cancelled and payment has been processed for refund.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (status === ORDER_STATUSES.REFUNDED) {
    return (
      <div className="p-4 sm:p-5 rounded-2xl bg-gray-50 border border-gray-200 text-left">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center shrink-0">
            <RotateCcw className="w-5 h-5 text-gray-600" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-text-main">Order refunded</h3>
            <p className="text-xs sm:text-sm text-muted-text mt-0.5">
              This order was refunded. The amount has been credited back to your account.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const currentIndex = ORDER_TIMELINE_STEPS.indexOf(status);
  const activeStepIdx = currentIndex >= 0 ? currentIndex : 0;

  return (
    <div className="p-4 sm:p-6 rounded-2xl bg-white border border-border shadow-2xs text-left">
      <h3 className="text-sm font-semibold text-muted-text uppercase tracking-wider mb-5">
        Live Order Status
      </h3>

      <div className="relative">
        {vertical ? (
          <ol className="space-y-4">
            {ORDER_TIMELINE_STEPS.map((stepKey, index) => {
              const stepConfig = ORDER_STATUS_CONFIG[stepKey];
              const isCompleted = index < activeStepIdx;
              const isCurrent = index === activeStepIdx;

              return (
                <li key={stepKey} className="relative flex items-start gap-3">
                  {index < ORDER_TIMELINE_STEPS.length - 1 && (
                    <div
                      className={`absolute left-4 top-8 w-0.5 h-[calc(100%+8px)] -ml-[1px] transition-colors ${
                        isCompleted ? 'bg-brand' : 'bg-gray-200'
                      }`}
                    />
                  )}
                  <div
                    className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all ${
                      isCompleted
                        ? 'bg-brand text-white shadow-xs'
                        : isCurrent
                        ? 'bg-brand text-white ring-4 ring-brand-tint shadow-xs'
                        : 'bg-gray-100 text-gray-400 border border-gray-200'
                    }`}
                  >
                    {isCompleted ? <Check className="w-4 h-4 stroke-[2.5]" /> : <span>{index + 1}</span>}
                  </div>
                  <div className="pt-1">
                    <p
                      className={`text-xs font-semibold leading-tight ${
                        isCurrent
                          ? 'text-brand font-bold'
                          : isCompleted
                          ? 'text-text-main font-medium'
                          : 'text-muted-text'
                      }`}
                    >
                      {stepConfig?.label || stepKey}
                    </p>
                    {isCurrent && (
                      <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded-full text-[10px] uppercase font-bold tracking-wider bg-brand text-white">
                        Current
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        ) : (
          <ol className="grid grid-cols-1 md:grid-cols-7 gap-4 md:gap-2">
            {ORDER_TIMELINE_STEPS.map((stepKey, index) => {
              const stepConfig = ORDER_STATUS_CONFIG[stepKey];
              const isCompleted = index < activeStepIdx;
              const isCurrent = index === activeStepIdx;

              return (
                <li key={stepKey} className="relative flex md:flex-col items-center gap-3 md:gap-2">
                  {index < ORDER_TIMELINE_STEPS.length - 1 && (
                    <div
                      className={`hidden md:block absolute top-4 left-1/2 w-full h-0.5 -z-0 transition-colors ${
                        isCompleted ? 'bg-brand' : 'bg-gray-200'
                      }`}
                    />
                  )}
                  <div
                    className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isCompleted
                        ? 'bg-brand text-white shadow-xs'
                        : isCurrent
                        ? 'bg-brand text-white ring-4 ring-brand-tint shadow-xs'
                        : 'bg-gray-100 text-gray-400 border border-gray-200'
                    }`}
                  >
                    {isCompleted ? <Check className="w-4 h-4 stroke-[2.5]" /> : <span>{index + 1}</span>}
                  </div>
                  <div className="md:text-center">
                    <p
                      className={`text-xs font-semibold leading-tight ${
                        isCurrent
                          ? 'text-brand font-bold'
                          : isCompleted
                          ? 'text-text-main font-medium'
                          : 'text-muted-text'
                      }`}
                    >
                      {stepConfig?.label || stepKey}
                    </p>
                    {isCurrent && (
                      <span className="inline-block mt-0.5 text-[10px] uppercase font-bold tracking-wider text-brand md:block">
                        Current
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </div>
  );
}
