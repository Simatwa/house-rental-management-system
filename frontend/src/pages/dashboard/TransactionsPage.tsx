import React, { useState, useEffect } from 'react';
import { Wallet, ArrowUpRight, ArrowDownLeft, Filter } from 'lucide-react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { accountService } from '../../services/accountService';
import { TransactionInfo, TransactionMeans, TransactionType } from '../../types/account';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/date';

export const TransactionsPage: React.FC = () => {
  const [transactions, setTransactions] = useState<TransactionInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterMeans, setFilterMeans] = useState<TransactionMeans | ''>('');
  const [filterType, setFilterType] = useState<TransactionType | ''>('');

  const fetchTransactions = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await accountService.getTransactions(
        filterMeans || undefined,
        filterType || undefined
      );
      setTransactions(data);
    } catch (err) {
      setError('Failed to fetch transactions');
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [filterMeans, filterType]);

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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="sticky top-0 bg-gray-100 dark:bg-gray-900 z-10 pb-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Transactions</h1>
            
            <div className="flex items-center gap-2">
              <Select
                options={[
                  { value: '', label: 'All Means' },
                  ...Object.values(TransactionMeans).map(means => ({
                    value: means,
                    label: means
                  }))
                ]}
                value={filterMeans}
                onChange={(value) => setFilterMeans(value as TransactionMeans | '')}
              />
              
              <Select
                options={[
                  { value: '', label: 'All Types' },
                  ...Object.values(TransactionType).map(type => ({
                    value: type,
                    label: type.replace(/_/g, ' ')
                  }))
                ]}
                value={filterType}
                onChange={(value) => setFilterType(value as TransactionType | '')}
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/50 text-red-600 dark:text-red-400 rounded-md">
            {error}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                Loading transactions...
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No transactions found
              </div>
            ) : (
              <div className="space-y-4">
                {transactions.map((transaction, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded-full">
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
                        {transaction.notes && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {transaction.notes}
                          </p>
                        )}
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
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};