import { useOutletContext } from 'react-router-dom';
import RestaurantDetailsForm from '../../components/owner/RestaurantDetailsForm';
import RestaurantAddressForm from '../../components/owner/RestaurantAddressForm';

export default function OwnerRestaurantPage() {
  const { restaurant, setRestaurant } = useOutletContext();

  const handleUpdate = (updated) => {
    setRestaurant(updated);
  };

  const detailsKey = `${restaurant?.name}-${restaurant?.phone_number}`;
  const addressKey = `${restaurant?.address?.house}-${restaurant?.address?.phone_number}`;

  return (
    <div className="space-y-6 text-left max-w-4xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-text-main tracking-tight">Restaurant Settings</h1>
        <p className="text-xs sm:text-sm text-muted-text mt-1">Manage your kitchen information, private contact, and delivery pickup address.</p>
      </div>

      <RestaurantDetailsForm key={detailsKey} restaurant={restaurant} onUpdate={handleUpdate} />
      <RestaurantAddressForm key={addressKey} restaurant={restaurant} onUpdate={handleUpdate} />
    </div>
  );
}
