import React from 'react';
import { HouseInfo, UnitGroupInfo } from '../../types/business';
import { Card } from '../ui/Card';
import { MapPin, Home, Users, DollarSign } from 'lucide-react';
import { Button } from '../ui/Button';
import { formatCurrency } from '../../utils/currency';

interface PropertyCardProps {
  house: HouseInfo;
  unitGroups: UnitGroupInfo[];
  onViewUnits: () => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  house,
  unitGroups,
  onViewUnits,
}) => {
  const totalUnits = unitGroups.reduce((acc, group) => acc + group.number_of_units, 0);
  const vacantUnits = unitGroups.reduce((acc, group) => acc + group.number_of_vacant_units, 0);
  const minRent = Math.min(...unitGroups.map(group => group.monthly_rent));
  const maxRent = Math.max(...unitGroups.map(group => group.monthly_rent));
  
  return (
    <Card className="overflow-hidden group hover:shadow-xl transition-all">
      <div className="relative h-64">
        <img
          src={house.picture}
          alt={house.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-xl font-semibold text-white">{house.name}</h3>
          <p className="text-gray-200 flex items-center gap-2">
            <MapPin className="w-4 h-4" /> {house.address}
          </p>
        </div>
      </div>
      
      <div className="p-4 space-y-4">
        <div 
          className="text-gray-600 prose"
          dangerouslySetInnerHTML={{ __html: house.description }}
        />
        
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center text-orange-500 mb-1">
              <Home className="w-5 h-5" />
            </div>
            <p className="text-sm font-medium">{totalUnits} Units</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center text-green-500 mb-1">
              <Users className="w-5 h-5" />
            </div>
            <p className="text-sm font-medium">{vacantUnits} Vacant</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center text-blue-500 mb-1">
              <DollarSign className="w-5 h-5" />
            </div>
            <p className="text-sm font-medium">
              {minRent === maxRent
                ? formatCurrency(minRent)
                : `${formatCurrency(minRent)} - ${formatCurrency(maxRent)}`}
            </p>
          </div>
        </div>
        
        <Button
          variant="primary"
          fullWidth
          onClick={onViewUnits}
          className="bg-orange-500 hover:bg-orange-600"
        >
          View Available Units
        </Button>
      </div>
    </Card>
  );
};