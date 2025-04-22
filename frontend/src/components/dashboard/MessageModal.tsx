import React from 'react';
import { X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { MessageCategory } from '../../types/core';
import { formatDate } from '../../utils/date';

interface MessageModalProps {
  subject: string;
  content: string;
  category: MessageCategory;
  createdAt: string;
  communityNames?: string[];
  onClose: () => void;
}

export const MessageModal: React.FC<MessageModalProps> = ({
  subject,
  content,
  category,
  createdAt,
  communityNames,
  onClose,
}) => {
  const getCategoryColor = (category: MessageCategory) => {
    switch (category) {
      case MessageCategory.PAYMENT:
        return 'text-green-600 bg-green-50';
      case MessageCategory.MAINTENANCE:
        return 'text-orange-600 bg-orange-50';
      case MessageCategory.WARNING:
        return 'text-red-600 bg-red-50';
      case MessageCategory.PROMOTION:
        return 'text-purple-600 bg-purple-50';
      default:
        return 'text-blue-600 bg-blue-50';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="relative">
          <CardTitle className="pr-8">{subject}</CardTitle>
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-400 hover:text-gray-500"
          >
            <X className="w-6 h-6" />
          </button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(category)}`}>
              {category}
            </span>
            <span className="text-sm text-gray-500">
              {formatDate(createdAt)}
            </span>
          </div>

          <div 
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: content }}
          />

          {communityNames && communityNames.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
              <span className="text-sm text-gray-500">Communities:</span>
              {communityNames.map((name, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                >
                  {name}
                </span>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};