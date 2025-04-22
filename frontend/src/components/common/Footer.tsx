import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Youtube } from 'lucide-react';
import { useBusinessInfo } from '../../hooks/useBusinessInfo';
import { DocumentModal } from './DocumentModal';
import { businessService } from '../../services/businessService';
import { DocumentInfo, DocumentName, HouseInfo } from '../../types/business';
import { scrollToElement } from '../../utils/scroll';

export const Footer: React.FC = () => {
  const { businessInfo, loading } = useBusinessInfo();
  const [selectedDocument, setSelectedDocument] = useState<DocumentInfo | null>(null);
  const [houses, setHouses] = useState<HouseInfo[]>([]);
  
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    const fetchHouses = async () => {
      try {
        const housesData = await businessService.getHouses();
        setHouses(housesData.slice(0, 5));
      } catch (error) {
        console.error('Error fetching houses:', error);
      }
    };
    fetchHouses();
  }, []);
  
  const socialIcons = [
    { name: 'Facebook', icon: <Facebook size={20} />, url: businessInfo?.facebook },
    { name: 'Twitter', icon: <Twitter size={20} />, url: businessInfo?.twitter },
    { name: 'Instagram', icon: <Instagram size={20} />, url: businessInfo?.instagram },
    { name: 'LinkedIn', icon: <Linkedin size={20} />, url: businessInfo?.linkedin },
    { name: 'YouTube', icon: <Youtube size={20} />, url: businessInfo?.youtube },
  ].filter(social => social.url);
  
  const handleDocumentClick = async (name: DocumentName) => {
    try {
      const document = await businessService.getDocument(name);
      setSelectedDocument(document);
    } catch (error) {
      console.error('Error fetching document:', error);
    }
  };

  const handleHouseClick = (houseId: number) => {
    scrollToElement(`house-${houseId}`);
  };
  
  const footerLinks = [
    {
      title: 'Company',
      links: [
        { name: 'About', path: '/about' },
        { name: 'Gallery', path: '/gallery' },
        { name: 'Contact', path: '/contact' },
        { name: 'FAQs', path: '/faqs' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { 
          name: 'Terms of Service', 
          onClick: () => handleDocumentClick(DocumentName.TERMS_OF_USE),
        },
        { 
          name: 'Privacy Policy', 
          onClick: () => handleDocumentClick(DocumentName.POLICY),
        },
      ],
    },
    {
      title: 'Houses',
      links: houses.map(house => ({
        name: house.name,
        onClick: () => handleHouseClick(house.id),
      })),
    },
  ];
  
  if (loading) {
    return <div className="h-48 bg-gray-50 dark:bg-gray-900"></div>;
  }
  
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Company Info */}
          <div className="md:col-span-2">
            <Link to="/" className="text-2xl font-bold text-white">
              {businessInfo?.short_name || 'House Rental'}
            </Link>
            
            <p className="mt-2 text-sm text-gray-300">
              {businessInfo?.slogan}
            </p>
            
            <address className="mt-4 text-sm text-gray-300 not-italic">
              {businessInfo?.address}
            </address>
            
            {businessInfo?.phone_number && (
              <p className="mt-2 text-sm text-gray-300">
                Phone: {businessInfo.phone_number}
              </p>
            )}
            
            {businessInfo?.email && (
              <p className="mt-1 text-sm text-gray-300">
                Email: {businessInfo.email}
              </p>
            )}
            
            {/* Social icons */}
            {socialIcons.length > 0 && (
              <div className="mt-6 flex space-x-4">
                {socialIcons.map((social, index) => (
                  <a
                    key={index}
                    href={social.url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition duration-200"
                    aria-label={social.name}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            )}
          </div>
          
          {/* Links */}
          {footerLinks.map((section) => (
            <div key={section.title} className="md:col-span-1">
              <h3 className="text-sm font-semibold text-white tracking-wider uppercase">
                {section.title}
              </h3>
              <ul className="mt-4 space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    {link.path ? (
                      <Link
                        to={link.path}
                        className="text-sm text-gray-300 hover:text-white transition duration-200"
                      >
                        {link.name}
                      </Link>
                    ) : (
                      <button
                        onClick={link.onClick}
                        className="text-sm text-gray-300 hover:text-white transition duration-200"
                      >
                        {link.name}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-800">
          <p className="text-sm text-gray-400 text-center">
            &copy; {currentYear} {businessInfo?.name || 'House Rental Management'}. All rights reserved.
          </p>
        </div>
      </div>

      {/* Document Modal */}
      {selectedDocument && (
        <DocumentModal
          document={selectedDocument}
          onClose={() => setSelectedDocument(null)}
        />
      )}
    </footer>
  );
};