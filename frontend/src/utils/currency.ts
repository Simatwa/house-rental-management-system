import { businessService } from '../services/businessService';
import { UtilityName } from '../types/business';

let currencySymbol = 'Ksh';

export const initializeCurrency = async () => {
  try {
    const utilities = await businessService.getAppUtilities(UtilityName.CURRENCY);
    if (utilities.length > 0) {
      currencySymbol = utilities[0].value || 'Ksh';
    }
  } catch (error) {
    console.error('Error fetching currency:', error);
  }
};

export const formatCurrency = (amount: number): string => {
  return `${currencySymbol} ${amount.toLocaleString()}`;
};