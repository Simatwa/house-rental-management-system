import React from 'react';
import { X } from 'lucide-react';
import { Button } from '../ui/Button';
import { DocumentInfo } from '../../types/business';

interface DocumentModalProps {
  document: DocumentInfo;
  onClose: () => void;
}

export const DocumentModal: React.FC<DocumentModalProps> = ({
  document,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity" onClick={onClose} />
        
        <div className="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl max-h-[90vh] flex flex-col">
          <div className="absolute right-4 top-4">
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="bg-white dark:bg-gray-800 px-4 pb-4 pt-5 sm:p-6 flex-1 overflow-hidden">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:text-left w-full">
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  {document.name}
                </h3>
                
                <div className="overflow-y-auto max-h-[calc(90vh-12rem)] pr-2 custom-scrollbar">
                  <div 
                    className="formatted-content"
                    dangerouslySetInnerHTML={{ __html: document.content }}
                  />
                </div>
                
                <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                  Last updated: {new Date(document.updated_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
            <Button
              variant="primary"
              className="w-full sm:w-auto sm:ml-3 bg-orange-500 hover:bg-orange-600"
              onClick={onClose}
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};