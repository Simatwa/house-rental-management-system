import React, { useState } from 'react';
import { MapPin, Phone, Mail } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { businessService } from '../../services/businessService';
import { useBusinessInfo } from '../../hooks/useBusinessInfo';

export const ContactSection: React.FC = () => {
  const { businessInfo } = useBusinessInfo();
  const [formData, setFormData] = useState({
    sender: '',
    email: '',
    body: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await businessService.sendVisitorMessage(formData);
      setSuccess(true);
      setFormData({ sender: '', email: '', body: '' });
    } catch (err) {
      setError('Failed to send message. Please try again.');
      console.error('Error sending message:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-24 bg-black text-white" id="contact">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-6">Contact Us</h2>
            <p className="text-xl text-gray-300 mb-8">
              Get in touch with us for any inquiries about our properties or services.
            </p>
            <div className="space-y-4">
              {businessInfo?.phone_number && (
                <div className="flex items-center gap-3">
                  <Phone className="w-6 h-6 text-orange-500" />
                  <span>{businessInfo.phone_number}</span>
                </div>
              )}
              {businessInfo?.email && (
                <div className="flex items-center gap-3">
                  <Mail className="w-6 h-6 text-orange-500" />
                  <span>{businessInfo.email}</span>
                </div>
              )}
              {businessInfo?.address && (
                <div className="flex items-center gap-3">
                  <MapPin className="w-6 h-6 text-orange-500" />
                  <span>{businessInfo.address}</span>
                </div>
              )}
            </div>
          </div>
          <div className="lg:pl-12">
            <Card className="p-8 bg-white text-black">
              <h3 className="text-2xl font-semibold mb-6">Message Us</h3>
              {success ? (
                <div className="text-green-600 p-4 bg-green-50 rounded-lg">
                  <p className="font-medium">Message sent successfully!</p>
                  <p className="mt-1">We'll get back to you as soon as possible.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="text-red-600 p-4 bg-red-50 rounded-lg">
                      {error}
                    </div>
                  )}
                  <Input
                    label="Your Name"
                    value={formData.sender}
                    onChange={(e) => setFormData({ ...formData, sender: e.target.value })}
                    required
                    fullWidth
                  />
                  <Input
                    type="email"
                    label="Email Address"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    fullWidth
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Message
                    </label>
                    <textarea
                      value={formData.body}
                      onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                      rows={4}
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    variant="primary"
                    fullWidth
                    isLoading={isSubmitting}
                    className="bg-orange-500 hover:bg-orange-600"
                  >
                    Send Message
                  </Button>
                </form>
              )}
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};