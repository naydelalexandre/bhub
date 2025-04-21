import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: number;
  className?: string;
  text?: string;
}

export function LoadingSpinner({ 
  size = 24, 
  className = "", 
  text = "Carregando..." 
}: LoadingSpinnerProps) {
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <Loader2 className="animate-spin" size={size} />
      {text && <p className="text-sm text-muted-foreground mt-2">{text}</p>}
    </div>
  );
} 