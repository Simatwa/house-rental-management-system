import { useState, useEffect } from 'react';
import { HouseInfo, UnitGroupInfo } from '../types/business';

interface SearchResult {
  houses: HouseInfo[];
  unitGroups: Record<number, UnitGroupInfo[]>;
}

export const useSearch = (
  initialHouses: HouseInfo[],
  initialUnitGroups: Record<number, UnitGroupInfo[]>,
  searchTerm: string
): SearchResult => {
  const [filteredResults, setFilteredResults] = useState<SearchResult>({
    houses: initialHouses,
    unitGroups: initialUnitGroups,
  });

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredResults({ houses: initialHouses, unitGroups: initialUnitGroups });
      return;
    }

    const term = searchTerm.toLowerCase();
    
    // Filter houses
    const matchedHouses = initialHouses.filter(house => 
      house.name.toLowerCase().includes(term)
    );

    // Filter unit groups
    const matchedUnitGroups: Record<number, UnitGroupInfo[]> = {};
    Object.entries(initialUnitGroups).forEach(([houseId, groups]) => {
      const filteredGroups = groups.filter(group =>
        group.name.toLowerCase().includes(term) ||
        group.abbreviated_name.toLowerCase().includes(term)
      );
      
      if (filteredGroups.length > 0) {
        matchedUnitGroups[parseInt(houseId)] = filteredGroups;
      }
    });

    setFilteredResults({
      houses: matchedHouses,
      unitGroups: matchedUnitGroups,
    });
  }, [searchTerm, initialHouses, initialUnitGroups]);

  return filteredResults;
};