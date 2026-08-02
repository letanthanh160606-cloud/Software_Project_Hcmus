import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import SignUp from './page/SignUp';
import SignIn from './page/SignIn';
import MainDB from './page/MainDashboard';

// PublicRoute: Prevents logged-in users from seeing SignUp/SignIn
const PublicRoute = ({ children }) => {
  const token = localStorage.getItem('token'); // Check your auth state
  return token ? <Navigate to="/dashboard" replace /> : children;
};

// ProtectedRoute: Prevents logged-out users from accessing Dashboard
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/signin" replace />;
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

        {/* Dashboard wrapped in ProtectedRoute */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <MainDB />
            </ProtectedRoute>
          } 
        />

        {/* Catch-all: Redirects to dashboard if logged in, or signin if not */}
        <Route 
          path="*" 
          element={
            localStorage.getItem('token') 
              ? <Navigate to="/dashboard" replace /> 
              : <Navigate to="/signin" replace />
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}