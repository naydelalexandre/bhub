import React from 'react';
import { Link, useLocation } from 'wouter';

export default function MobileNavigation() {
  const [location] = useLocation();

  const navItems = [
    { label: 'Dashboard', path: '/', icon: 'dashboard' },
    { label: 'Atividades', path: '/activities', icon: 'event_note' },
    { label: 'Negociações', path: '/deals', icon: 'real_estate_agent' },
    { label: 'Gamificação', path: '/gamification', icon: 'emoji_events' },
    { label: 'Perfil', path: '/profile', icon: 'person' },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-10">
      <div className="flex justify-around items-center">
        {navItems.map((item) => (
          <Link key={item.path} href={item.path}>
            <a
              className={`flex flex-col items-center justify-center p-2 ${
                location === item.path ? 'text-blue-600' : 'text-gray-500'
              }`}
            >
              <span className="material-icons text-current text-xl">{item.icon}</span>
              <span className="text-xs mt-1">{item.label}</span>
            </a>
          </Link>
        ))}
      </div>
    </div>
  );
} 