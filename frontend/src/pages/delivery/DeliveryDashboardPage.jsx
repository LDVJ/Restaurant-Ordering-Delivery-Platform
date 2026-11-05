import { Link } from 'react-router-dom';
import { Bike, Sparkles, UserCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';

/**
 * DeliveryDashboardPage (Delivery Partner Home Placeholder)
 * Sourced from Section 7 & 11 of Frontend Guide
 */
export default function DeliveryDashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6 text-left">
      {/* Welcome Banner */}
      <div className="bg-white rounded-2xl border border-border p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="brand">Delivery Partner Portal</Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-text-main">
              Welcome, {user?.name || 'Rider'}!
            </h1>
            <p className="text-sm text-muted-text mt-1">
              You are signed in as a <strong className="text-text-main">Delivery Partner</strong> ({user?.email}).
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/ui-demo">
              <Button variant="outline" size="sm" icon={Sparkles}>
                View UI Demo
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* User Details & Next Phase Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-border p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-brand-tint text-brand">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-text-main text-sm">Rider Account Verified</h3>
              <p className="text-xs text-muted-text">Auth session active</p>
            </div>
          </div>

          <div className="space-y-2 text-xs border-t border-border pt-3">
            <div className="flex justify-between py-1">
              <span className="text-muted-text">Role:</span>
              <span className="font-semibold text-text-main">{user?.role}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted-text">Email:</span>
              <span className="font-semibold text-text-main">{user?.email}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted-text">Phone:</span>
              <span className="font-semibold text-text-main">{user?.phone_e164 || user?.phone_number}</span>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 bg-white rounded-xl border border-border p-6 shadow-xs flex flex-col justify-center items-start text-left">
          <div className="w-12 h-12 rounded-xl bg-orange-50 text-brand flex items-center justify-center mb-3">
            <Bike className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-text-main mb-1">
            Active Deliveries & Trip Queue
          </h2>
          <p className="text-sm text-muted-text max-w-lg mb-4 leading-relaxed">
            Authentication is verified. The next step will display your assigned campus delivery pickups, customer drop-off details, tap-to-call links, and status transitions (*Out for delivery* → *Delivered*).
          </p>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
            ✓ Connected to backend API: {import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}
          </div>
        </div>
      </div>
    </div>
  );
}
