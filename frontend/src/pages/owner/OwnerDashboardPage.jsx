import { useState, useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Store, UtensilsCrossed, Settings, MapPin, Phone, Shield } from 'lucide-react';
import * as ownerApi from '../../api/ownerApi';
import { getErrorMessage } from '../../utils/errors';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Skeleton from '../../components/ui/Skeleton';
import OwnerStatCards from '../../components/owner/OwnerStatCards';
import OwnerStatusRow from '../../components/owner/OwnerStatusRow';
import OwnerTopItems from '../../components/owner/OwnerTopItems';
import OwnerRemindersPanel from '../../components/owner/OwnerRemindersPanel';

export default function OwnerDashboardPage() {
  const { restaurant, refreshBadges } = useOutletContext();
  const addr = restaurant?.address;

  const [stats, setStats] = useState(null);
  const [reminders, setReminders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let ignore = false;
    async function loadDashboardData() {
      try {
        const [statsData, remindersData] = await Promise.all([
          ownerApi.getOwnerStats(),
          ownerApi.getOwnerReminders({ page_size: 10 }),
        ]);
        if (!ignore) {
          setStats(statsData);
          setReminders(remindersData.items || []);
          setError(null);
        }
      } catch (err) {
        if (!ignore) setError(getErrorMessage(err));
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }
    loadDashboardData();
    return () => { ignore = true; };
  }, []);

  const handleMarkReminderRead = async (id) => {
    try {
      await ownerApi.markReminderRead(id);
      setReminders((prev) => prev.map((r) => (r.id === id ? { ...r, is_read: true } : r)));
      toast.success('Reminder marked as read');
      if (refreshBadges) refreshBadges();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const ownerPhone = restaurant?.phone_e164 || `${restaurant?.country_code} ${restaurant?.phone_number}`;
  const restPhone = addr?.phone_e164 || `${addr?.country_code} ${addr?.phone_number}`;

  return (
    <div className="space-y-6 text-left max-w-5xl pb-10">
      {/* 1. Restaurant Summary Card */}
      <div className="bg-white rounded-2xl border border-border p-6 sm:p-7 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/70 pb-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl bg-brand-tint text-brand flex items-center justify-center shrink-0">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold text-text-main tracking-tight">{restaurant?.name}</h1>
                <Badge variant="brand" size="sm">{restaurant?.cuisine}</Badge>
              </div>
              <p className="text-xs text-muted-text mt-0.5 line-clamp-1">{restaurant?.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link to="/owner/menu"><Button variant="primary" size="sm" icon={UtensilsCrossed}>Manage menu</Button></Link>
            <Link to="/owner/restaurant"><Button variant="outline" size="sm" icon={Settings}>Settings</Button></Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs pt-1">
          <div className="flex items-start gap-2 p-2.5 rounded-xl bg-gray-50 border border-border/60">
            <MapPin className="w-4 h-4 text-brand shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-text-main">Pickup Location</p>
              <p className="text-muted-text mt-0.5">{addr?.house}, {addr?.city}, {addr?.state}</p>
            </div>
          </div>
          <div className="flex items-start gap-2 p-2.5 rounded-xl bg-gray-50 border border-border/60">
            <Phone className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-text-main">Restaurant Contact</p>
              <p className="text-muted-text mt-0.5">{restPhone}</p>
            </div>
          </div>
          <div className="flex items-start gap-2 p-2.5 rounded-xl bg-gray-50 border border-border/60">
            <Shield className="w-4 h-4 text-brand shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-text-main">Owner Account Phone</p>
              <p className="text-muted-text mt-0.5">{ownerPhone} (private)</p>
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-28 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 border border-red-200 text-danger rounded-xl text-xs">{error}</div>
      ) : (
        <>
          {/* 2. Stat Cards Grid */}
          <OwnerStatCards stats={stats} />

          {/* 3. Orders by Lifecycle Status Row */}
          <OwnerStatusRow statusCounts={stats?.orders_by_status} />

          {/* 4. Top Items and Reminders */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-5">
              <OwnerTopItems topItems={stats?.top_items} />
            </div>
            <div className="lg:col-span-7">
              <OwnerRemindersPanel reminders={reminders} onMarkRead={handleMarkReminderRead} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
