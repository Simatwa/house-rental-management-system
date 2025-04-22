import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, Menu, X, User, MessageSquare, Wrench, CreditCard, LogOut, Building, 
  MapPin, Star, FileText, Sun, Moon, HelpCircle 
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Avatar } from '../ui/Avatar';
import { Input } from '../ui/Input';
import { useBusinessInfo } from '../../hooks/useBusinessInfo';
import { scrollToElement } from '../../utils/scroll';
import { DocumentModal } from './DocumentModal';
import { businessService } from '../../services/businessService';
import { DocumentName } from '../../types/business';

export const Header: React.FC<{
  onSearch?: (term: string) => void;
}> = ({ onSearch }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const { businessInfo } = useBusinessInfo();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };
  
  const closeMenu = () => {
    setMenuOpen(false);
  };
  
  const handleLogout = () => {
    logout();
    closeMenu();
  };
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    onSearch?.(term);
  };
  
  const handleScrollTo = (id: string) => {
    scrollToElement(id);
    closeMenu();
  };

  const handleShowPolicy = async () => {
    try {
      const document = await businessService.getDocument(DocumentName.POLICY);
      setShowPolicyModal(true);
    } catch (error) {
      console.error('Error fetching policy:', error);
    }
  };
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  const publicLinks = [
    {
      name: 'Rental Houses',
      onClick: () => handleScrollTo('properties'),
      icon: <Building className="w-5 h-5" />,
    },
    {
      name: 'Contacts',
      onClick: () => handleScrollTo('contact'),
      icon: <MapPin className="w-5 h-5" />,
    },
    {
      name: 'Testimonials',
      onClick: () => handleScrollTo('testimonials'),
      icon: <Star className="w-5 h-5" />,
    },
    {
      name: 'FAQs',
      onClick: () => handleScrollTo('faqs'),
      icon: <HelpCircle className="w-5 h-5" />,
    },
    {
      name: 'Policy',
      onClick: handleShowPolicy,
      icon: <FileText className="w-5 h-5" />,
    },
  ];
  
  const privateLinks = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: <Home className="w-5 h-5" />,
    },
    {
      name: 'Messages',
      path: '/messages',
      icon: <MessageSquare className="w-5 h-5" />,
    },
    {
      name: 'Concerns',
      path: '/concerns',
      icon: <Wrench className="w-5 h-5" />,
    },
    {
      name: 'Payments',
      path: '/payments',
      icon: <CreditCard className="w-5 h-5" />,
    },
  ];
  
  const links = isAuthenticated ? privateLinks : publicLinks;
  
  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-3">
              {businessInfo?.logo ? (
                <img 
                  src={businessInfo.logo} 
                  alt={businessInfo.short_name} 
                  className="h-8 w-auto"
                />
              ) : (
                <Building className="w-8 h-8 text-orange-500" />
              )}
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                {businessInfo?.short_name || 'House Rental'}
              </span>
            </Link>
          </div>
          
          {/* Search bar */}
          {onSearch && (
            <div className="hidden md:flex items-center flex-1 max-w-sm mx-8">
              <Input
                type="text"
                placeholder="Search rental houses..."
                value={searchTerm}
                onChange={handleSearch}
                fullWidth
              />
            </div>
          )}
          
          {/* Desktop navigation */}
          <nav className="hidden md:ml-6 md:flex md:space-x-8">
            {links.map((link) => (
              <button
                key={link.name}
                onClick={link.onClick || (() => {})}
                className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 ${
                  isActive(link.path || '')
                    ? 'border-orange-500 text-gray-900 dark:text-white'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white hover:border-gray-300'
                }`}
              >
                {link.name}
              </button>
            ))}
          </nav>
          
          {/* Theme toggle and user menu */}
          <div className="hidden md:ml-6 md:flex md:items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5" />
              ) : (
                <Sun className="w-5 h-5" />
              )}
            </button>

            {isAuthenticated ? (
              <div className="relative ml-3">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {user?.first_name} {user?.last_name}
                  </span>
                  <Avatar
                    src={user?.profile}
                    name={`${user?.first_name} ${user?.last_name}`}
                    size="sm"
                  />
                  <button
                    onClick={handleLogout}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                    title="Logout"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-500 hover:bg-orange-600"
              >
                Tenant Login
              </Link>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 mr-2"
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5" />
              ) : (
                <Sun className="w-5 h-5" />
              )}
            </button>

            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-orange-500 hover:bg-gray-100 focus:outline-none dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800"
            >
              {menuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden">
          {onSearch && (
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <Input
                type="text"
                placeholder="Search rental houses..."
                value={searchTerm}
                onChange={handleSearch}
                fullWidth
              />
            </div>
          )}
          
          <div className="pt-2 pb-3 space-y-1">
            {links.map((link) => (
              <button
                key={link.name}
                onClick={link.onClick || (() => {})}
                className={`flex w-full items-center px-3 py-2 text-base font-medium ${
                  isActive(link.path || '')
                    ? 'bg-orange-50 text-orange-700 dark:bg-orange-900 dark:text-orange-200 border-l-4 border-orange-500'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white border-l-4 border-transparent'
                }`}
              >
                <span className="mr-3">{link.icon}</span>
                {link.name}
              </button>
            ))}
            
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="flex w-full items-center px-3 py-2 text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white border-l-4 border-transparent"
              >
                <span className="mr-3">
                  <LogOut className="w-5 h-5" />
                </span>
                Logout
              </button>
            )}
            
            {!isAuthenticated && (
              <Link
                to="/login"
                onClick={closeMenu}
                className="flex items-center px-3 py-2 text-base font-medium text-orange-600 hover:bg-orange-50 dark:text-orange-400 dark:hover:bg-orange-900 border-l-4 border-transparent"
              >
                <span className="mr-3">
                  <User className="w-5 h-5" />
                </span>
                Tenant Login
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Policy Modal */}
      {showPolicyModal && (
        <DocumentModal
          document={{
            name: DocumentName.POLICY,
            content: '',
            updated_at: new Date().toISOString()
          }}
          onClose={() => setShowPolicyModal(false)}
        />
      )}
    </header>
  );
};