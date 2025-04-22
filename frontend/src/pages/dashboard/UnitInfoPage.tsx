import React, { useState, useEffect } from 'react';
import { Building, MapPin, Users, Coins, Shield, Phone, Mail, AlertCircle, Home, Globe } from 'lucide-react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { coreService } from '../../services/coreService';
import { UnitInfo, HouseInfoPrivate } from '../../types/core';
import { formatCurrency } from '../../utils/currency';

export const UnitInfoPage: React.FC = () => {
  const [unitInfo, setUnitInfo] = useState<UnitInfo | null>(null);
  const [houseInfo, setHouseInfo] = useState<HouseInfoPrivate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInfo = async () => {
      setLoading(true);
      setError(null);
      try {
        const [unit, house] = await Promise.all([
          coreService.getUnitInfo(),
          coreService.getHouseInfo()
        ]);
        setUnitInfo(unit);
        setHouseInfo(house);
      } catch (err) {
        setError('Failed to fetch information');
        console.error('Error fetching info:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchInfo();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center py-8 text-gray-500">
          Loading information...
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="p-4 bg-red-50 text-red-600 rounded-md flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      </DashboardLayout>
    );
  }

  if (!unitInfo || !houseInfo) {
    return (
      <DashboardLayout>
        <div className="text-center py-8 text-gray-500">
          No information available
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Property Information</h1>

        <div className="grid grid-cols-1 gap-6">
          {/* House Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5 text-orange-500" />
                House Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-32 h-32 rounded-lg overflow-hidden">
                  <img
                    src={houseInfo.picture}
                    alt={houseInfo.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {houseInfo.name}
                  </h2>
                  <p className="flex items-center gap-2 text-gray-600 mt-1">
                    <MapPin className="w-4 h-4" />
                    {houseInfo.address}
                  </p>
                  <div 
                    className="mt-2 prose prose-sm"
                    dangerouslySetInnerHTML={{ __html: houseInfo.description }}
                  />
                </div>
              </div>

              {/* House Office */}
              {houseInfo.office && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">Office Information</h3>
                  <div className="space-y-2">
                    <p className="text-gray-600">{houseInfo.office.name}</p>
                    <p className="text-gray-600">{houseInfo.office.description}</p>
                    <div className="flex flex-wrap gap-4">
                      {houseInfo.office.contact_number && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone className="w-4 h-4" />
                          {houseInfo.office.contact_number}
                        </div>
                      )}
                      {houseInfo.office.email && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Mail className="w-4 h-4" />
                          {houseInfo.office.email}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* House Communities */}
              {houseInfo.communities.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-blue-500" />
                    House Communities
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {houseInfo.communities.map((community, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900">{community.name}</h4>
                        <p className="text-gray-600 text-sm mt-1">{community.description}</p>
                        {community.social_media_link && (
                          <a
                            href={community.social_media_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 text-sm mt-2"
                          >
                            <Globe className="w-4 h-4" />
                            Join Community
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Unit Group Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="w-5 h-5 text-green-500" />
                Unit Group Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-24 h-24 rounded-lg overflow-hidden">
                  <img
                    src={unitInfo.unit_group.picture}
                    alt={unitInfo.unit_group.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {unitInfo.unit_group.name}
                  </h2>
                  <p className="text-gray-500">{unitInfo.unit_group.abbreviated_name}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                  <Coins className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Monthly Rent</p>
                    <p className="text-gray-900">
                      {formatCurrency(unitInfo.unit_group.monthly_rent)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-purple-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Deposit</p>
                    <p className="text-gray-900">
                      {formatCurrency(unitInfo.unit_group.deposit_amount)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-orange-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Caretakers</p>
                    <p className="text-gray-900">{unitInfo.unit_group.caretakers.length}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <p className="text-gray-600">{unitInfo.unit_group.description}</p>
              </div>

              {/* Unit Group Communities */}
              {houseInfo.communities.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-blue-500" />
                    Available Communities
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {houseInfo.communities.map((community, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900">{community.name}</h4>
                        <p className="text-gray-600 text-sm mt-1">{community.description}</p>
                        {community.social_media_link && (
                          <Button
                            as="a"
                            href={community.social_media_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            variant="outline"
                            size="sm"
                            className="mt-2"
                            leftIcon={<Globe className="w-4 h-4" />}
                          >
                            Join Community
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Caretakers */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Caretakers</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {unitInfo.unit_group.caretakers.map((caretaker, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-4 rounded-lg bg-gray-50"
                    >
                      <Avatar
                        src={caretaker.profile}
                        name={`${caretaker.first_name} ${caretaker.last_name}`}
                        size="lg"
                      />
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {caretaker.first_name} {caretaker.last_name}
                        </h4>

                        {caretaker.phone_number && (
                          <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                            <Phone className="w-4 h-4" />
                            <span>{caretaker.phone_number}</span>
                          </div>
                        )}

                        {caretaker.email && (
                          <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                            <Mail className="w-4 h-4" />
                            <span>{caretaker.email}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Unit Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5 text-blue-500" />
                Your Unit Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {unitInfo.name}
                    </h2>
                    <p className="text-gray-500">{unitInfo.abbreviated_name}</p>
                  </div>
                  <Badge
                    variant={
                      unitInfo.occupied_status === 'Occupied'
                        ? 'success'
                        : unitInfo.occupied_status === 'Vacant'
                        ? 'warning'
                        : 'danger'
                    }
                  >
                    {unitInfo.occupied_status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};