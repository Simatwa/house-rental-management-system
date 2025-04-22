import { useEffect, useState } from 'react';
import { BusinessAbout } from '../types/business';
import { businessService } from '../services/businessService';

export const useBusinessInfo = () => {
  const [businessInfo, setBusinessInfo] = useState<BusinessAbout | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchBusinessInfo = async () => {
      try {
        const info = await businessService.getBusinessInfo();
        setBusinessInfo(info);
      } catch (err) {
        setError('Failed to fetch business information');
        console.error('Error fetching business info:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBusinessInfo();
  }, []);
  
  return { businessInfo, loading, error };
};