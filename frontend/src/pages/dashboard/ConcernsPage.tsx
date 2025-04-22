import React, { useState, useEffect } from 'react';
import { Plus, AlertCircle, Clock, X, Edit2, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { coreService } from '../../services/coreService';
import { ConcernStatus, ShallowConcernDetails, ConcernDetails, NewConcern } from '../../types/core';
import { formatDate } from '../../utils/date';

export const ConcernsPage: React.FC = () => {
  const [concerns, setConcerns] = useState<ShallowConcernDetails[]>([]);
  const [selectedConcern, setSelectedConcern] = useState<ConcernDetails | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<ConcernStatus | ''>('');
  const [expandedResponseId, setExpandedResponseId] = useState<number | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    about: '',
    details: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchConcerns = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await coreService.getConcerns(filterStatus || undefined);
      setConcerns(data);
    } catch (err) {
      setError('Failed to fetch concerns');
      console.error('Error fetching concerns:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConcerns();
  }, [filterStatus]);

  const handleViewDetails = async (id: number) => {
    try {
      const details = await coreService.getConcernDetails(id);
      setSelectedConcern(details);
    } catch (err) {
      console.error('Error fetching concern details:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    try {
      if (selectedConcern) {
        await coreService.updateConcern(selectedConcern.id, formData);
        const updatedConcerns = await coreService.getConcerns(filterStatus || undefined);
        setConcerns(updatedConcerns);
        const updatedDetails = await coreService.getConcernDetails(selectedConcern.id);
        setSelectedConcern(updatedDetails);
      } else {
        const newConcern = await coreService.addConcern(formData as NewConcern);
        setConcerns(concerns => [newConcern, ...concerns]);
      }
      setShowEditModal(false);
      setFormData({ about: '', details: '' });
    } catch (err) {
      setFormError('Failed to save concern');
      console.error('Error saving concern:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (id: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      const concern = await coreService.getConcernDetails(id);
      setFormData({
        about: concern.about,
        details: concern.details
      });
      setSelectedConcern(concern);
      setShowEditModal(true);
    } catch (err) {
      console.error('Error fetching concern details:', err);
    }
  };

  const handleDelete = async () => {
    if (!selectedConcern) return;

    try {
      await coreService.deleteConcern(selectedConcern.id);
      const updatedConcerns = await coreService.getConcerns(filterStatus || undefined);
      setConcerns(updatedConcerns);
      setSelectedConcern(null);
      setShowDeleteModal(false);
    } catch (err) {
      console.error('Error deleting concern:', err);
    }
  };

  const handleDeleteClick = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    handleViewDetails(id).then(() => setShowDeleteModal(true));
  };

  const handleToggleResponse = (id: number) => {
    setExpandedResponseId(expandedResponseId === id ? null : id);
  };

  const canEdit = (status: ConcernStatus) => {
    return ![ConcernStatus.RESOLVED, ConcernStatus.CLOSED].includes(status);
  };

  const getStatusColor = (status: ConcernStatus) => {
    switch (status) {
      case ConcernStatus.OPEN:
        return 'text-red-600 bg-red-50';
      case ConcernStatus.IN_PROGRESS:
        return 'text-orange-600 bg-orange-50';
      case ConcernStatus.RESOLVED:
        return 'text-green-600 bg-green-50';
      case ConcernStatus.CLOSED:
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const statusOptions = Object.values(ConcernStatus).map(status => ({
    value: status,
    label: status.replace(/_/g, ' ')
  }));

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="sticky top-0 bg-gray-100 z-10 pb-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-900">Concerns</h1>
            
            <div className="flex items-center gap-2">
              <Select
                options={[
                  { value: '', label: 'All Statuses' },
                  ...statusOptions
                ]}
                value={filterStatus}
                onChange={(value) => setFilterStatus(value as ConcernStatus | '')}
              />
              
              <Button
                variant="primary"
                onClick={() => {
                  setFormData({ about: '', details: '' });
                  setSelectedConcern(null);
                  setShowEditModal(true);
                }}
                leftIcon={<Plus className="w-4 h-4" />}
                className="bg-orange-500 hover:bg-orange-600"
              >
                New Concern
              </Button>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-md flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Concerns List */}
          <div className="lg:col-span-2">
            {loading ? (
              <div className="text-center py-8 text-gray-500">
                Loading concerns...
              </div>
            ) : concerns.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No concerns found
              </div>
            ) : (
              <div className="space-y-4">
                {concerns.map((concern) => (
                  <Card
                    key={concern.id}
                    className={`cursor-pointer transition-shadow hover:shadow-md ${
                      selectedConcern?.id === concern.id ? 'ring-2 ring-orange-500' : ''
                    }`}
                    onClick={() => handleViewDetails(concern.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(concern.status)}`}>
                            {concern.status.replace(/_/g, ' ')}
                          </span>
                          <h3 className="text-lg font-semibold mt-2">{concern.about}</h3>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">
                            {formatDate(concern.created_at)}
                          </span>
                          {canEdit(concern.status) && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => handleEdit(concern.id, e)}
                              leftIcon={<Edit2 className="w-4 h-4" />}
                            >
                              Edit
                            </Button>
                          )}
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={(e) => handleDeleteClick(concern.id, e)}
                            leftIcon={<Trash2 className="w-4 h-4" />}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Concern Details */}
          <div className="lg:col-span-1">
            {selectedConcern ? (
              <Card>
                <CardHeader>
                  <CardTitle>Concern Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedConcern.status)}`}>
                      {selectedConcern.status.replace(/_/g, ' ')}
                    </span>
                    <h3 className="text-lg font-semibold mt-2">{selectedConcern.about}</h3>
                  </div>

                  <div className="prose prose-sm max-w-none">
                    <p>{selectedConcern.details}</p>
                  </div>

                  {selectedConcern.response && (
                    <div>
                      <button
                        onClick={() => handleToggleResponse(selectedConcern.id)}
                        className="text-orange-600 hover:text-orange-700 text-sm font-medium flex items-center gap-1"
                      >
                        {expandedResponseId === selectedConcern.id ? (
                          <>Show less <ChevronUp className="w-4 h-4" /></>
                        ) : (
                          <>Show more <ChevronDown className="w-4 h-4" /></>
                        )}
                      </button>
                      
                      {expandedResponseId === selectedConcern.id && (
                        <div className="mt-2 bg-gray-50 p-4 rounded-md">
                          <h4 className="font-medium mb-2">Response</h4>
                          <p className="text-sm text-gray-600">{selectedConcern.response}</p>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>Created: {formatDate(selectedConcern.created_at)}</span>
                    </div>
                    {selectedConcern.updated_at !== selectedConcern.created_at && (
                      <div>Updated: {formatDate(selectedConcern.updated_at)}</div>
                    )}
                  </div>

                  <div className="flex gap-2 pt-4">
                    {canEdit(selectedConcern.status) && (
                      <Button
                        variant="outline"
                        onClick={() => handleEdit(selectedConcern.id)}
                        leftIcon={<Edit2 className="w-4 h-4" />}
                      >
                        Edit
                      </Button>
                    )}
                    <Button
                      variant="danger"
                      onClick={() => setShowDeleteModal(true)}
                      leftIcon={<Trash2 className="w-4 h-4" />}
                    >
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Select a concern to view details
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg">
            <CardHeader className="relative">
              <CardTitle>{selectedConcern ? 'Edit Concern' : 'New Concern'}</CardTitle>
              <button
                onClick={() => setShowEditModal(false)}
                className="absolute right-4 top-4 text-gray-400 hover:text-gray-500"
              >
                <X className="w-6 h-6" />
              </button>
            </CardHeader>
            <CardContent>
              {formError && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md">
                  {formError}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Subject"
                  value={formData.about}
                  onChange={(e) => setFormData({ ...formData, about: e.target.value })}
                  required
                  fullWidth
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Details
                  </label>
                  <textarea
                    value={formData.details}
                    onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                    rows={4}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>

                <div className="flex gap-2 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowEditModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={isSubmitting}
                    className="bg-orange-500 hover:bg-orange-600"
                  >
                    {selectedConcern ? 'Update' : 'Submit'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Delete Concern</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this concern? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  onClick={handleDelete}
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
};