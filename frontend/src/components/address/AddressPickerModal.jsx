import { useState } from 'react';
import { Plus, ArrowLeft } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import FormAlert from '../auth/FormAlert';
import AddressCard from './AddressCard';
import AddressForm from './AddressForm';
import { FIELD_LIMITS } from '../../utils/constants';

export default function AddressPickerModal({
  isOpen,
  onClose,
  addresses = [],
  selectedId,
  onSelectAddress,
  onCreateAddress,
}) {
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'add'
  const [tempSelectedId, setTempSelectedId] = useState(selectedId || addresses[0]?.id || null);
  const [errorMsg, setErrorMsg] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const isAtLimit = addresses.length >= FIELD_LIMITS.MAX_SAVED_ADDRESSES;

  const handleClose = () => {
    setViewMode('list');
    setErrorMsg('');
    onClose();
  };

  const handleConfirmSelect = () => {
    const chosen = addresses.find((a) => a.id === tempSelectedId) || addresses[0];
    if (chosen) {
      onSelectAddress(chosen);
      handleClose();
    }
  };

  const handleCreateNew = async (addressData) => {
    setIsCreating(true);
    setErrorMsg('');
    try {
      const created = await onCreateAddress(addressData);
      onSelectAddress(created);
      handleClose();
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || 'Failed to save new address.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={viewMode === 'add' ? 'Add delivery address' : 'Choose delivery address'}
      size="md"
    >
      <div className="space-y-4 text-left">
        {errorMsg && <FormAlert message={errorMsg} />}

        {viewMode === 'list' ? (
          <>
            <div className="max-h-[360px] overflow-y-auto space-y-2.5 pr-1">
              {addresses.map((addr) => (
                <AddressCard
                  key={addr.id}
                  address={addr}
                  selectable
                  isSelected={tempSelectedId === addr.id}
                  onSelect={(a) => setTempSelectedId(a.id)}
                />
              ))}
            </div>

            {isAtLimit ? (
              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 p-2.5 rounded-lg">
                You have reached the maximum limit of {FIELD_LIMITS.MAX_SAVED_ADDRESSES} saved addresses.
              </p>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                fullWidth
                icon={Plus}
                onClick={() => setViewMode('add')}
              >
                Add new address
              </Button>
            )}

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
              <Button type="button" variant="ghost" size="sm" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleConfirmSelect}
                disabled={!tempSelectedId || addresses.length === 0}
              >
                Deliver to this address
              </Button>
            </div>
          </>
        ) : (
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => {
                setViewMode('list');
                setErrorMsg('');
              }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-text hover:text-brand transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to address list</span>
            </button>

            <AddressForm
              hasExistingAddresses={addresses.length > 0}
              onSubmit={handleCreateNew}
              onCancel={() => {
                setViewMode('list');
                setErrorMsg('');
              }}
              submitLabel="Save and deliver here"
              isSubmitting={isCreating}
            />
          </div>
        )}
      </div>
    </Modal>
  );
}
