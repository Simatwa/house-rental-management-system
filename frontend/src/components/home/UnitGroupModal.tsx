import React from 'react';
import { UnitGroupInfo } from '../../types/business';
import { X, Home, Users, Coins, Shield } from 'lucide-react';
import { Button } from '../ui/Button';
import { formatCurrency } from '../../utils/currency';

interface UnitGroupModalProps {
  unitGroup: UnitGroupInfo;
  onClose: () => void;
}

export const UnitGroupModal: React.FC<UnitGroupModalProps> = ({
  unitGroup,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div className="fixed inset-0 bg-black/30 backdrop-filter backdrop-blur-sm transition-opacity" onClick={onClose} />
        
        <div className="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg max-h-[90vh]">
          <div className="absolute right-4 top-4">
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="bg-white dark:bg-gray-800 px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                <div className="relative h-48 -mx-4 -mt-5 sm:-mx-6">
                  <img
                    src={unitGroup.picture}
                    alt={unitGroup.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <h3 className="text-xl font-semibold text-white">
                      {unitGroup.name}
                    </h3>
                    <p className="text-gray-200 text-sm">
                      {unitGroup.abbreviated_name}
                    </p>
                  </div>
                </div>
                
                <div className="mt-6 overflow-y-auto max-h-[40vh] pr-2">
                  <div 
                    className="text-gray-600 dark:text-gray-300 prose dark:prose-invert"
                    dangerouslySetInnerHTML={{ __html: unitGroup.description }}
                  />
                  
                  <div className="mt-6 grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Home className="w-5 h-5 text-orange-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Units</p>
                        <p className="text-gray-900 dark:text-gray-100">{unitGroup.number_of_units}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-green-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Vacant Units</p>
                        <p className="text-gray-900 dark:text-gray-100">{unitGroup.number_of_vacant_units}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Coins className="w-5 h-5 text-blue-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Monthly Rent</p>
                        <p className="text-gray-900 dark:text-gray-100">{formatCurrency(unitGroup.monthly_rent)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-purple-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Deposit</p>
                        <p className="text-gray-900 dark:text-gray-100">{formatCurrency(unitGroup.deposit_amount)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
            <Button
              variant="primary"
              className="w-full sm:w-auto sm:ml-3 bg-orange-500 hover:bg-orange-600"
              onClick={onClose}
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};