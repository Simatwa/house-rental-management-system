import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Key, AlertCircle, CheckCircle } from 'lucide-react';
import { MainLayout } from '../../components/layout/MainLayout';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { accountService } from '../../services/accountService';

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const token = searchParams.get('token') || '';
  const username = searchParams.get('username') || '';
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const validate = () => {
    if (!newPassword) {
      setError('New password is required');
      return false;
    }
    
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    if (!token || !username) {
      setError('Invalid reset link. Please request a new password reset.');
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      await accountService.resetPassword({
        username,
        new_password: newPassword,
        token,
      });
      
      setSuccess(true);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError('Failed to reset password. The link may have expired.');
      console.error('Password reset error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!token || !username) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center min-h-[calc(100vh-16rem)]">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-center">Invalid Reset Link</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-md flex items-start">
                  <AlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Invalid password reset link</p>
                    <p className="mt-1">
                      The link you followed is invalid or has expired. Please request a new password reset.
                    </p>
                  </div>
                </div>
                
                <div className="text-center mt-4">
                  <Link
                    to="/forgot-password"
                    className="text-blue-600 hover:underline font-medium"
                  >
                    Request new password reset
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <div className="flex justify-center items-center min-h-[calc(100vh-16rem)]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Set New Password</CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md flex items-start">
                <AlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
            
            {success ? (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 text-green-600 rounded-md flex items-start">
                  <CheckCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Password reset successful!</p>
                    <p className="mt-1 text-sm">
                      Your password has been reset. You will be redirected to the login page shortly.
                    </p>
                  </div>
                </div>
                
                <div className="text-center mt-4">
                  <Link
                    to="/login"
                    className="text-blue-600 hover:underline font-medium"
                  >
                    Return to login
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <p className="text-gray-600 mb-4">
                    Please enter a new password for your account.
                  </p>
                  
                  <Input
                    type="password"
                    label="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    fullWidth
                    autoFocus
                  />
                  
                  <Input
                    type="password"
                    label="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    fullWidth
                  />
                  
                  <div className="pt-2">
                    <Button
                      type="submit"
                      variant="primary"
                      fullWidth
                      isLoading={isSubmitting}
                      leftIcon={!isSubmitting && <Key className="w-4 h-4" />}
                    >
                      Reset Password
                    </Button>
                  </div>
                  
                  <div className="text-center mt-4">
                    <Link
                      to="/login"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Back to login
                    </Link>
                  </div>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};