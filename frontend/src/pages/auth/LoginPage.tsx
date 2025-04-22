import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, AlertCircle, Send, Check, X, Mail, User, Lock, Eye, EyeOff } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MainLayout } from '../../components/layout/MainLayout';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { useAuth } from '../../contexts/AuthContext';
import { loginSchema, resetPasswordSchema, passwordRequirements } from '../../utils/validation';
import { accountService } from '../../services/accountService';

type LoginFormData = {
  username: string;
  password: string;
};

type ResetFormData = {
  username: string;
  token: string;
  new_password: string;
  confirm_password: string;
};

export const LoginPage: React.FC = () => {
  const { login, loading, error: authError } = useAuth();
  const navigate = useNavigate();
  const [showResetForm, setShowResetForm] = useState(false);
  const [requestingToken, setRequestingToken] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const {
    register: registerLogin,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });
  
  const {
    register: registerReset,
    handleSubmit: handleResetSubmit,
    formState: { errors: resetErrors },
    watch,
    trigger,
  } = useForm<ResetFormData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onChange',
  });
  
  const username = watch('username');
  const newPassword = watch('new_password');
  
  // Password validation states
  const [validations, setValidations] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });
  
  useEffect(() => {
    if (newPassword) {
      setValidations({
        length: newPassword.length >= 8,
        uppercase: /[A-Z]/.test(newPassword),
        lowercase: /[a-z]/.test(newPassword),
        number: /[0-9]/.test(newPassword),
        special: /[^A-Za-z0-9]/.test(newPassword),
      });
    }
  }, [newPassword]);
  
  const onLogin = async (data: LoginFormData) => {
    try {
      await login(data.username, data.password);
      navigate('/dashboard');
    } catch (err) {
      // Error is handled by the AuthContext
    }
  };
  
  const requestToken = async () => {
    if (!username) {
      setError('Please enter a username or email');
      return;
    }
    
    setRequestingToken(true);
    setError(null);
    
    try {
      await accountService.requestPasswordReset(username);
      setError('Reset token has been sent to your email');
    } catch (err) {
      setError('Failed to send reset token. Please check your username or email');
    } finally {
      setRequestingToken(false);
    }
  };
  
  const onReset = async (data: ResetFormData) => {
    try {
      await accountService.resetPassword({
        username: data.username,
        new_password: data.new_password,
        token: data.token,
      });
      setResetSuccess(true);
      setTimeout(() => {
        setShowResetForm(false);
        setResetSuccess(false);
      }, 3000);
    } catch (err) {
      setError('Failed to reset password. Please check your token and try again');
    }
  };
  
  return (
    <MainLayout>
      <div className="flex justify-center items-center min-h-[calc(100vh-16rem)]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">
              {showResetForm ? 'Reset Password' : 'Login to Your Account'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(error || authError) && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md flex items-start">
                <AlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                <span>{error || authError}</span>
              </div>
            )}
            
            {resetSuccess && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-600 rounded-md flex items-center gap-2">
                <Check className="w-5 h-5" />
                Password reset successful! You can now login with your new password.
              </div>
            )}
            
            {showResetForm ? (
              <form onSubmit={handleResetSubmit(onReset)} className="space-y-4">
                <div className="relative">
                  <Input
                    type="text"
                    label="Username or Email"
                    error={resetErrors.username?.message}
                    {...registerReset('username')}
                    fullWidth
                    leftIcon={username?.includes('@') ? <Mail className="w-5 h-5" /> : <User className="w-5 h-5" />}
                  />
                  {username && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={requestToken}
                      isLoading={requestingToken}
                      className="absolute right-2 top-8 bg-white hover:bg-gray-50"
                    >
                      <Send className="w-4 h-4 text-orange-500" />
                    </Button>
                  )}
                </div>
                
                <Input
                  type="text"
                  label="Reset Token"
                  error={resetErrors.token?.message}
                  {...registerReset('token')}
                  fullWidth
                  placeholder="Enter the token sent to your email"
                />
                
                <div className="relative">
                  <Input
                    type={showNewPassword ? 'text' : 'password'}
                    label="New Password"
                    error={resetErrors.new_password?.message}
                    {...registerReset('new_password', {
                      onChange: () => trigger('confirm_password'),
                    })}
                    fullWidth
                    leftIcon={<Lock className="w-5 h-5" />}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-[2.25rem] text-gray-400 hover:text-gray-600"
                  >
                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                
                {/* Password requirements */}
                <div className="space-y-2 text-sm">
                  {Object.entries(passwordRequirements).map(([key, requirement]) => (
                    <div
                      key={key}
                      className={`flex items-center gap-2 ${
                        validations[key as keyof typeof validations]
                          ? 'text-green-600'
                          : 'text-gray-500'
                      }`}
                    >
                      {validations[key as keyof typeof validations] ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <X className="w-4 h-4" />
                      )}
                      <span>{requirement}</span>
                    </div>
                  ))}
                </div>
                
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    label="Confirm Password"
                    error={resetErrors.confirm_password?.message}
                    {...registerReset('confirm_password')}
                    fullWidth
                    leftIcon={<Lock className="w-5 h-5" />}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-[2.25rem] text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                
                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    fullWidth
                    className="bg-orange-500 hover:bg-orange-600"
                  >
                    Reset Password
                  </Button>
                </div>
                
                <div className="text-center mt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowResetForm(false);
                      setError(null);
                    }}
                    className="text-sm text-orange-600 hover:underline"
                  >
                    Back to login
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleLoginSubmit(onLogin)} className="space-y-4">
                <Input
                  type="text"
                  label="Username or Email"
                  error={loginErrors.username?.message}
                  {...registerLogin('username')}
                  fullWidth
                  autoFocus
                  leftIcon={<User className="w-5 h-5" />}
                />
                
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    label="Password"
                    error={loginErrors.password?.message}
                    {...registerLogin('password')}
                    fullWidth
                    leftIcon={<Lock className="w-5 h-5" />}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-[2.25rem] text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                
                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    fullWidth
                    isLoading={loading}
                    leftIcon={!loading && <LogIn className="w-4 h-4" />}
                    className="bg-orange-500 hover:bg-orange-600"
                  >
                    Login
                  </Button>
                </div>
                
                <div className="text-center mt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowResetForm(true);
                      setError(null);
                    }}
                    className="text-sm text-orange-600 hover:underline"
                  >
                    Forgot your password?
                  </button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};