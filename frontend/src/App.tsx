import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { HomePage } from './pages/home/HomePage';
import { LoginPage } from './pages/auth/LoginPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { ProfilePage } from './pages/dashboard/ProfilePage';
import { MessagesPage } from './pages/dashboard/MessagesPage';
import { ConcernsPage } from './pages/dashboard/ConcernsPage';
import { FeedbackPage } from './pages/dashboard/FeedbackPage';
import { UnitInfoPage } from './pages/dashboard/UnitInfoPage';
import { TransactionsPage } from './pages/dashboard/TransactionsPage';
import { PrivateRoute } from './components/auth/PrivateRoute';
import { initializeCurrency } from './utils/currency';

function App() {
  useEffect(() => {
    initializeCurrency();
  }, []);

  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            
            {/* Protected Routes */}
            <Route path="/dashboard" element={<PrivateRoute />}>
              <Route index element={<DashboardPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="messages" element={<MessagesPage />} />
              <Route path="concerns" element={<ConcernsPage />} />
              <Route path="feedback" element={<FeedbackPage />} />
              <Route path="unit-info" element={<UnitInfoPage />} />
              <Route path="transactions" element={<TransactionsPage />} />
            </Route>
            
            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;