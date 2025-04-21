import React from 'react';

interface IconProps {
  name: string;
  className?: string;
}

export function Icon({ name, className = "" }: IconProps) {
  return (
    <span className={`material-icons ${className}`}>
      {name}
    </span>
  );
} 