import React, { useState, useEffect } from 'react';
import { MessageSquare, Users, Globe, Check, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { coreService } from '../../services/coreService';
import { PersonalMessageInfo, GroupMessageInfo, CommunityMessageInfo, MessageCategory } from '../../types/core';
import { formatDate } from '../../utils/date';

type MessageType = 'personal' | 'group' | 'community';

export const MessagesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<MessageType>('personal');
  const [personalMessages, setPersonalMessages] = useState<PersonalMessageInfo[]>([]);
  const [groupMessages, setGroupMessages] = useState<GroupMessageInfo[]>([]);
  const [communityMessages, setCommunityMessages] = useState<CommunityMessageInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilter, setShowFilter] = useState(false);
  const [filterRead, setFilterRead] = useState<boolean | undefined>(undefined);
  const [filterCategory, setFilterCategory] = useState<MessageCategory | ''>('');
  const [expandedMessageId, setExpandedMessageId] = useState<number | null>(null);

  const fetchMessages = async () => {
    setLoading(true);
    setError(null);
    try {
      const [personal, group, community] = await Promise.all([
        coreService.getPersonalMessages(filterRead, filterCategory || undefined),
        coreService.getGroupMessages(filterRead, filterCategory || undefined),
        coreService.getCommunityMessages(filterRead, filterCategory || undefined)
      ]);
      setPersonalMessages(personal);
      setGroupMessages(group);
      setCommunityMessages(community);
    } catch (err) {
      setError('Failed to fetch messages');
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [filterRead, filterCategory]);

  const handleMarkAsRead = async (type: MessageType, id: number) => {
    try {
      switch (type) {
        case 'personal':
          await coreService.markPersonalMessageAsRead(id);
          setPersonalMessages(messages =>
            messages.map(msg =>
              msg.id === id ? { ...msg, is_read: true } : msg
            )
          );
          break;
        case 'group':
          await coreService.markGroupMessageAsRead(id);
          setGroupMessages(messages =>
            messages.map(msg =>
              msg.id === id ? { ...msg, is_read: true } : msg
            )
          );
          break;
        case 'community':
          await coreService.markCommunityMessageAsRead(id);
          setCommunityMessages(messages =>
            messages.map(msg =>
              msg.id === id ? { ...msg, is_read: true } : msg
            )
          );
          break;
      }
    } catch (err) {
      console.error('Error marking message as read:', err);
    }
  };

  const handleShowMore = async (type: MessageType, message: PersonalMessageInfo | GroupMessageInfo | CommunityMessageInfo) => {
    if (expandedMessageId === message.id) {
      setExpandedMessageId(null);
      return;
    }

    setExpandedMessageId(message.id);

    if (!message.is_read) {
      await handleMarkAsRead(type, message.id);
    }
  };

  const getCategoryColor = (category: MessageCategory) => {
    switch (category) {
      case MessageCategory.PAYMENT:
        return 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/50';
      case MessageCategory.MAINTENANCE:
        return 'text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-900/50';
      case MessageCategory.WARNING:
        return 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/50';
      case MessageCategory.PROMOTION:
        return 'text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-900/50';
      default:
        return 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/50';
    }
  };

  const renderMessages = (type: MessageType) => {
    const messages = type === 'personal' 
      ? personalMessages 
      : type === 'group' 
        ? groupMessages 
        : communityMessages;

    if (loading) {
      return (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          Loading messages...
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-8 text-red-600 dark:text-red-400">
          {error}
        </div>
      );
    }

    if (messages.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No messages found
        </div>
      );
    }

    return messages.map((message) => (
      <Card
        key={message.id}
        className={`mb-4 ${!message.is_read ? 'bg-orange-50 dark:bg-orange-900/20' : 'bg-white dark:bg-gray-800'}`}
      >
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(message.category)}`}>
                {message.category}
              </span>
              <h3 className="text-lg font-semibold mt-2 text-gray-900 dark:text-gray-100">{message.subject}</h3>
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {formatDate(message.created_at)}
            </span>
          </div>

          <div className="relative">
            <div 
              className={`prose prose-sm dark:prose-invert max-w-none ${
                expandedMessageId === message.id ? '' : 'line-clamp-3'
              }`}
              dangerouslySetInnerHTML={{ __html: message.content }}
            />
            <button
              onClick={() => handleShowMore(type, message)}
              className="text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 text-sm font-medium mt-2 flex items-center gap-1"
            >
              {expandedMessageId === message.id ? (
                <>Show less <ChevronUp className="w-4 h-4" /></>
              ) : (
                <>Show more <ChevronDown className="w-4 h-4" /></>
              )}
            </button>
          </div>

          {'community_names' in message && message.community_names.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {message.community_names.map((name, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                >
                  {name}
                </span>
              ))}
            </div>
          )}

          {!message.is_read && (
            <div className="mt-4 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleMarkAsRead(type, message.id)}
                leftIcon={<Check className="w-4 h-4" />}
              >
                Mark as Read
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    ));
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="sticky top-0 bg-gray-100 dark:bg-gray-900 z-10 pb-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Messages</h1>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilter(!showFilter)}
                leftIcon={<Filter className="w-4 h-4" />}
              >
                Filter
              </Button>
              {showFilter && (
                <div className="flex gap-2">
                  <Select
                    options={[
                      { value: '', label: 'All Messages' },
                      { value: 'true', label: 'Read' },
                      { value: 'false', label: 'Unread' }
                    ]}
                    value={filterRead?.toString() ?? ''}
                    onChange={(value) => setFilterRead(value ? value === 'true' : undefined)}
                  />
                  <Select
                    options={[
                      { value: '', label: 'All Categories' },
                      ...Object.values(MessageCategory).map(category => ({
                        value: category,
                        label: category
                      }))
                    ]}
                    value={filterCategory}
                    onChange={(value) => setFilterCategory(value as MessageCategory | '')}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex border-b border-gray-200 dark:border-gray-700 mt-4">
            <button
              className={`flex items-center gap-2 px-4 py-2 border-b-2 font-medium ${
                activeTab === 'personal'
                  ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
              onClick={() => setActiveTab('personal')}
            >
              <MessageSquare className="w-5 h-5" />
              Personal
            </button>
            <button
              className={`flex items-center gap-2 px-4 py-2 border-b-2 font-medium ${
                activeTab === 'group'
                  ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
              onClick={() => setActiveTab('group')}
            >
              <Users className="w-5 h-5" />
              Group
            </button>
            <button
              className={`flex items-center gap-2 px-4 py-2 border-b-2 font-medium ${
                activeTab === 'community'
                  ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
              onClick={() => setActiveTab('community')}
            >
              <Globe className="w-5 h-5" />
              Community
            </button>
          </div>
        </div>

        <div className="mt-6">
          {renderMessages(activeTab)}
        </div>
      </div>
    </DashboardLayout>
  );
};