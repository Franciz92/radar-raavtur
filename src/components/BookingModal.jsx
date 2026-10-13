// src/components/BookingModal.jsx

import { useEffect } from 'react';
import BookingForm from './BookingForm';
import { X } from 'lucide-react';

export default function BookingModal({ isOpen, onClose, service, company, ...props }) {
  // Fechar com ESC
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
        >
          <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>
        
        <BookingForm
          service={service}
          company={company}
          onClose={onClose}
          {...props}
        />
      </div>
    </div>
  );
}