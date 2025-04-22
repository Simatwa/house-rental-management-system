import { apiRequest } from './api';
import {
  CommunityMessageInfo,
  ConcernDetails,
  ConcernStatus,
  GroupMessageInfo,
  HouseInfoPrivate,
  MessageCategory,
  NewConcern,
  NewTenantFeedback,
  PersonalMessageInfo,
  ProcessFeedback,
  ShallowConcernDetails,
  TenantFeedbackDetails,
  UnitInfo,
  UpdateConcern
} from '../types/core';

const CORE_BASE = '/core';

export const coreService = {
  async getHouseInfo(): Promise<HouseInfoPrivate> {
    return apiRequest<HouseInfoPrivate>(`${CORE_BASE}/house`);
  },
  
  async getUnitInfo(): Promise<UnitInfo> {
    return apiRequest<UnitInfo>(`${CORE_BASE}/unit`);
  },
  
  // Messages
  async getPersonalMessages(isRead?: boolean, category?: MessageCategory): Promise<PersonalMessageInfo[]> {
    let url = `${CORE_BASE}/personal/messages`;
    const params = new URLSearchParams();
    
    if (isRead !== undefined) {
      params.append('is_read', isRead.toString());
    }
    if (category) {
      params.append('category', category);
    }
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    return apiRequest<PersonalMessageInfo[]>(url);
  },
  
  async markPersonalMessageAsRead(id: number): Promise<ProcessFeedback> {
    return apiRequest<ProcessFeedback>(`${CORE_BASE}/personal/message/mark-read/${id}`, {
      method: 'PATCH',
    });
  },
  
  async getGroupMessages(isRead?: boolean, category?: MessageCategory): Promise<GroupMessageInfo[]> {
    let url = `${CORE_BASE}/group/messages`;
    const params = new URLSearchParams();
    
    if (isRead !== undefined) {
      params.append('is_read', isRead.toString());
    }
    if (category) {
      params.append('category', category);
    }
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    return apiRequest<GroupMessageInfo[]>(url);
  },
  
  async markGroupMessageAsRead(id: number): Promise<ProcessFeedback> {
    return apiRequest<ProcessFeedback>(`${CORE_BASE}/group/message/mark-read/${id}`, {
      method: 'PATCH',
    });
  },
  
  async getCommunityMessages(isRead?: boolean, category?: MessageCategory): Promise<CommunityMessageInfo[]> {
    let url = `${CORE_BASE}/community/messages`;
    const params = new URLSearchParams();
    
    if (isRead !== undefined) {
      params.append('is_read', isRead.toString());
    }
    if (category) {
      params.append('category', category);
    }
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    return apiRequest<CommunityMessageInfo[]>(url);
  },
  
  async markCommunityMessageAsRead(id: number): Promise<ProcessFeedback> {
    return apiRequest<ProcessFeedback>(`${CORE_BASE}/community/message/mark-read/${id}`, {
      method: 'PATCH',
    });
  },
  
  // Concerns
  async getConcerns(status?: ConcernStatus): Promise<ShallowConcernDetails[]> {
    let url = `${CORE_BASE}/concerns`;
    
    if (status) {
      url += `?status=${status}`;
    }
    
    return apiRequest<ShallowConcernDetails[]>(url);
  },
  
  async addConcern(concern: NewConcern): Promise<ConcernDetails> {
    return apiRequest<ConcernDetails>(`${CORE_BASE}/concern/new`, {
      method: 'POST',
      body: concern,
    });
  },
  
  async updateConcern(id: number, concern: UpdateConcern): Promise<ConcernDetails> {
    return apiRequest<ConcernDetails>(`${CORE_BASE}/concern/${id}`, {
      method: 'PATCH',
      body: concern,
    });
  },
  
  async getConcernDetails(id: number): Promise<ConcernDetails> {
    return apiRequest<ConcernDetails>(`${CORE_BASE}/concern/${id}`);
  },
  
  async deleteConcern(id: number): Promise<ProcessFeedback> {
    return apiRequest<ProcessFeedback>(`${CORE_BASE}/concern/${id}`, {
      method: 'DELETE',
    });
  },
  
  // Feedback
  async addFeedback(feedback: NewTenantFeedback): Promise<TenantFeedbackDetails> {
    return apiRequest<TenantFeedbackDetails>(`${CORE_BASE}/feedback`, {
      method: 'POST',
      body: feedback,
    });
  },
  
  async updateFeedback(feedback: NewTenantFeedback): Promise<TenantFeedbackDetails> {
    return apiRequest<TenantFeedbackDetails>(`${CORE_BASE}/feedback`, {
      method: 'PATCH',
      body: feedback,
    });
  },
  
  async getFeedback(): Promise<TenantFeedbackDetails> {
    return apiRequest<TenantFeedbackDetails>(`${CORE_BASE}/feedback`);
  },
  
  async deleteFeedback(): Promise<ProcessFeedback> {
    return apiRequest<ProcessFeedback>(`${CORE_BASE}/feedback`, {
      method: 'DELETE',
    });
  },
};