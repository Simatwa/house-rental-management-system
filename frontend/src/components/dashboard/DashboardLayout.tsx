import React, { useState } from 'react';
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
  Wallet,
  Menu,
  X,
  Sun,
  Moon
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Avatar } from '../ui/Avatar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
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

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex">
      {/* Mobile sidebar toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-40">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-md bg-white dark:bg-gray-800 shadow-md text-gray-600 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar - Fixed position with scrollable content */}
      <div className={`
        fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-30 
        transform transition-transform duration-300 ease-in-out lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Avatar
              src={user?.profile}
              name={`${user?.first_name} ${user?.last_name}`}
              size="md"
            />
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white truncate">
                {user?.first_name} {user?.last_name}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{user?.username}</p>
            </div>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <div className="space-y-1">
            {navigationItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'bg-orange-50 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={toggleTheme}
              className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              {theme === 'light' ? (
                <>
                  <Moon className="w-5 h-5" />
                  <span>Dark Mode</span>
                </>
              ) : (
                <>
                  <Sun className="w-5 h-5" />
                  <span>Light Mode</span>
                </>
              )}
            </button>

            {user?.is_staff && (
              <a
                href="/d/admin"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-3 py-2 mt-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <ExternalLink className="w-5 h-5" />
                <span>Admin Panel</span>
              </a>
            )}
          </div>
        </nav>
        
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Main content - Scrollable with sidebar width offset */}
      <div className="flex-1 ml-0 lg:ml-64">
        <div className="min-h-screen overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};