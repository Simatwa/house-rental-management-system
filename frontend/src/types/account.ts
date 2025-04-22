// Account Models
import { BaseModel } from './base';

// Enums
export enum UserGender {
  MALE = "M",
  FEMALE = "F",
  OTHER = "O"
}

export enum TransactionMeans {
  CASH = "Cash",
  MPESA = "M-PESA",
  BANK = "Bank",
  OTHER = "Other"
}

export enum TransactionType {
  DEPOSIT = "Deposit",
  WITHDRAWAL = "Withdrawal",
  RENT_PAYMENT = "Rent Payment",
  FEE_PAYMENT = "Fee Payment"
}

// Models
export interface TokenAuth extends BaseModel {
  access_token: string;
  token_type: string;
}

export interface ResetPassword extends BaseModel {
  username: string;
  new_password: string;
  token: string;
}

export interface EditablePersonalData extends BaseModel {
  first_name?: string;
  last_name?: string;
  occupation?: string;
  phone_number?: string;
  emergency_contact_number?: string;
  email?: string;
}

export interface UserProfile extends EditablePersonalData {
  username: string;
  gender: UserGender;
  account_balance: number;
  profile?: string;
  is_staff?: boolean;
  date_joined: string; // ISO date string
}

export interface TransactionInfo extends BaseModel {
  type: TransactionType;
  amount: number;
  means: TransactionMeans;
  reference: string;
  notes?: string;
  created_at: string; // ISO date string
}

export interface PaymentAccountDetails extends BaseModel {
  name: string;
  paybill_number: string;
  account_number: string;
  details?: string;
}

export interface SendMPESAPopupTo extends BaseModel {
  phone_number: string;
  amount: number;
}

export interface ProcessFeedback extends BaseModel {
  detail: any;
}