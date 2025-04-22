import React from 'react';
import { UserFeedback } from '../../types/business';
import { Card } from '../ui/Card';
import { Avatar } from '../ui/Avatar';
import { Star } from 'lucide-react';
import { formatDate } from '../../utils/date';

interface TestimonialCardProps {
  feedback: UserFeedback;
}

const rateToStars = (rate: string) => {
  switch (rate) {
    case 'Excellent':
      return 5;
    case 'Good':
      return 4;
    case 'Average':
      return 3;
    case 'Poor':
      return 2;
    case 'Terrible':
      return 1;
    default:
      return 0;
  }
};

export const TestimonialCard: React.FC<TestimonialCardProps> = ({ feedback }) => {
  const stars = rateToStars(feedback.rate);
  
  return (
    <Card className="p-6 relative transition-all duration-300 hover:-translate-y-2 hover:shadow-lg">
      <div className="absolute top-6 right-6 text-sm text-gray-400">
        {formatDate(feedback.created_at)}
      </div>
      
      <div className="flex items-start gap-4">
        <Avatar
          src={feedback.user.profile}
          name={`${feedback.user.first_name} ${feedback.user.last_name}`}
          size="lg"
        />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">
                {feedback.user.first_name} {feedback.user.last_name}
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">{feedback.sender_role}</p>
            </div>
          </div>
          <div className="flex gap-1 mt-2">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 transition-colors ${
                  i < stars ? 'text-yellow-400 fill-current' : 'text-gray-300 dark:text-gray-600'
                }`}
              />
            ))}
          </div>
          <p className="mt-3 text-gray-600 dark:text-gray-300">{feedback.message}</p>
        </div>
      </div>
    </Card>
  );
};