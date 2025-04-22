// Account API Service
import { apiRequest } from './api';
import {
  EditablePersonalData,
  PaymentAccountDetails,
  ProcessFeedback,
  ResetPassword,
  SendMPESAPopupTo,
  TokenAuth,
  TransactionInfo,
  TransactionMeans,
  TransactionType,
  UserProfile
} from '../types/account';

const ACCOUNT_BASE = '/account';

export const accountService = {
  // Auth
  async login(username: string, password: string): Promise<TokenAuth> {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);
    formData.append('grant_type', 'password');
    
    const response = await fetch(`/api/v1${ACCOUNT_BASE}/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Invalid credentials');
    }
    
    const data = await response.json();
    
    // Login to Django after getting the token
    const djangoResponse = await fetch(`/d/user/login?token=${data.access_token}`);
    const djangoData = await djangoResponse.json();
    
    if (!djangoResponse.ok) {
      throw new Error(djangoData.detail || 'Failed to authenticate with Django');
    }
    
    localStorage.setItem('access_token', data.access_token);
    return data;
  },
  
  async requestPasswordReset(identity: string): Promise<ProcessFeedback> {
    return apiRequest<ProcessFeedback>(`${ACCOUNT_BASE}/password/send-reset-token?identity=${identity}`);
  },
  
  async resetPassword(data: ResetPassword): Promise<ProcessFeedback> {
    return apiRequest<ProcessFeedback>(`${ACCOUNT_BASE}/password/reset`, {
      method: 'POST',
      body: data,
    });
  },
  
  async getUserProfile(): Promise<UserProfile> {
    return apiRequest<UserProfile>(`${ACCOUNT_BASE}/profile`);
  },
  
  async updateUserProfile(data: EditablePersonalData): Promise<EditablePersonalData> {
    return apiRequest<EditablePersonalData>(`${ACCOUNT_BASE}/profile`, {
      method: 'PATCH',
      body: data,
    });
  },
  
  async checkUsernameExists(username: string): Promise<ProcessFeedback> {
    return apiRequest<ProcessFeedback>(`${ACCOUNT_BASE}/exists?username=${username}`);
  },
  
  async getTransactions(means?: TransactionMeans, type?: TransactionType): Promise<TransactionInfo[]> {
    let url = `${ACCOUNT_BASE}/transactions`;
    const params = new URLSearchParams();
    
    if (means) params.append('means', means);
    if (type) params.append('type', type);
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    return apiRequest<TransactionInfo[]>(url);
  },
  
  async getMpesaPaymentDetails(): Promise<PaymentAccountDetails> {
    return apiRequest<PaymentAccountDetails>(`${ACCOUNT_BASE}/mpesa-payment-account-details`);
  },
  
  async getOtherPaymentDetails(): Promise<PaymentAccountDetails[]> {
    return apiRequest<PaymentAccountDetails[]>(`${ACCOUNT_BASE}/other-payment-account-details`);
  },
  
  async sendMpesaPopup(data: SendMPESAPopupTo): Promise<ProcessFeedback> {
    return apiRequest<ProcessFeedback>(`${ACCOUNT_BASE}/send-mpesa-payment-popup`, {
      method: 'POST',
      body: data,
    });
  },
};