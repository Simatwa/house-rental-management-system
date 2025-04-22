import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Building,
  Calendar,
  MessageSquare,
  Users,
  Globe,
  Wrench,
  Star,
  Wallet,
  Clock,
  ArrowUpRight,
  ArrowDownLeft
} from 'lucide-react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { coreService } from '../../services/coreService';
import { accountService } from '../../services/accountService';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/date';
import { PersonalMessageInfo, GroupMessageInfo, CommunityMessageInfo, ShallowConcernDetails, TenantFeedbackDetails, UnitInfo } from '../../types/core';
import { TransactionInfo, TransactionType } from '../../types/account';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Dashboard data
  const [unitInfo, setUnitInfo] = useState<UnitInfo | null>(null);
  const [personalMessages, setPersonalMessages] = useState<PersonalMessageInfo[]>([]);
  const [groupMessages, setGroupMessages] = useState<GroupMessageInfo[]>([]);
  const [communityMessages, setCommunityMessages] = useState<CommunityMessageInfo[]>([]);
  const [recentConcern, setRecentConcern] = useState<ShallowConcernDetails | null>(null);
  const [feedback, setFeedback] = useState<TenantFeedbackDetails | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<TransactionInfo[]>([]);

  // Unread counts
  const unreadPersonal = personalMessages.filter(msg => !msg.is_read).length;
  const unreadGroup = groupMessages.filter(msg => !msg.is_read).length;
  const unreadCommunity = communityMessages.filter(msg => !msg.is_read).length;
  
  // Content loading states
  const [showUnitDetails, setShowUnitDetails] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [
          unit,
          personal,
          group,
          community,
          concerns,
          userFeedback,
          transactions
        ] = await Promise.all([
          coreService.getUnitInfo(),
          coreService.getPersonalMessages(),
          coreService.getGroupMessages(),
          coreService.getCommunityMessages(),
          coreService.getConcerns(),
          coreService.getFeedback(),
          accountService.getTransactions()
        ]);

        setUnitInfo(unit);
        setPersonalMessages(personal);
        setGroupMessages(group);
        setCommunityMessages(community);
        setRecentConcern(concerns[0] || null);
        setFeedback(userFeedback);
        setRecentTransactions(transactions.slice(0, 5));
      } catch (err) {
        setError('Failed to fetch dashboard information');
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getTransactionIcon = (type: TransactionType) => {
    switch (type) {
      case TransactionType.DEPOSIT:
      case TransactionType.RENT_PAYMENT:
      case TransactionType.FEE_PAYMENT:
        return <ArrowUpRight className="w-5 h-5 text-green-500" />;
      case TransactionType.WITHDRAWAL:
        return <ArrowDownLeft className="w-5 h-5 text-red-500" />;
      default:
        return <Wallet className="w-5 h-5 text-gray-500" />;
    }
  };

  const getTransactionColor = (type: TransactionType) => {
    switch (type) {
      case TransactionType.DEPOSIT:
      case TransactionType.RENT_PAYMENT:
      case TransactionType.FEE_PAYMENT:
        return 'text-green-600 dark:text-green-400';
      case TransactionType.WITHDRAWAL:
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          Loading dashboard information...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="sticky top-0 bg-gray-100 dark:bg-gray-900 z-10 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Welcome back, {user?.first_name}!</h1>
              <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2 mt-1">
                <Calendar className="w-4 h-4" />
                Member since {formatDate(user?.date_joined || '')}
              </p>
            </div>
            
            <div className="text-right">
              <p className="text-sm text-gray-600 dark:text-gray-400">Account Balance</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {formatCurrency(user?.account_balance || 0)}
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/50 text-red-600 dark:text-red-400 rounded-md">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Unit Information */}
          {unitInfo && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="w-5 h-5 text-orange-500" />
                  Unit Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Unit</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{unitInfo.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Unit Group</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{unitInfo.unit_group.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Monthly Rent</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{formatCurrency(unitInfo.unit_group.monthly_rent)}</p>
                  </div>
                  
                  {showUnitDetails ? (
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Deposit Amount</p>
                        <p className="font-medium text-gray-900 dark:text-gray-100">{formatCurrency(unitInfo.unit_group.deposit_amount)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                        <p className="font-medium text-gray-900 dark:text-gray-100">{unitInfo.occupied_status}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowUnitDetails(false)}
                        className="w-full mt-2"
                      >
                        Show Less
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowUnitDetails(true)}
                      className="w-full mt-2"
                    >
                      View Details
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Messages Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-500" />
                Messages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <span className="text-gray-900 dark:text-gray-100">Personal</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900 dark:text-gray-100">{personalMessages.length}</span>
                    {unreadPersonal > 0 && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400 rounded-full">
                        {unreadPersonal} unread
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <span className="text-gray-900 dark:text-gray-100">Group</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900 dark:text-gray-100">{groupMessages.length}</span>
                    {unreadGroup > 0 && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400 rounded-full">
                        {unreadGroup} unread
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <span className="text-gray-900 dark:text-gray-100">Community</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900 dark:text-gray-100">{communityMessages.length}</span>
                    {unreadCommunity > 0 && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400 rounded-full">
                        {unreadCommunity} unread
                      </span>
                    )}
                  </div>
                </div>
                
                <Button
                  as={Link}
                  to="/dashboard/messages"
                  variant="outline"
                  size="sm"
                  className="w-full mt-2"
                >
                  View All Messages
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Concern */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-purple-500" />
                Recent Concern
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentConcern ? (
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Subject</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{recentConcern.about}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{recentConcern.status}</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span>{formatDate(recentConcern.created_at)}</span>
                  </div>
                  
                  <Button
                    as={Link}
                    to="/dashboard/concerns"
                    variant="outline"
                    size="sm"
                    className="w-full mt-2"
                  >
                    View All Concerns
                  </Button>
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                  No recent concerns
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-green-500" />
                Recent Transactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentTransactions.length > 0 ? (
                <div className="space-y-4">
                  {recentTransactions.map((transaction, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white dark:bg-gray-700 rounded-full">
                          {getTransactionIcon(transaction.type)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            {transaction.type.replace(/_/g, ' ')}
                          </p>
                          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                            <span>{transaction.means}</span>
                            <span>•</span>
                            <span>{formatDate(transaction.created_at)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-medium ${getTransactionColor(transaction.type)}`}>
                          {formatCurrency(transaction.amount)}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Ref: {transaction.reference}
                        </p>
                      </div>
                    </div>
                  ))}

                  <Button
                    as={Link}
                    to="/dashboard/transactions"
                    variant="outline"
                    size="sm"
                    className="w-full mt-2"
                  >
                    View All Transactions
                  </Button>
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                  No recent transactions
                </div>
              )}
            </CardContent>
          </Card>

          {/* Feedback Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                Your Feedback
              </CardTitle>
            </CardHeader>
            <CardContent>
              {feedback ? (
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Rating</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{feedback.rate}</p>
                  </div>
                  {showFeedback ? (
                    <>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Message</p>
                        <p className="text-sm text-gray-900 dark:text-gray-100">{feedback.message}</p>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <Clock className="w-4 h-4" />
                        <span>{formatDate(feedback.created_at)}</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowFeedback(false)}
                        className="w-full mt-2"
                      >
                        Show Less
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowFeedback(true)}
                      className="w-full mt-2"
                    >
                      View Feedback
                    </Button>
                  )}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                  No feedback provided
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};