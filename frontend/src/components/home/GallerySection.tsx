import React from 'react';
import { BusinessGallery } from '../../types/business';
import { Card } from '../ui/Card';
import { MapPin, Calendar } from 'lucide-react';
import { formatDate } from '../../utils/date';

interface GallerySectionProps {
  galleries: BusinessGallery[];
}

export const GallerySection: React.FC<GallerySectionProps> = ({ galleries }) => {
  return (
    <section className="py-24 bg-white" id="gallery">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Gallery</h2>
          <p className="text-xl text-gray-600">
            Take a visual tour of our properties and facilities
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {galleries.map((gallery, index) => (
            <Card key={index} className="overflow-hidden group hover:shadow-xl transition-all">
              <div className="relative h-64">
                {gallery.youtube_video_link ? (
                  <iframe
                    src={gallery.youtube_video_link}
                    title={gallery.title}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <img
                    src={gallery.picture}
                    alt={gallery.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                )}
              </div>
              
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold">{gallery.title}</h3>
                  <span className="text-sm text-gray-500">{formatDate(gallery.date)}</span>
                </div>
                <div 
                  className="text-gray-600 prose mb-4"
                  dangerouslySetInnerHTML={{ __html: gallery.details }}
                />
                
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <MapPin className="w-4 h-4" />
                  <span>{gallery.location_name}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};