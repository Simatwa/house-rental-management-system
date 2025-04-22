import React from 'react';
import { X, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { ConcernDetails, ConcernStatus } from '../../types/core';
import { formatDate } from '../../utils/date';

interface ConcernModalProps {
  concern: ConcernDetails;
  onClose: () => void;
}

export const ConcernModal: React.FC<ConcernModalProps> = ({
  concern,
  onClose,
}) => {
  const getStatusColor = (status: ConcernStatus) => {
    switch (status) {
      case ConcernStatus.OPEN:
        return 'text-red-600 bg-red-50 dark:bg-red-900/50';
      case ConcernStatus.IN_PROGRESS:
        return 'text-orange-600 bg-orange-50 dark:bg-orange-900/50';
      case ConcernStatus.RESOLVED:
        return 'text-green-600 bg-green-50 dark:bg-green-900/50';
      case ConcernStatus.CLOSED:
        return 'text-gray-600 bg-gray-50 dark:bg-gray-700';
      default:
        return 'text-gray-600 bg-gray-50 dark:bg-gray-700';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <CardHeader className="relative">
          <CardTitle className="pr-8">{concern.about}</CardTitle>
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </CardHeader>
        <CardContent className="space-y-4 overflow-y-auto flex-1">
          <div className="flex items-center justify-between">
            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(concern.status)}`}>
              {concern.status.replace(/_/g, ' ')}
            </span>
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Clock className="w-4 h-4" />
              <span>{formatDate(concern.created_at)}</span>
            </div>
          </div>

          <div className="formatted-content">
            <h3 className="text-lg font-medium">Details</h3>
            <p>{concern.details}</p>
          </div>

          {concern.response && (
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
              <h3 className="text-lg font-medium mb-2">Response</h3>
              <div 
                className="formatted-content"
                dangerouslySetInnerHTML={{ __html: concern.response }}
              />
            </div>
          )}

          {concern.updated_at !== concern.created_at && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Last updated: {formatDate(concern.updated_at)}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};