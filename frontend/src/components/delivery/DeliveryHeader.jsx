import { Bike, Clock, History } from 'lucide-react';

export default function DeliveryHeader({ user, activeTab, onTabChange, activeCount }) {
  return (
    <div className="space-y-4 text-left">
      {/* Rider Header */}
      <div className="bg-white rounded-2xl border border-border p-5 sm:p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800">
              <Bike className="w-3.5 h-3.5" />
              <span>Rider Portal</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text-main tracking-tight">
            Welcome, {user?.name || 'Rider'}!
          </h1>
          <p className="text-xs sm:text-sm text-muted-text mt-0.5">
            Manage your assigned pickups, navigate campus routes, and complete deliveries.
          </p>
        </div>
      </div>

      {/* Navigation Tabs: Active vs History */}
      <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl self-start max-w-fit">
        <button
          type="button"
          onClick={() => onTabChange('active')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'active' ? 'bg-white text-brand shadow-xs' : 'text-muted-text hover:text-text-main'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Active Deliveries</span>
          {activeTab === 'active' && activeCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-brand text-white">{activeCount}</span>
          )}
        </button>
        <button
          type="button"
          onClick={() => onTabChange('history')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'history' ? 'bg-white text-brand shadow-xs' : 'text-muted-text hover:text-text-main'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Delivery History</span>
        </button>
      </div>
    </div>
  );
}
