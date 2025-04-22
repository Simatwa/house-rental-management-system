import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save, Wallet, X, Phone, CreditCard, AlertCircle, CheckCircle, Banknote } from 'lucide-react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { accountService } from '../../services/accountService';
import { EditablePersonalData, PaymentAccountDetails } from '../../types/account';
import { formatCurrency } from '../../utils/currency';

const QUICK_AMOUNTS = [500, 1000, 2000, 5000, 10000];

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showMpesaModal, setShowMpesaModal] = useState(false);
  const [showOtherPayments, setShowOtherPayments] = useState(false);
  const [mpesaAmount, setMpesaAmount] = useState('');
  const [phoneNumber, setPhoneNumber] = useState(user?.phone_number || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [mpesaDetails, setMpesaDetails] = useState<PaymentAccountDetails | null>(null);
  const [otherPayments, setOtherPayments] = useState<PaymentAccountDetails[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<EditablePersonalData>({
    defaultValues: {
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      occupation: user?.occupation || '',
      phone_number: user?.phone_number || '',
      emergency_contact_number: user?.emergency_contact_number || '',
      email: user?.email || ''
    }
  });

  React.useEffect(() => {
    const fetchPaymentDetails = async () => {
      try {
        const [mpesa, others] = await Promise.all([
          accountService.getMpesaPaymentDetails(),
          accountService.getOtherPaymentDetails()
        ]);
        setMpesaDetails(mpesa);
        setOtherPayments(others);
      } catch (err) {
        console.error('Error fetching payment details:', err);
      }
    };
    fetchPaymentDetails();
  }, []);

  const onSubmit = async (data: EditablePersonalData) => {
    try {
      setIsSubmitting(true);
      await accountService.updateUserProfile(data);
      setIsEditing(false);
    } catch (err) {
      setError('Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMpesaPayment = async () => {
    if (!mpesaAmount || !phoneNumber) {
      setError('Please enter amount and phone number');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      setSuccess(null);
      await accountService.sendMpesaPopup({
        phone_number: phoneNumber,
        amount: parseFloat(mpesaAmount)
      });
      setSuccess('M-PESA payment request sent successfully. Please check your phone for the payment prompt.');
      setTimeout(() => {
        setShowMpesaModal(false);
        setMpesaAmount('');
        setSuccess(null);
      }, 3000);
    } catch (err) {
      setError('Failed to initiate M-PESA payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Profile</h1>
          <Button
            variant="primary"
            onClick={() => {
              if (isEditing) {
                reset();
              }
              setIsEditing(!isEditing);
            }}
            className="bg-orange-500 hover:bg-orange-600"
          >
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Personal Information */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="First Name"
                      disabled={!isEditing}
                      error={errors.first_name?.message}
                      {...register('first_name')}
                    />
                    <Input
                      label="Last Name"
                      disabled={!isEditing}
                      error={errors.last_name?.message}
                      {...register('last_name')}
                    />
                  </div>

                  <Input
                    label="Occupation"
                    disabled={!isEditing}
                    error={errors.occupation?.message}
                    {...register('occupation')}
                  />

                  <Input
                    label="Email"
                    type="email"
                    disabled={!isEditing}
                    error={errors.email?.message}
                    {...register('email')}
                  />

                  <Input
                    label="Phone Number"
                    disabled={!isEditing}
                    error={errors.phone_number?.message}
                    {...register('phone_number')}
                  />

                  <Input
                    label="Emergency Contact"
                    disabled={!isEditing}
                    error={errors.emergency_contact_number?.message}
                    {...register('emergency_contact_number')}
                  />

                  {isEditing && (
                    <Button
                      type="submit"
                      variant="primary"
                      isLoading={isSubmitting}
                      leftIcon={<Save className="w-4 h-4" />}
                      className="bg-orange-500 hover:bg-orange-600"
                    >
                      Save Changes
                    </Button>
                  )}
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Account Balance */}
          <Card>
            <CardHeader>
              <CardTitle>Account Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                  {formatCurrency(user?.account_balance || 0)}
                </p>
                <Button
                  variant="primary"
                  fullWidth
                  onClick={() => setShowMpesaModal(true)}
                  leftIcon={<Wallet className="w-4 h-4" />}
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  Add Money
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* M-PESA Payment Modal */}
      {showMpesaModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="relative">
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-orange-500" />
                Add Money via M-PESA
              </CardTitle>
              <button
                onClick={() => setShowMpesaModal(false)}
                className="absolute right-4 top-4 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/50 text-red-600 dark:text-red-400 rounded-md flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/50 text-green-600 dark:text-green-400 rounded-md flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 flex-shrink-0" />
                  <span>{success}</span>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Quick Amount
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {QUICK_AMOUNTS.map((amount) => (
                      <button
                        key={amount}
                        type="button"
                        onClick={() => setMpesaAmount(amount.toString())}
                        className={`p-2 text-sm rounded-md border transition-colors ${
                          mpesaAmount === amount.toString()
                            ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300'
                            : 'border-gray-200 dark:border-gray-700 hover:border-orange-200 dark:hover:border-orange-800 hover:bg-orange-50 dark:hover:bg-orange-900/20'
                        }`}
                      >
                        {formatCurrency(amount)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Banknote className="w-5 h-5 text-gray-400" />
                  <Input
                    label="Amount"
                    type="number"
                    value={mpesaAmount}
                    onChange={(e) => setMpesaAmount(e.target.value)}
                    fullWidth
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <Input
                    label="Phone Number"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    fullWidth
                  />
                </div>

                {mpesaDetails && (
                  <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-4 rounded-md space-y-2">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      <span>Paybill: {mpesaDetails.paybill_number}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Wallet className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      <span>Account: {mpesaDetails.account_number}</span>
                    </div>
                    {mpesaDetails.details && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{mpesaDetails.details}</p>
                    )}
                  </div>
                )}

                <div className="flex flex-col gap-3">
                  <Button
                    variant="primary"
                    fullWidth
                    onClick={handleMpesaPayment}
                    isLoading={isSubmitting}
                    className="bg-orange-500 hover:bg-orange-600"
                    leftIcon={<CreditCard className="w-4 h-4" />}
                  >
                    Pay with M-PESA
                  </Button>

                  <button
                    onClick={() => setShowOtherPayments(!showOtherPayments)}
                    className="text-sm text-orange-600 dark:text-orange-400 hover:underline text-center"
                  >
                    {showOtherPayments ? 'Hide' : 'Show'} other payment methods
                  </button>
                </div>

                {showOtherPayments && otherPayments.length > 0 && (
                  <div className="mt-4 space-y-3">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">Other Payment Methods</h4>
                    {otherPayments.map((payment, index) => (
                      <div key={index} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md space-y-2">
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                          <p className="font-medium text-gray-900 dark:text-gray-100">{payment.name}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Wallet className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                          <p className="text-sm text-gray-600 dark:text-gray-400">Account: {payment.account_number}</p>
                        </div>
                        {payment.details && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">{payment.details}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
};