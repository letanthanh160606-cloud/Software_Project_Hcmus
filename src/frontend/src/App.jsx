import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import SignUp from './page/SignUp';
import SignIn from './page/SignIn';
import MainDB from './page/MainDashboard';
import PendingPage from './page/PendingPage';

// PublicRoute: Prevents logged-in users from seeing SignUp/SignIn
const PublicRoute = ({ children }) => {
  const token = localStorage.getItem('access_token'); // Check your auth state
  return token ? <Navigate to="/dashboard" replace /> : children;
};

// ProtectedRoute: Prevents logged-out users from accessing Dashboard
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('access_token');
  return token ? children : <Navigate to="/signin" replace />;
};

/**
 * PendingRoute: Intercepts business members who are still pending approval.
 *
 * Detection: A pending member has account_type === 'business' AND role === 'individual'.
 * This happens because derive_role() on the backend returns 'individual' when no active
 * membership or manager role exists — which is exactly the case for pending members.
 * If pending, render <PendingPage /> instead of the normal children.
 */
const PendingRoute = ({ children }) => {
  const raw = localStorage.getItem('user');
  if (raw) {
    try {
      const user = JSON.parse(raw);
      if (user?.account_type === 'business' && user?.role === 'individual') {
        return <PendingPage />;
      }
    } catch (_) { /* ignore parse errors */ }
  }
  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <Toaster 
        position="top-right" 
        toastOptions={{
          duration: 3500,
          style: {
            fontFamily: 'Satoshi, system-ui, sans-serif',
            fontSize: '14px',
            borderRadius: '12px',
            background: '#2d2d2d',
            color: '#fff',
          },
        }} 
      />
      <Routes>
        {/* Auth Pages wrapped in PublicRoute */}
        <Route 
          path="/signup" 
          element={
            <PublicRoute>
              <SignUp />
            </PublicRoute>
          } 
        />
        <Route 
          path="/signin" 
          element={
            <PublicRoute>
              <SignIn />
            </PublicRoute>
          } 
        />

        {/* Dashboard wrapped in ProtectedRoute + PendingRoute */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <PendingRoute>
                <MainDB />
              </PendingRoute>
            </ProtectedRoute>
          } 
        />

        {/* Catch-all: Redirects to dashboard if logged in, or signin if not */}
        <Route 
          path="*" 
          element={
            localStorage.getItem('access_token') 
              ? <Navigate to="/dashboard" replace /> 
              : <Navigate to="/signin" replace />
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}