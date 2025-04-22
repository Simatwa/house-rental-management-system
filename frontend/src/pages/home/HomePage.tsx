import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Shield, Clock, Tag, MessageSquare, Coins } from 'lucide-react';
import { MainLayout } from '../../components/layout/MainLayout';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { useBusinessInfo } from '../../hooks/useBusinessInfo';
import { useSearch } from '../../hooks/useSearch';
import { businessService } from '../../services/businessService';
import { BusinessGallery, HouseInfo, UnitGroupInfo, UserFeedback, FAQDetails } from '../../types/business';
import { GallerySection } from '../../components/home/GallerySection';
import { HouseSection } from '../../components/home/HouseSection';
import { TestimonialCard } from '../../components/home/TestimonialCard';
import { FAQSection } from '../../components/home/FAQSection';
import { ContactSection } from '../../components/home/ContactSection';
import { scrollToElement } from '../../utils/scroll';

export const HomePage: React.FC = () => {
  const { businessInfo } = useBusinessInfo();
  const [houses, setHouses] = useState<HouseInfo[]>([]);
  const [unitGroups, setUnitGroups] = useState<Record<number, UnitGroupInfo[]>>({});
  const [testimonials, setTestimonials] = useState<UserFeedback[]>([]);
  const [faqs, setFaqs] = useState<FAQDetails[]>([]);
  const [galleries, setGalleries] = useState<BusinessGallery[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const { houses: filteredHouses, unitGroups: filteredUnitGroups } = useSearch(
    houses,
    unitGroups,
    searchTerm
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [housesData, feedbacksData, faqsData, galleriesData] = await Promise.all([
          businessService.getHouses(),
          businessService.getFeedbacks(),
          businessService.getFAQs(),
          businessService.getGalleries(),
        ]);
        
        setHouses(housesData);
        setTestimonials(feedbacksData);
        setFaqs(faqsData);
        setGalleries(galleriesData);
        
        // Fetch unit groups for each house
        const unitGroupsData: Record<number, UnitGroupInfo[]> = {};
        await Promise.all(
          housesData.map(async (house) => {
            const groups = await businessService.getUnitGroups(house.id);
            unitGroupsData[house.id] = groups;
          })
        );
        setUnitGroups(unitGroupsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    
    fetchData();
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const features = [
    {
      icon: <Shield className="w-8 h-8 text-orange-500" />,
      title: 'Secure Living',
      description: 'Our properties are located in safe, well-maintained communities with 24/7 security.',
    },
    {
      icon: <Clock className="w-8 h-8 text-orange-500" />,
      title: 'Quick Response',
      description: 'Dedicated maintenance team with fast response times for all your needs.',
    },
    {
      icon: <Coins className="w-8 h-8 text-orange-500" />,
      title: 'Best Rates',
      description: 'Competitive pricing with transparent payment systems and no hidden fees.',
    },
    {
      icon: <MessageSquare className="w-8 h-8 text-orange-500" />,
      title: 'Easy Communication',
      description: 'Direct messaging system for seamless communication with management.',
    },
  ];

  return (
    <MainLayout fullWidth>
      {/* Hero Section */}
      <section className="relative h-screen">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${businessInfo?.wallpaper || 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg'})`,
          }}
        >
          <div className="absolute inset-0 bg-black/50"></div>
        </div>
        
        <div className="relative h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                {businessInfo?.slogan || 'Find Your Perfect Home'}
              </h1>
              <p className="text-xl text-gray-200 mb-8">
                {businessInfo?.details || 'Discover premium rental properties with professional management and exceptional tenant services.'}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={() => scrollToElement('properties')}
                  variant="primary"
                  size="lg"
                  className="bg-orange-500 hover:bg-orange-600"
                  rightIcon={<Search />}
                >
                  Browse Properties
                </Button>
                <Button
                  onClick={() => scrollToElement('contact')}
                  variant="outline"
                  size="lg"
                  className="border-2 text-white hover:bg-white/10"
                >
                  Contact Us
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Why Choose Us</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Experience hassle-free living with our premium services
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="p-6 border-none shadow-lg hover:shadow-xl transition-shadow dark:bg-gray-800">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2 dark:text-white">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Search and Houses Section */}
      {houses.length > 0 && (
        <section id="properties" className="py-24 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Available Properties</h2>
                <p className="text-xl text-gray-600 dark:text-gray-400">
                  Find your ideal rental property from our selection
                </p>
              </div>
              <div className="w-full md:w-96">
                <Input
                  type="text"
                  placeholder="Search properties..."
                  value={searchTerm}
                  onChange={handleSearch}
                  leftIcon={<Search className="w-5 h-5" />}
                  fullWidth
                />
              </div>
            </div>
            
            <HouseSection 
              houses={filteredHouses} 
              unitGroups={filteredUnitGroups} 
            />
          </div>
        </section>
      )}

      {/* Gallery Section */}
      {galleries.length > 0 && <GallerySection galleries={galleries} />}

      {/* Testimonials Section */}
      {testimonials.length > 0 && (
        <section id="testimonials" className="py-24 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">What Our Tenants Say</h2>
              <p className="text-xl text-gray-600 dark:text-gray-400">
                Hear from our satisfied tenants about their experience
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <TestimonialCard key={index} feedback={testimonial} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQs Section */}
      {faqs.length > 0 && (
        <section id="faqs">
          <FAQSection faqs={faqs} />
        </section>
      )}

      {/* Contact Section */}
      <ContactSection />
    </MainLayout>
  );
};