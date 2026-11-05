import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ConfirmProvider } from './context/ConfirmContext';
import UiDemoPage from './pages/UiDemoPage';

/**
 * CampusBite App Root
 * Sets up routing, ConfirmProvider, and Toast notifications
 */
export default function App() {
  return (
    <BrowserRouter>
      <ConfirmProvider>
        {/* Global Toast Provider with Custom Styling */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              background: '#FFFFFF',
              color: '#1C1C1C',
              border: '1px solid #E5E7EB',
              borderRadius: '0.75rem',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
              fontFamily: 'inherit',
              fontSize: '0.875rem',
              fontWeight: 500,
            },
            success: {
              iconTheme: {
                primary: '#16A34A',
                secondary: '#FFFFFF',
              },
            },
            error: {
              iconTheme: {
                primary: '#DC2626',
                secondary: '#FFFFFF',
              },
            },
          }}
        />

        <div className="min-h-screen bg-page text-text-main font-sans">
          <Routes>
            {/* Temporary UI Demo Route for testing components & dialogs */}
            <Route path="/ui-demo" element={<UiDemoPage />} />

            {/* Redirect root to UI demo during foundation phase */}
            <Route path="/" element={<Navigate to="/ui-demo" replace />} />
            <Route path="*" element={<Navigate to="/ui-demo" replace />} />
          </Routes>
        </div>
      </ConfirmProvider>
    </BrowserRouter>
  );
}
