import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Send, AlertCircle, CheckCircle } from 'lucide-react';
import { MainLayout } from '../../components/layout/MainLayout';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { accountService } from '../../services/accountService';

export const ForgotPasswordPage: React.FC = () => {
  const [identity, setIdentity] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!identity) {
      setError('Please enter your username or email address');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      await accountService.requestPasswordReset(identity);
      setSuccess(true);
    } catch (err) {
      setError('Failed to send reset instructions. Please try again.');
      console.error('Password reset error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <MainLayout>
      <div className="flex justify-center items-center min-h-[calc(100vh-16rem)]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Reset Password</CardTitle>
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
                    <p className="font-medium">Password reset instructions sent!</p>
                    <p className="mt-1 text-sm">
                      We've sent instructions to reset your password. Please check your email.
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
                    Enter your username or email address, and we'll send you instructions to reset your password.
                  </p>
                  
                  <Input
                    type="text"
                    label="Username or Email"
                    value={identity}
                    onChange={(e) => setIdentity(e.target.value)}
                    fullWidth
                    autoFocus
                    placeholder="Enter username or email"
                  />
                  
                  <div className="pt-2">
                    <Button
                      type="submit"
                      variant="primary"
                      fullWidth
                      isLoading={isSubmitting}
                      leftIcon={!isSubmitting && <Send className="w-4 h-4" />}
                    >
                      Send Reset Instructions
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