// Business API Service
import { apiRequest } from './api';
import {
  AppUtilityInfo,
  BusinessAbout,
  BusinessGallery,
  DocumentInfo,
  DocumentName,
  FAQDetails,
  HouseInfo,
  NewVisitorMessage,
  ProcessFeedback,
  UnitGroupInfo,
  UserFeedback,
  UtilityName
} from '../types/business';

const BUSINESS_BASE = '/business';

export const businessService = {
  async getBusinessInfo(): Promise<BusinessAbout> {
    return apiRequest<BusinessAbout>(`${BUSINESS_BASE}/about`);
  },
  
  async getHouses(): Promise<HouseInfo[]> {
    return apiRequest<HouseInfo[]>(`${BUSINESS_BASE}/houses`);
  },
  
  async getUnitGroups(houseId: number): Promise<UnitGroupInfo[]> {
    return apiRequest<UnitGroupInfo[]>(`${BUSINESS_BASE}/unit-goup/${houseId}`);
  },
  
  async sendVisitorMessage(message: NewVisitorMessage): Promise<ProcessFeedback> {
    return apiRequest<ProcessFeedback>(`${BUSINESS_BASE}/visitor-message`, {
      method: 'POST',
      body: message,
    });
  },
  
  async getGalleries(): Promise<BusinessGallery[]> {
    return apiRequest<BusinessGallery[]>(`${BUSINESS_BASE}/galleries`);
  },
  
  async getFeedbacks(): Promise<UserFeedback[]> {
    return apiRequest<UserFeedback[]>(`${BUSINESS_BASE}/feedbacks`);
  },
  
  async getFAQs(): Promise<FAQDetails[]> {
    return apiRequest<FAQDetails[]>(`${BUSINESS_BASE}/faqs`);
  },
  
  async getDocument(name: DocumentName): Promise<DocumentInfo> {
    return apiRequest<DocumentInfo>(`${BUSINESS_BASE}/document?name=${name}`);
  },
  
  async getAppUtilities(name?: UtilityName): Promise<AppUtilityInfo[]> {
    let url = `${BUSINESS_BASE}/app/utilities`;
    
    if (name) {
      url += `?name=${name}`;
    }
    
    return apiRequest<AppUtilityInfo[]>(url);
  },
};