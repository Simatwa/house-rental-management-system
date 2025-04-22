// Business Models
import { BaseModel } from './base';

// Enums
export enum FeedbackRate {
  EXCELLENT = "Excellent",
  GOOD = "Good",
  AVERAGE = "Average",
  POOR = "Poor",
  TERRIBLE = "Terrible"
}

export enum SenderRole {
  OWNER = "Property Owner",
  PROPERTY_MANAGER = "Property Manager",
  TENANT = "Tenant",
  CARETAKER = "Caretaker"
}

export enum UtilityName {
  CURRENCY = "Currency",
  RENT_PAYMENT_START_DATE = "Rent Payment Start Date",
  RENT_PAYMENT_END_DATE = "Rent Payment End Date",
  RENT_PAYMENT_DATE_REMINDER = "Rent Payment Date Reminder"
}

export enum DocumentName {
  TERMS_OF_USE = "Terms of Service",
  POLICY = "Policy"
}

// Models
export interface BusinessAbout extends BaseModel {
  name: string;
  short_name: string;
  details: string;
  slogan: string;
  address: string;
  founded_in: string; // ISO date string
  email?: string;
  phone_number?: string;
  facebook?: string;
  twitter?: string;
  linkedin?: string;
  instagram?: string;
  tiktok?: string;
  youtube?: string;
  logo?: string;
  wallpaper?: string;
}

export interface NewVisitorMessage extends BaseModel {
  sender: string;
  email: string;
  body: string;
}

export interface ShallowUserInfo extends BaseModel {
  username: string;
  first_name?: string;
  last_name?: string;
  profile?: string;
}

export interface UserFeedback extends BaseModel {
  user: ShallowUserInfo;
  sender_role: SenderRole;
  message: string;
  rate: FeedbackRate;
  created_at: string; // ISO date string
}

export interface BusinessGallery extends BaseModel {
  title: string;
  details: string;
  location_name: string;
  youtube_video_link?: string;
  picture?: string;
  date: string; // ISO date string
}

export interface FAQDetails extends BaseModel {
  question: string;
  answer: string;
}

export interface HouseInfo extends BaseModel {
  id: number;
  name: string;
  address: string;
  description: string;
  picture: string;
}

export interface UnitGroupInfo extends BaseModel {
  id: number;
  name: string;
  abbreviated_name: string;
  description: string;
  number_of_units: number;
  number_of_vacant_units: number;
  deposit_amount: number;
  monthly_rent: number;
  picture: string;
}

export interface AppUtilityInfo extends BaseModel {
  name: UtilityName;
  description: string;
  value: string;
}

export interface DocumentInfo extends BaseModel {
  name: string;
  content: string;
  updated_at: string; // ISO date string
}