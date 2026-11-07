import { Link } from 'react-router-dom';
import { Zap, UtensilsCrossed, Clock, ShieldCheck } from 'lucide-react';

/**
 * AuthLayout Component
 * Reusable split layout for authentication pages (Login and Register).
 * Handles responsive layout:
 * - Desktop: 2-column card layout.
 * - iPad/Tablet: Left panel highlights distribute into 2 columns.
 * - Mobile: Left panel is hidden and a compact logo header sits directly above the form.
 */

const DEFAULT_HIGHLIGHTS = [
  {
    icon: Zap,
    title: 'Fast campus delivery',
    description: 'Direct to your hostel, library, or department.',
  },
  {
    icon: UtensilsCrossed,
    title: 'Top campus kitchens',
    description: 'Daily canteen specials, fresh meals & snacks.',
  },
  {
    icon: Clock,
    title: 'Order status tracking',
    description: 'Follow your order from kitchen to doorstep.',
    wideOnTablet: true,
  },
];

export default function AuthLayout({
  title,
  subtitle,
  alert,
  footer,
  children,
  highlights = DEFAULT_HIGHLIGHTS,
}) {
  return (
    <div className="min-h-screen bg-page flex items-center justify-center p-2.5 sm:p-4 lg:p-6">
      <div className="w-full max-w-5xl bg-white rounded-2xl sm:rounded-3xl border border-border shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Left Side: Brand Story & Highlights (Hidden on mobile, 2-cols on iPad/tablet, stacked sidebar on PC) */}
        <div className="hidden md:flex lg:col-span-5 bg-gradient-to-br from-brand-tint/70 via-orange-50/40 to-white p-5 sm:p-7 lg:py-6 lg:px-8 flex-col justify-between border-b lg:border-b-0 lg:border-r border-border text-left">
          <div>
            {/* Logo */}
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-xl sm:text-2xl font-extrabold text-brand tracking-tight mb-4 lg:mb-6"
            >
              <span className="w-8 h-8 rounded-xl bg-brand text-white flex items-center justify-center text-base font-black shadow-sm">
                CB
              </span>
              <span>CampusBite</span>
            </Link>

            <h2 className="text-xl sm:text-2xl font-bold text-text-main tracking-tight leading-snug">
              Craving something delicious on campus?
            </h2>
            <p className="text-xs sm:text-sm text-muted-text mt-1.5 leading-relaxed">
              Order fresh meals and snacks from top campus canteens delivered right to your study spot.
            </p>

            {/* Feature highlights: 2 columns on iPad (md), 1 column on desktop (lg) */}
            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-2.5">
              {highlights.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={idx}
                    className={`flex items-start gap-2.5 p-2 rounded-xl bg-white/70 border border-border/70 shadow-2xs ${
                      item.wideOnTablet ? 'md:col-span-2 lg:col-span-1' : ''
                    }`}
                  >
                    <div className="p-1.5 rounded-lg bg-white border border-border/80 text-brand shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="text-xs">
                      <span className="font-semibold text-text-main block">
                        {item.title}
                      </span>
                      <span className="text-muted-text text-[11px]">
                        {item.description}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-5 pt-3.5 border-t border-border/60">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-muted-text">
              <ShieldCheck className="w-3.5 h-3.5 text-brand shrink-0" />
              100% verified campus accounts & role-based routing
            </span>
          </div>
        </div>

        {/* Right Side: Form Content */}
        <div className="lg:col-span-7 p-4 sm:p-6 lg:py-5 lg:px-8 text-left flex flex-col justify-center">
          {/* Mobile Only: Compact Logo header */}
          <div className="flex md:hidden items-center justify-center gap-2 mb-3">
            <span className="w-7 h-7 rounded-lg bg-brand text-white flex items-center justify-center text-xs font-black shadow-sm">
              CB
            </span>
            <span className="text-lg font-bold text-brand tracking-tight">CampusBite</span>
          </div>

          <div className="mb-3">
            <h1 className="text-xl sm:text-2xl font-bold text-text-main tracking-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs text-muted-text mt-0.5">{subtitle}</p>
            )}
          </div>

          {alert}

          {children}

          {footer}
        </div>
      </div>
    </div>
  );
}
