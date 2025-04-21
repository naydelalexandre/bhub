import React from 'react';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  size?: 'sm' | 'md' | 'lg';
}

export default function EmptyState({ 
  icon = 'info', 
  title, 
  description, 
  action, 
  size = 'md' 
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-10">
      <div className="mb-4">
        <div className="bg-gray-100 rounded-full p-3 inline-flex items-center justify-center">
          <span className="material-icons text-gray-500" style={{ fontSize: size === 'sm' ? '24px' : '36px' }}>
            {icon}
          </span>
        </div>
      </div>
      <h3 className={`font-medium ${size === 'sm' ? 'text-lg' : 'text-xl'} mb-2`}>{title}</h3>
      {description && <p className="text-gray-500 mb-4 max-w-md">{description}</p>}
      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
} 