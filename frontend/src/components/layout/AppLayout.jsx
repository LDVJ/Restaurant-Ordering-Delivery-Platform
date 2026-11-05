import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

/**
 * AppLayout Component
 * Standard layout wrapper for authenticated role pages.
 * Sourced from Section 4 & 12 of Frontend Guide.
 */
export default function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-page text-text-main">
      <Navbar />
      <main className="flex-1 w-full max-w-[1100px] mx-auto px-4 py-6 sm:py-8">
        <Outlet />
      </main>
    </div>
  );
}
