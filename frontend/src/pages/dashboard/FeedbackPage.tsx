import React, { useState, useEffect } from 'react';
import { Star, AlertCircle, Edit2, Trash2, X } from 'lucide-react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { coreService } from '../../services/coreService';
import { TenantFeedbackDetails, NewTenantFeedback } from '../../types/core';
import { FeedbackRate } from '../../types/business';
import { formatDate } from '../../utils/date';

export const FeedbackPage: React.FC = () => {
  const [feedback, setFeedback] = useState<TenantFeedbackDetails | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<NewTenantFeedback>({
    message: '',
    rate: FeedbackRate.EXCELLENT
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchFeedback = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await coreService.getFeedback();
      setFeedback(data);
    } catch (err) {
      setError('Failed to fetch feedback');
      console.error('Error fetching feedback:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    try {
      const result = feedback
        ? await coreService.updateFeedback(formData)
        : await coreService.addFeedback(formData);
      setFeedback(result);
      setShowModal(false);
    } catch (err) {
      setFormError('Failed to save feedback');
      console.error('Error saving feedback:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = () => {
    if (feedback) {
      setFormData({
        message: feedback.message,
        rate: feedback.rate
      });
      setShowModal(true);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete your feedback?')) {
      return;
    }

    try {
      await coreService.deleteFeedback();
      setFeedback(null);
    } catch (err) {
      console.error('Error deleting feedback:', err);
    }
  };

  const rateOptions = Object.values(FeedbackRate).map(rate => ({
    value: rate,
    label: rate
  }));

  const renderStars = (rate: FeedbackRate) => {
    const starCount = {
      [FeedbackRate.EXCELLENT]: 5,
      [FeedbackRate.GOOD]: 4,
      [FeedbackRate.AVERAGE]: 3,
      [FeedbackRate.POOR]: 2,
      [FeedbackRate.TERRIBLE]: 1
    }[rate];

    return (
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-5 h-5 ${
              i < starCount ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-900">Feedback</h1>
          
          {!feedback && (
            <Button
              variant="primary"
              onClick={() => setShowModal(true)}
              className="bg-orange-500 hover:bg-orange-600"
            >
              Add Feedback
            </Button>
          )}
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-md flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="text-center py-8 text-gray-500">
            Loading feedback...
          </div>
        ) : feedback ? (
          <Card>
            <CardHeader>
              <CardTitle>Your Feedback</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                {renderStars(feedback.rate)}
                <span className="text-sm text-gray-500">
                  {formatDate(feedback.created_at)}
                </span>
              </div>

              <p className="text-gray-700">{feedback.message}</p>

              {feedback.updated_at !== feedback.created_at && (
                <p className="text-sm text-gray-500">
                  Last updated: {formatDate(feedback.updated_at)}
                </p>
              )}

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={handleEdit}
                  leftIcon={<Edit2 className="w-4 h-4" />}
                >
                  Edit
                </Button>
                <Button
                  variant="danger"
                  onClick={handleDelete}
                  leftIcon={<Trash2 className="w-4 h-4" />}
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="text-center py-8 text-gray-500">
            You haven't provided any feedback yet
          </div>
        )}
      </div>

      {/* Add/Edit Feedback Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg">
            <CardHeader className="relative">
              <CardTitle>{feedback ? 'Edit Feedback' : 'Add Feedback'}</CardTitle>
              <button
                onClick={() => setShowModal(false)}
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
                <Select
                  label="Rating"
                  options={rateOptions}
                  value={formData.rate}
                  onChange={(value) => setFormData({ ...formData, rate: value as FeedbackRate })}
                  fullWidth
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows={4}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>

                <div className="flex gap-2 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={isSubmitting}
                    className="bg-orange-500 hover:bg-orange-600"
                  >
                    {feedback ? 'Update' : 'Submit'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
};