import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './button';
import { Card } from './card';

interface ErrorDisplayProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorDisplay({
  title = "Ocorreu um erro",
  message,
  onRetry,
  className,
}: ErrorDisplayProps) {
  return (
    <Card className={className}>
      <div className="flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground mb-4">{message}</p>
        
        {onRetry && (
          <Button 
            variant="outline" 
            onClick={onRetry}
            className="mt-2"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Tentar novamente
          </Button>
        )}
      </div>
    </Card>
  );
} 