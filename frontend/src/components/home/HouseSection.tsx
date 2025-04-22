import React, { useState } from 'react';
import { HouseInfo, UnitGroupInfo } from '../../types/business';
import { UnitGroupModal } from './UnitGroupModal';
import { Button } from '../ui/Button';
import { formatCurrency } from '../../utils/currency';
import { MapPin, Home, Users, Coins } from 'lucide-react';

interface HouseSectionProps {
  houses: HouseInfo[];
  unitGroups: Record<number, UnitGroupInfo[]>;
}

export const HouseSection: React.FC<HouseSectionProps> = ({ houses, unitGroups }) => {
  const [selectedUnitGroup, setSelectedUnitGroup] = useState<UnitGroupInfo | null>(null);

  return (
    <div>
      {houses.map((house) => (
        <div key={house.id} className="mb-24 last:mb-0" id={`house-${house.id}`}>
          {/* House Header */}
          <div 
            className="relative h-96 bg-cover bg-center rounded-xl overflow-hidden"
            style={{ backgroundImage: `url(${house.picture})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            <div className="absolute inset-0 flex items-center">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <div className="max-w-3xl">
                  <h2 className="text-4xl font-bold text-white mb-4">{house.name}</h2>
                  <p className="text-xl text-gray-200 flex items-center gap-2">
                    <MapPin className="w-6 h-6" /> {house.address}
                  </p>
                  <div 
                    className="mt-4 text-gray-200 prose prose-invert"
                    dangerouslySetInnerHTML={{ __html: house.description }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Unit Groups */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {(unitGroups[house.id] || []).map((unitGroup) => (
                <div
                  key={unitGroup.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden transform hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="relative h-48">
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

                  <div className="p-4">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <Home className="w-5 h-5 text-orange-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Units</p>
                          <p className="text-gray-900 dark:text-gray-200">{unitGroup.number_of_units}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-green-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Vacant</p>
                          <p className="text-gray-900 dark:text-gray-200">{unitGroup.number_of_vacant_units}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Coins className="w-5 h-5 text-blue-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Monthly Rent</p>
                          <p className="text-gray-900 dark:text-gray-200">
                            {formatCurrency(unitGroup.monthly_rent)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <Button
                      variant="primary"
                      fullWidth
                      onClick={() => setSelectedUnitGroup(unitGroup)}
                      className="bg-orange-500 hover:bg-orange-600"
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}

      {/* Unit Group Modal */}
      {selectedUnitGroup && (
        <UnitGroupModal
          unitGroup={selectedUnitGroup}
          onClose={() => setSelectedUnitGroup(null)}
        />
      )}
    </div>
  );
};