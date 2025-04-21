import React from 'react';
import { Spinner } from './spinner';
import { cn } from '@/lib/utils';

interface LoadingStateProps {
  text?: string;
  size?: 'sm' | 'md' | 'lg';
  fullPage?: boolean;
  className?: string;
}

export function LoadingState({
  text,
  size = 'md',
  fullPage = false,
  className,
}: LoadingStateProps) {
  const containerClasses = cn(
    'flex flex-col items-center justify-center gap-3',
    fullPage && 'min-h-[50vh]',
    className
  );

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <div className={containerClasses}>
      <Spinner size={size} />
      {text && (
        <p className={cn('text-muted-foreground', textSizeClasses[size])}>
          {text}
        </p>
      )}
    </div>
  );
} 