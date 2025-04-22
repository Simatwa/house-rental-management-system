// Core Models
import { BaseModel } from './base';
import { FeedbackRate } from './business';

// Enums
export enum OccupiedStatus {
  OCCUPIED = "Occupied",
  VACANT = "Vacant",
  CLOSED = "Closed"
}

export enum MessageCategory {
  GENERAL = "General",
  PAYMENT = "Payment",
  MAINTENANCE = "Maintenance",
  PROMOTION = "Promotion",
  WARNING = "Warning",
  OTHER = "Other"
}

export enum ConcernStatus {
  OPEN = "Open",
  IN_PROGRESS = "In Progress",
  RESOLVED = "Resolved",
  CLOSED = "Closed"
}

// Models
export interface Caretaker extends BaseModel {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone_number?: string;
  profile: string;
}

export interface UnitGroupInfoPrivate extends BaseModel {
  id: number;
  name: string;
  abbreviated_name: string;
  description: string;
  deposit_amount: number;
  monthly_rent: number;
  picture: string;
  caretakers: Caretaker[];
}

export interface UnitInfo extends BaseModel {
  id: number;
  name: string;
  abbreviated_name: string;
  occupied_status: OccupiedStatus;
  unit_group: UnitGroupInfoPrivate;
}

export interface CommunityInfo extends BaseModel {
  name: string;
  description: string;
  social_media_link: string;
  created_at: string; // ISO date string
}

export interface HouseOffice extends BaseModel {
  name: string;
  description: string;
  address: string;
  contact_number?: string;
  email?: string;
}

export interface HouseInfoPrivate extends BaseModel {
  id: number;
  name: string;
  address: string;
  description: string;
  picture: string;
  communities: CommunityInfo[];
  office?: HouseOffice;
}

export interface PersonalMessageInfo extends BaseModel {
  id: number;
  category: MessageCategory;
  subject: string;
  content: string;
  created_at: string; // ISO date string
  is_read: boolean;
}

export interface GroupMessageInfo extends PersonalMessageInfo {}

export interface CommunityMessageInfo extends PersonalMessageInfo {
  community_names: string[];
}

export interface NewConcern extends BaseModel {
  about: string;
  details: string;
}

export interface ShallowConcernDetails extends BaseModel {
  id: number;
  about: string;
  status: ConcernStatus;
  created_at: string; // ISO date string
}

export interface ConcernDetails extends ShallowConcernDetails {
  details: string;
  response?: string;
  updated_at: string; // ISO date string
}

export interface UpdateConcern extends BaseModel {
  about?: string;
  details?: string;
}

export interface NewTenantFeedback extends BaseModel {
  message: string;
  rate: FeedbackRate;
}

export interface TenantFeedbackDetails extends NewTenantFeedback {
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
}