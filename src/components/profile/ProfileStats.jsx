// src/components/profile/ProfileStats.jsx

import { Users, Star, Calendar, Briefcase } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function ProfileStats({ stats }) {
  const { isEn } = useLanguage();

  const statItems = [
    {
      icon: Users,
      value: stats?.followers || 0,
      label: isEn ? 'Followers' : 'Seguidores'
    },
    {
      icon: Users,
      value: stats?.following || 0,
      label: isEn ? 'Following' : 'Seguindo'
    },
    {
      icon: Star,
      value: stats?.reviews || 0,
      label: isEn ? 'Reviews' : 'Avaliações'
    },
    {
      icon: Briefcase,
      value: stats?.businesses || 0,
      label: isEn ? 'Businesses' : 'Empresas'
    },
    {
      icon: Calendar,
      value: stats?.bookings || 0,
      label: isEn ? 'Bookings' : 'Reservas'
    }
  ];

  return (
    <div className="flex flex-wrap gap-6">
      {statItems.map((item, index) => (
        <div key={index} className="flex items-center gap-2 text-sm">
          <item.icon size={16} className="text-gray-400" />
          <span className="font-semibold text-gray-900 dark:text-white">{item.value}</span>
          <span className="text-gray-500 dark:text-gray-400">{item.label}</span>
        </div>
      ))}
    </div>
  );
}