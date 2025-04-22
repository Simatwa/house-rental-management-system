import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  User,
  MessageSquare,
  Wrench,
  Star,
  Building,
  LogOut,
  ExternalLink,
  Wallet
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Avatar } from '../ui/Avatar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const isActive = (path: string) => location.pathname === path;
  
  const navigationItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: <Home className="w-5 h-5" />,
    },
    {
      name: 'Profile',
      path: '/dashboard/profile',
      icon: <User className="w-5 h-5" />,
    },
    {
      name: 'Unit Info',
      path: '/dashboard/unit-info',
      icon: <Building className="w-5 h-5" />,
    },
    {
      name: 'Messages',
      path: '/dashboard/messages',
      icon: <MessageSquare className="w-5 h-5" />,
    },
    {
      name: 'Concerns',
      path: '/dashboard/concerns',
      icon: <Wrench className="w-5 h-5" />,
    },
    {
      name: 'Feedback',
      path: '/dashboard/feedback',
      icon: <Star className="w-5 h-5" />,
    },
    {
      name: 'Transactions',
      path: '/dashboard/transactions',
      icon: <Wallet className="w-5 h-5" />,
    },
  ];
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar - Fixed position with scrollable content */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 z-30 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Avatar
              src={user?.profile}
              name={`${user?.first_name} ${user?.last_name}`}
              size="md"
            />
            <div>
              <h2 className="font-semibold text-gray-900 truncate">
                {user?.first_name} {user?.last_name}
              </h2>
              <p className="text-sm text-gray-500 truncate">{user?.username}</p>
            </div>
          </div>
        </div>
        
        {/* Scrollable navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navigationItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                isActive(item.path)
                  ? 'bg-orange-50 text-orange-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {item.icon}
              <span>{item.name}</span>
            </Link>
          ))}
          
          {user?.is_staff && (
            <a
              href="/d/admin"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50"
            >
              <ExternalLink className="w-5 h-5" />
              <span>Admin Panel</span>
            </a>
          )}
        </nav>
        
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-red-600 hover:bg-red-50"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
      
      {/* Main content - Scrollable with sidebar width offset */}
      <div className="flex-1 ml-64">
        <div className="p-8 min-h-screen overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};