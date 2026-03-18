import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WifiOff } from 'lucide-react';

// Pages (will be created in next steps)
import AuthPage from './pages/AuthPage';
import Layout from './components/Layout';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import CustomersPage from './pages/CustomersPage';
import CreateInvoicePage from './pages/CreateInvoicePage';
import InvoiceListPage from './pages/InvoiceListPage';
import InvoicePreviewPage from './pages/InvoicePreviewPage';

// Offline Detector Component
const OfflineDetector = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-red-600 text-white px-4 py-2 flex items-center justify-center gap-2 animate-in slide-in-from-top duration-300">
      <WifiOff className="w-4 h-4" />
      <span className="text-sm font-medium">You are currently offline. Some features may be limited.</span>
    </div>
  );
};

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, loading, isAdmin } = useAuth();
  
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (requireAdmin && !isAdmin) return <Navigate to="/" replace />;
  
  return children;
};

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <>
      <OfflineDetector />
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <AuthPage />} />
        
        <Route element={<Layout />}>
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <UserDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin" 
            element={<ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>} 
          />
          <Route 
            path="/customers" 
            element={<ProtectedRoute><CustomersPage /></ProtectedRoute>} 
          />
          <Route 
            path="/invoices" 
            element={<ProtectedRoute><InvoiceListPage /></ProtectedRoute>} 
          />
          <Route 
            path="/create-invoice" 
            element={<ProtectedRoute><CreateInvoicePage /></ProtectedRoute>} 
          />
          <Route path="/invoice/:id" element={<InvoicePreviewPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
