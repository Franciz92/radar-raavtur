// src/components/profile/ProfileTabs.jsx

import { useState } from 'react';
import { User, Briefcase, Star, Calendar, Info } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function ProfileTabs({ profile, businesses, reviews, bookings, activeTab, onTabChange }) {
  const { isEn } = useLanguage();

  const tabs = [
    {
      id: 'about',
      icon: Info,
      label: isEn ? 'About' : 'Sobre',
      show: true
    },
    {
      id: 'businesses',
      icon: Briefcase,
      label: isEn ? 'Businesses' : 'Empresas',
      count: businesses?.length || 0,
      show: profile?.user_type === 'business' || profile?.role === 'company'
    },
    {
      id: 'reviews',
      icon: Star,
      label: isEn ? 'Reviews' : 'Avaliações',
      count: reviews?.length || 0,
      show: true
    },
    {
      id: 'bookings',
      icon: Calendar,
      label: isEn ? 'Bookings' : 'Reservas',
      count: bookings?.length || 0,
      show: true
    }
  ];

  const visibleTabs = tabs.filter(tab => tab.show);

  return (
    <div className="flex gap-1 overflow-x-auto scrollbar-hide -mb-px">
      {visibleTabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`
            px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap flex items-center gap-2
            ${activeTab === tab.id 
              ? 'border-amber-500 text-amber-600 dark:text-amber-400' 
              : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }
          `}
        >
          <tab.icon size={16} />
          {tab.label}
          {tab.count > 0 && (
            <span className={`
              text-xs px-2 py-0.5 rounded-full
              ${activeTab === tab.id
                ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
              }
            `}>
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}