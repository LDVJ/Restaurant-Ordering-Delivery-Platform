import { useState, useEffect } from 'react';
import { Bike, Phone, Check } from 'lucide-react';
import { useConfirm } from '../../context/ConfirmContext';
import * as ownerApi from '../../api/ownerApi';
import { getErrorMessage } from '../../utils/errors';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Spinner from '../ui/Spinner';
import FormAlert from '../auth/FormAlert';

export default function AssignPartnerModal({
  isOpen,
  onClose,
  order,
  onAssignSuccess,
}) {
  const confirm = useConfirm();
  const [partners, setPartners] = useState([]);
  const [selectedPartnerId, setSelectedPartnerId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    let ignore = false;
    async function loadPartners() {
      try {
        const list = await ownerApi.getDeliveryPartners();
        if (!ignore) {
          setPartners(Array.isArray(list) ? list : []);
          if (list && list.length > 0) setSelectedPartnerId(list[0].id);
        }
      } catch (err) {
        if (!ignore) setError(getErrorMessage(err));
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }
    loadPartners();
    return () => { ignore = true; };
  }, [isOpen]);

  const handleConfirmAssign = async () => {
    const partner = partners.find((p) => p.id === selectedPartnerId);
    if (!partner || !order) return;

    const shortId = order.id.slice(0, 8).toUpperCase();
    const ok = await confirm({
      title: 'Assign delivery partner?',
      message: `Assign ${partner.name} to deliver order #${shortId}?`,
      confirmText: 'Assign partner',
      cancelText: 'Cancel',
      variant: 'default',
    });
    if (!ok) return;

    setIsSubmitting(true);
    setError('');
    try {
      const updated = await ownerApi.assignDeliveryPartner(order.id, partner.id);
      onAssignSuccess(updated);
      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
      if (err.response?.status === 400) {
        try {
          const fresh = await ownerApi.getOwnerOrderById(order.id);
          if (fresh) onAssignSuccess(fresh);
        } catch { /* silent refetch failure */ }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Assign Delivery Partner" size="md">
      <div className="space-y-4 text-left">
        {error && <FormAlert message={error} />}

        {isLoading ? (
          <div className="py-8 flex flex-col items-center justify-center gap-2">
            <Spinner size="md" />
            <p className="text-xs text-muted-text">Finding nearby delivery partners...</p>
          </div>
        ) : partners.length === 0 ? (
          <div className="p-6 text-center text-xs text-muted-text border border-dashed border-border rounded-xl space-y-1">
            <Bike className="w-8 h-8 text-gray-300 mx-auto" />
            <p className="font-semibold text-text-main">No delivery partners have registered yet</p>
            <p>Wait for partners to go online on campus before assigning.</p>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-muted-text">Select an active delivery partner for pickup:</p>
            <div className="space-y-2 max-h-60 overflow-y-auto px-1 py-1">
              {partners.map((p) => {
                const isSelected = p.id === selectedPartnerId;
                return (
                  <div
                    key={p.id}
                    tabIndex={0}
                    onClick={() => setSelectedPartnerId(p.id)}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedPartnerId(p.id); } }}
                    className={`box-border border-2 p-3 rounded-xl flex items-center justify-between cursor-pointer transition-colors focus:outline-none focus-visible:border-brand ${
                      isSelected
                        ? 'border-brand bg-brand-tint/30'
                        : 'border-border bg-white hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-muted-text">
                        <Bike className="w-4 h-4 text-brand" />
                      </div>
                      <div>
                        <p className="font-bold text-xs text-text-main">{p.name}</p>
                        <p className="text-[11px] text-muted-text flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          <span>{p.phone}</span>
                        </p>
                      </div>
                    </div>

                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      isSelected ? 'border-brand bg-brand text-white' : 'border-border'
                    }`}>
                      {isSelected && <Check className="w-2.5 h-2.5 stroke-3" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
          <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            disabled={partners.length === 0 || isSubmitting}
            isLoading={isSubmitting}
            onClick={handleConfirmAssign}
          >
            Assign delivery partner
          </Button>
        </div>
      </div>
    </Modal>
  );
}
