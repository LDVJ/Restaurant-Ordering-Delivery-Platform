import { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, MapPin, Phone } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useConfirm } from '../../context/ConfirmContext';
import { createOrder } from '../../api/orderApi';
import * as addressApi from '../../api/addressApi';
import { getErrorMessage } from '../../utils/errors';
import { formatCurrency } from '../../utils/format';
import FormAlert from '../../components/auth/FormAlert';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Skeleton from '../../components/ui/Skeleton';
import CheckoutSuccessView from '../../components/cart/CheckoutSuccessView';
import CheckoutSummaryCard from '../../components/cart/CheckoutSummaryCard';
import AddressPickerModal from '../../components/address/AddressPickerModal';
import AddressForm from '../../components/address/AddressForm';

export default function CheckoutPage() {
  const { items, restaurantId, restaurantName, subtotal, totalItems, clearCart } = useCart();
  const confirm = useConfirm();
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);
  const [addressFetchError, setAddressFetchError] = useState('');
  const [reloadTrigger, setReloadTrigger] = useState(0);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isCreatingFirstAddress, setIsCreatingFirstAddress] = useState(false);
  const [formError, setFormError] = useState('');
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);

  useEffect(() => {
    let ignore = false;
    async function loadAddresses() {
      try {
        const data = await addressApi.getAddresses();
        if (!ignore) {
          const list = Array.isArray(data) ? data : [];
          setAddresses(list);
          if (list.length > 0) setSelectedAddress((prev) => prev || list.find((a) => a.is_default) || list[0]);
          else setSelectedAddress(null);
          setAddressFetchError('');
        }
      } catch (err) {
        if (!ignore) setAddressFetchError(getErrorMessage(err));
      } finally {
        if (!ignore) setIsLoadingAddresses(false);
      }
    }
    loadAddresses();
    return () => { ignore = true; };
  }, [reloadTrigger]);

  const retryFetch = () => {
    setIsLoadingAddresses(true);
    setReloadTrigger((prev) => prev + 1);
  };

  if (items.length === 0 && !placedOrder) return <Navigate to="/cart" replace />;
  if (placedOrder) return <CheckoutSuccessView order={placedOrder} />;

  const formatAddressString = (a) => `${a.house}, ${a.city}, ${a.state}, ${a.country}`;
  const getContactPhone = (a) => a.phone_e164 || `${a.country_code}${a.phone_number}`;

  const handleCreateAddress = async (payload) => {
    const created = await addressApi.createAddress(payload);
    setAddresses((prev) => [created, ...prev]);
    setSelectedAddress(created);
    return created;
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (isSubmittingOrder || !selectedAddress) return;
    const formattedAddress = formatAddressString(selectedAddress);
    const ok = await confirm({
      title: 'Place order?',
      message: `Place order with ${restaurantName || 'the kitchen'} for ${formatCurrency(subtotal)} to ${formattedAddress}?`,
      confirmText: 'Confirm & Place order',
      cancelText: 'Back to checkout',
      variant: 'default',
    });
    if (!ok) return;

    setIsSubmittingOrder(true);
    setFormError('');
    try {
      const payload = {
        restaurant_id: restaurantId,
        items: items.map((i) => ({ menu_item_id: i.menu_item_id, quantity: i.quantity })),
        delivery_address: formattedAddress,
        contact_phone: getContactPhone(selectedAddress),
      };
      const order = await createOrder(payload, { restaurantName, items });
      clearCart();
      setPlacedOrder(order);
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 text-left max-w-4xl mx-auto">
      <Link to="/cart" className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-muted-text hover:text-brand transition-colors">
        <ArrowLeft className="w-4 h-4" /><span>Back to cart</span>
      </Link>
      <h1 className="text-2xl sm:text-3xl font-bold text-text-main tracking-tight">Checkout</h1>
      {formError && <FormAlert message={formError} />}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 bg-white rounded-2xl border border-border p-5 sm:p-6 space-y-5 shadow-2xs">
          <div>
            <h2 className="text-base font-bold text-text-main flex items-center gap-2">
              <MapPin className="w-4 h-4 text-brand" /><span>Delivery Details</span>
            </h2>
            <p className="text-xs text-muted-text mt-0.5">Select a saved address or enter a new one.</p>
          </div>

          {isLoadingAddresses ? (
            <div className="space-y-3"><Skeleton className="h-28 w-full rounded-xl" /><Skeleton className="h-10 w-full rounded-xl" /></div>
          ) : addressFetchError ? (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-center space-y-2">
              <p className="text-xs text-danger font-medium">{addressFetchError}</p>
              <Button type="button" variant="outline" size="sm" onClick={retryFetch}>Retry</Button>
            </div>
          ) : addresses.length > 0 && selectedAddress ? (
            <div className="rounded-xl border border-border p-4 bg-gray-50/50 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-text-main">{selectedAddress.house}</span>
                    {selectedAddress.is_default && <Badge variant="brand" size="sm">Default</Badge>}
                  </div>
                  <p className="text-xs text-muted-text">{selectedAddress.city}, {selectedAddress.state}, {selectedAddress.country}</p>
                  <p className="text-xs text-text-main font-medium flex items-center gap-1.5 pt-1">
                    <Phone className="w-3.5 h-3.5 text-muted-text" /><span>{getContactPhone(selectedAddress)}</span>
                  </p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={() => setIsPickerOpen(true)}>Change</Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3 border border-dashed border-border rounded-xl p-4 bg-gray-50/40">
              <p className="text-xs text-muted-text">You do not have a saved address yet. Enter your address to place this order.</p>
              <AddressForm
                hasExistingAddresses={false}
                onSubmit={async (payload) => {
                  setIsCreatingFirstAddress(true);
                  try { await handleCreateAddress(payload); } finally { setIsCreatingFirstAddress(false); }
                }}
                submitLabel="Save and use address"
                isSubmitting={isCreatingFirstAddress}
              />
            </div>
          )}

          <div className="p-3.5 rounded-xl bg-brand-tint/60 border border-brand/20 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-brand shrink-0 mt-0.5" />
            <p className="text-xs text-text-main leading-relaxed"><strong>Simulated checkout:</strong> Instant confirmation with simulated payment.</p>
          </div>
        </div>

        <div className="lg:col-span-5">
          <CheckoutSummaryCard
            items={items}
            restaurantName={restaurantName}
            totalItems={totalItems}
            subtotal={subtotal}
            isSubmitting={isSubmittingOrder || !selectedAddress}
          />
        </div>
      </form>

      {isPickerOpen && (
        <AddressPickerModal
          isOpen={isPickerOpen}
          onClose={() => setIsPickerOpen(false)}
          addresses={addresses}
          selectedId={selectedAddress?.id}
          onSelectAddress={(addr) => setSelectedAddress(addr)}
          onCreateAddress={handleCreateAddress}
        />
      )}
    </div>
  );
}
