import { useState } from 'react';
import toast from 'react-hot-toast';
import {
  ShoppingBag,
  TrendingUp,
  Clock,
  Star,
  Search,
  Mail,
  AlertTriangle,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Spinner from '../components/ui/Spinner';
import Skeleton from '../components/ui/Skeleton';
import Badge from '../components/ui/Badge';
import StatusBadge from '../components/ui/StatusBadge';
import StatCard from '../components/ui/StatCard';
import Tabs from '../components/ui/Tabs';
import Pagination from '../components/ui/Pagination';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';
import { useConfirm } from '../context/ConfirmContext';
import {
  formatCurrency,
  formatDateTime,
  getInitials,
  colorFromName,
} from '../utils/format';
import {
  ORDER_STATUSES,
  PAYMENT_STATUSES,
  RETURN_STATUSES,
} from '../utils/constants';

export default function UiDemoPage() {
  const confirm = useConfirm();

  // State for interactive component demos
  const [loadingButtons, setLoadingButtons] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [selectValue, setSelectValue] = useState('north-indian');
  const [activeTab, setActiveTab] = useState('orders');
  const [currentPage, setCurrentPage] = useState(1);

  // Test confirm dialog (Default variant)
  const handleTestDefaultConfirm = async () => {
    const ok = await confirm({
      title: 'Place this order?',
      message:
        'Restaurant: Spice Hub • 2 items • Total: ₹498.00 • Delivery to: 12 MG Road, Ghaziabad.',
      confirmText: 'Yes, place order',
      cancelText: 'Keep editing',
      variant: 'default',
    });

    if (ok) {
      toast.success('Order placed successfully!');
    } else {
      toast('Order placement cancelled', { icon: 'ℹ️' });
    }
  };

  // Test confirm dialog (Danger variant)
  const handleTestDangerConfirm = async () => {
    const ok = await confirm({
      title: 'Cancel this order?',
      message:
        'This order will be cancelled immediately and your payment of ₹498.00 will be refunded to your account.',
      confirmText: 'Yes, cancel order',
      cancelText: 'Keep order',
      variant: 'danger',
    });

    if (ok) {
      toast.error('Order #CB-1049 cancelled and refunded');
    } else {
      toast('Order kept active', { icon: 'ℹ️' });
    }
  };

  const sampleRestaurant = 'Spice Hub';
  const avatarColors = colorFromName(sampleRestaurant);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">
      {/* Page Header */}
      <header className="border-b border-border pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl font-bold text-brand tracking-tight">CampusBite</span>
            <Badge variant="brand">Foundation Showcase</Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text-main">
            Design Tokens & UI Component Demo
          </h1>
          <p className="text-sm text-muted-text mt-1">
            Testing suite for shared UI components, theme tokens, and dialog behaviors.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setLoadingButtons((prev) => !prev)}
            icon={RotateCcw}
          >
            Toggle Loading State ({loadingButtons ? 'ON' : 'OFF'})
          </Button>
        </div>
      </header>

      {/* 1. Modal & Confirmation Dialog Section */}
      <section className="bg-white rounded-xl border border-border p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h2 className="text-lg font-semibold text-text-main">
              1. Modal & Confirmation Dialog (Section 8)
            </h2>
            <p className="text-xs text-muted-text">
              Test backdrop dismissal, Escape key, fade/scale animation, and Promise resolution.
            </p>
          </div>
          <Badge variant="warning">Crucial Requirement</Badge>
        </div>

        <div className="bg-amber-50/70 border border-amber-200 rounded-lg p-3.5 text-xs text-amber-900 leading-relaxed">
          <strong>Testing instructions:</strong> Click either button below. When the dialog opens:
          <ol className="list-decimal list-inside mt-1 space-y-0.5 text-amber-800">
            <li>Click anywhere on the dark backdrop — it must dismiss as <em>Cancel</em>.</li>
            <li>Re-open and press the <kbd className="px-1.5 py-0.5 bg-white border border-amber-300 rounded text-[11px] font-mono">Escape</kbd> key — it must dismiss as <em>Cancel</em>.</li>
            <li>Observe background scroll locking and the fade & scale-in animation.</li>
          </ol>
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <Button
            variant="primary"
            onClick={handleTestDefaultConfirm}
            icon={Sparkles}
          >
            Open Default Confirm Dialog
          </Button>

          <Button
            variant="danger"
            onClick={handleTestDangerConfirm}
            icon={AlertTriangle}
          >
            Open Danger Confirm Dialog
          </Button>
        </div>
      </section>

      {/* 2. Button Variants & Sizes */}
      <section className="bg-white rounded-xl border border-border p-6 shadow-xs space-y-4">
        <h2 className="text-lg font-semibold text-text-main border-b border-border pb-3">
          2. Button Variants & Sizes
        </h2>

        <div className="space-y-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-text">
            Variants
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary" isLoading={loadingButtons}>
              Primary Button
            </Button>
            <Button variant="secondary" isLoading={loadingButtons}>
              Secondary Button
            </Button>
            <Button variant="outline" isLoading={loadingButtons}>
              Outline Button
            </Button>
            <Button variant="danger" isLoading={loadingButtons}>
              Danger Button
            </Button>
            <Button variant="ghost" isLoading={loadingButtons}>
              Ghost Button
            </Button>
            <Button variant="primary" disabled>
              Disabled
            </Button>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-text">
            Sizes
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm" variant="primary">Small (sm)</Button>
            <Button size="md" variant="primary">Medium (md)</Button>
            <Button size="lg" variant="primary">Large (lg)</Button>
          </div>
        </div>
      </section>

      {/* 3. Status Badges & Standard Badges */}
      <section className="bg-white rounded-xl border border-border p-6 shadow-xs space-y-5">
        <h2 className="text-lg font-semibold text-text-main border-b border-border pb-3">
          3. Status Badges (Section 11) & Tags
        </h2>

        <div className="space-y-2.5">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-text">
            Order Statuses
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.values(ORDER_STATUSES).map((status) => (
              <StatusBadge key={status} status={status} type="order" />
            ))}
          </div>
        </div>

        <div className="space-y-2.5">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-text">
            Payment & Return Statuses
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.values(PAYMENT_STATUSES).map((status) => (
              <StatusBadge key={status} status={status} type="payment" />
            ))}
            {Object.values(RETURN_STATUSES).map((status) => (
              <StatusBadge key={status} status={status} type="return" />
            ))}
          </div>
        </div>

        <div className="space-y-2.5 pt-2">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-text">
            Generic Badges
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="brand">Brand Tint</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="danger">Danger</Badge>
            <Badge variant="info">Info</Badge>
            <Badge variant="gray">Default Gray</Badge>
          </div>
        </div>
      </section>

      {/* 4. Form Controls: Input & Select */}
      <section className="bg-white rounded-xl border border-border p-6 shadow-xs space-y-4">
        <h2 className="text-lg font-semibold text-text-main border-b border-border pb-3">
          4. Form Controls (Input & Select)
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Search restaurants"
            placeholder="e.g. Biryani, Pizza, Burger..."
            icon={Search}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            helperText="Search dishes or cuisines"
            maxLength={50}
          />

          <Input
            label="Email address"
            type="email"
            placeholder="asha@example.com"
            icon={Mail}
            value="invalid-email@"
            error="Please enter a valid email address"
            onChange={() => {}}
            required
          />

          <Select
            label="Select cuisine"
            value={selectValue}
            onChange={(e) => setSelectValue(e.target.value)}
            options={[
              { value: 'north-indian', label: 'North Indian' },
              { value: 'south-indian', label: 'South Indian' },
              { value: 'chinese', label: 'Chinese & Pan-Asian' },
              { value: 'desserts', label: 'Desserts & Shakes' },
            ]}
            helperText="Filter restaurants by kitchen cuisine"
          />

          <Select
            label="Order status filter"
            placeholder="Select status..."
            options={Object.keys(ORDER_STATUSES)}
            error="Status is required for this action"
            required
          />
        </div>
      </section>

      {/* 5. StatCards */}
      <section className="bg-white rounded-xl border border-border p-6 shadow-xs space-y-4">
        <h2 className="text-lg font-semibold text-text-main border-b border-border pb-3">
          5. Stat Cards (Dashboard Metrics)
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Orders"
            value="142"
            subtitle="+12% from yesterday"
            icon={ShoppingBag}
          />
          <StatCard
            title="Today's Revenue"
            value={formatCurrency(4890)}
            subtitle="18 orders delivered"
            icon={TrendingUp}
          />
          <StatCard
            title="Pending Returns"
            value="2"
            subtitle="Needs owner approval"
            icon={Clock}
          />
          <StatCard
            title="Average Rating"
            value="4.6 ★"
            subtitle="From 89 customer reviews"
            icon={Star}
          />
        </div>
      </section>

      {/* 6. Tabs & Pagination */}
      <section className="bg-white rounded-xl border border-border p-6 shadow-xs space-y-4">
        <h2 className="text-lg font-semibold text-text-main border-b border-border pb-3">
          6. Tabs & Pagination
        </h2>

        <Tabs
          activeTab={activeTab}
          onChange={setActiveTab}
          tabs={[
            { id: 'orders', label: 'Live Orders', badge: 3 },
            { id: 'menu', label: 'Menu Management', badge: 18 },
            { id: 'returns', label: 'Returns & Refunds', badge: 1 },
          ]}
        />

        <div className="p-4 bg-page rounded-lg text-sm text-muted-text">
          Active tab content:{' '}
          <span className="font-semibold text-text-main capitalize">{activeTab}</span>
        </div>

        <Pagination
          page={currentPage}
          totalPages={8}
          onPageChange={setCurrentPage}
        />
      </section>

      {/* 7. Loaders & Placeholders */}
      <section className="bg-white rounded-xl border border-border p-6 shadow-xs space-y-4">
        <h2 className="text-lg font-semibold text-text-main border-b border-border pb-3">
          7. Spinners & Skeletons
        </h2>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-text font-semibold uppercase">Spinners:</span>
            <Spinner size="sm" className="text-brand" />
            <Spinner size="md" className="text-brand" />
            <Spinner size="lg" className="text-brand" />
          </div>
        </div>

        <div className="p-4 rounded-xl border border-border space-y-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-text">
            Skeleton Card Placeholder
          </div>
          <div className="flex items-center gap-3">
            <Skeleton variant="circular" className="w-12 h-12" />
            <div className="flex-1 space-y-2">
              <Skeleton variant="text" className="w-1/3 h-4" />
              <Skeleton variant="text" className="w-2/3 h-3" />
            </div>
          </div>
          <Skeleton variant="rectangular" className="h-20" />
        </div>
      </section>

      {/* 8. Empty & Error Feedback States */}
      <section className="bg-white rounded-xl border border-border p-6 shadow-xs space-y-6">
        <h2 className="text-lg font-semibold text-text-main border-b border-border pb-3">
          8. Feedback States (Empty & Error)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <EmptyState
            title="Your cart is empty"
            description="Good food is always cooking! Go ahead and add some delicious dishes from your favorite campus restaurant."
            actionText="Explore restaurants"
            onAction={() => toast('Navigate to /restaurants')}
          />

          <ErrorState
            title="Failed to load menu"
            message="Cannot reach the server. Check your connection and try again."
            onRetry={() => toast.success('Retrying menu fetch...')}
          />
        </div>
      </section>

      {/* 9. Format Utils Preview */}
      <section className="bg-white rounded-xl border border-border p-6 shadow-xs space-y-4">
        <h2 className="text-lg font-semibold text-text-main border-b border-border pb-3">
          9. Format Helpers (Section 13)
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div className="p-3 bg-page rounded-lg">
            <div className="text-xs font-semibold text-muted-text">Currency (₹ INR):</div>
            <div className="font-bold text-text-main mt-1">
              formatCurrency("249.00") → {formatCurrency('249.00')}
            </div>
          </div>

          <div className="p-3 bg-page rounded-lg">
            <div className="text-xs font-semibold text-muted-text">Date & Time:</div>
            <div className="font-bold text-text-main mt-1">
              formatDateTime(now) → {formatDateTime(new Date().toISOString())}
            </div>
          </div>

          <div className="p-3 bg-page rounded-lg flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-full ${avatarColors.bg} ${avatarColors.text} font-bold flex items-center justify-center shrink-0`}
            >
              {getInitials(sampleRestaurant)}
            </div>
            <div>
              <div className="text-xs font-semibold text-muted-text">Avatar Color & Initials:</div>
              <div className="font-bold text-text-main">{sampleRestaurant}</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
