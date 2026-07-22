import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import SignUp from './page/SignUp';
import SignIn from './page/SignIn';
import MainDB from './page/MainDashboard';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/dashboard" element={<MainDB />} />
        <Route path="*" element={<Navigate to="/signup" replace />} />
      </Routes>
    </BrowserRouter>
  );
}