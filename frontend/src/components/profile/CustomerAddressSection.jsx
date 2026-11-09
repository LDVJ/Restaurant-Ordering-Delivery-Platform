import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Plus } from 'lucide-react';
import { useConfirm } from '../../context/ConfirmContext';
import * as addressApi from '../../api/addressApi';
import { getErrorMessage } from '../../utils/errors';
import { FIELD_LIMITS } from '../../utils/constants';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import Skeleton from '../ui/Skeleton';
import EmptyState from '../ui/EmptyState';
import AddressCard from '../address/AddressCard';
import AddressForm from '../address/AddressForm';

export default function CustomerAddressSection() {
  const confirm = useConfirm();
  const [addresses, setAddresses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadTrigger, setReloadTrigger] = useState(0);
  const [modalMode, setModalMode] = useState(null); // null | 'add' | 'edit'
  const [editingAddress, setEditingAddress] = useState(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  useEffect(() => {
    let ignore = false;
    async function loadAddresses() {
      try {
        const data = await addressApi.getAddresses();
        if (!ignore) {
          setAddresses(Array.isArray(data) ? data : []);
          setError('');
        }
      } catch (err) {
        if (!ignore) setError(getErrorMessage(err));
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }
    loadAddresses();
    return () => { ignore = true; };
  }, [reloadTrigger]);

  const reloadData = () => {
    setIsLoading(true);
    setReloadTrigger((prev) => prev + 1);
  };

  const isAtLimit = addresses.length >= FIELD_LIMITS.MAX_SAVED_ADDRESSES;

  const handleMakeDefault = async (address) => {
    setIsActionLoading(true);
    try {
      const updated = await addressApi.makeDefaultAddress(address.id);
      setAddresses((prev) =>
        prev
          .map((a) => (a.id === updated.id ? { ...a, is_default: true } : { ...a, is_default: false }))
          .sort((a, b) => (b.is_default ? 1 : 0) - (a.is_default ? 1 : 0))
      );
      toast.success('Default address updated');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDelete = async (address) => {
    const confirmMessage = address.is_default
      ? 'This is your default address. If you delete it, your most recently added address becomes the default.'
      : 'Are you sure you want to delete this address? This action cannot be undone.';

    const ok = await confirm({
      title: 'Delete saved address?',
      message: confirmMessage,
      confirmText: 'Delete address',
      cancelText: 'Keep address',
      variant: 'danger',
    });
    if (!ok) return;

    setIsActionLoading(true);
    try {
      await addressApi.deleteAddress(address.id);
      toast.success('Address deleted');
      reloadData();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleFormSubmit = async (payload) => {
    setIsActionLoading(true);
    try {
      if (modalMode === 'edit' && editingAddress) {
        await addressApi.updateAddress(editingAddress.id, payload);
        toast.success('Address updated successfully');
      } else {
        await addressApi.createAddress(payload);
        toast.success('Address saved successfully');
      }
      setModalMode(null);
      setEditingAddress(null);
      reloadData();
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-border p-5 sm:p-6 shadow-2xs text-left space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-base font-bold text-text-main flex items-center gap-2">
            <span>My Addresses</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-muted-text">
              {addresses.length}/{FIELD_LIMITS.MAX_SAVED_ADDRESSES}
            </span>
          </h2>
          <p className="text-xs text-muted-text mt-0.5">Manage your delivery locations for faster checkout.</p>
        </div>
        <div className="flex items-center gap-2">
          {isAtLimit && (
            <span className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg">
              Limit reached (10 max)
            </span>
          )}
          <Button
            type="button"
            variant="primary"
            size="sm"
            icon={Plus}
            disabled={isAtLimit || isLoading}
            onClick={() => { setEditingAddress(null); setModalMode('add'); }}
          >
            Add new address
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          <Skeleton className="h-32 w-full rounded-xl" /><Skeleton className="h-32 w-full rounded-xl" />
        </div>
      ) : error ? (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-center space-y-2">
          <p className="text-xs font-semibold text-danger">{error}</p>
          <Button variant="outline" size="sm" onClick={reloadData}>Try again</Button>
        </div>
      ) : addresses.length === 0 ? (
        <EmptyState
          title="No saved addresses yet"
          description="Add a delivery address to place orders smoothly without typing every time."
          actionLabel="Add address"
          onAction={() => setModalMode('add')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          {addresses.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              onMakeDefault={handleMakeDefault}
              onEdit={(addr) => { setEditingAddress(addr); setModalMode('edit'); }}
              onDelete={handleDelete}
              isActionLoading={isActionLoading}
            />
          ))}
        </div>
      )}

      {modalMode && (
        <Modal
          isOpen={Boolean(modalMode)}
          onClose={() => { setModalMode(null); setEditingAddress(null); }}
          title={modalMode === 'edit' ? 'Edit address' : 'Add new address'}
          size="md"
        >
          <AddressForm
            initialAddress={editingAddress}
            hasExistingAddresses={addresses.length > 0}
            onSubmit={handleFormSubmit}
            onCancel={() => { setModalMode(null); setEditingAddress(null); }}
            submitLabel={modalMode === 'edit' ? 'Save changes' : 'Save address'}
            isSubmitting={isActionLoading}
          />
        </Modal>
      )}
    </div>
  );
}
