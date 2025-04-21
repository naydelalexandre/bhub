import { LoadingState } from './loading-state';
import { Card } from './card';

interface DataTableLoadingProps {
  columnCount?: number;
  rowCount?: number;
  text?: string;
  className?: string;
}

export function DataTableLoading({
  columnCount = 5,
  rowCount = 10,
  text = "Carregando dados...",
  className,
}: DataTableLoadingProps) {
  return (
    <Card className={className}>
      <div className="p-4">
        <div className="mb-4 flex items-center justify-between">
          <div className="h-8 w-[30%] animate-pulse rounded bg-muted"></div>
          <div className="h-8 w-[15%] animate-pulse rounded bg-muted"></div>
        </div>
        
        <div className="overflow-hidden rounded-md border">
          <div className="grid border-b" style={{ gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))` }}>
            {Array.from({ length: columnCount }).map((_, index) => (
              <div key={`header-${index}`} className="h-10 border-r p-2">
                <div className="h-4 w-[80%] animate-pulse rounded bg-muted"></div>
              </div>
            ))}
          </div>
          
          <div>
            {Array.from({ length: rowCount }).map((_, rowIndex) => (
              <div 
                key={`row-${rowIndex}`} 
                className="grid border-b" 
                style={{ gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))` }}
              >
                {Array.from({ length: columnCount }).map((_, colIndex) => (
                  <div key={`cell-${rowIndex}-${colIndex}`} className="border-r p-2">
                    <div className="h-4 w-[70%] animate-pulse rounded bg-muted"></div>
                  </div>
                ))}
              </div>
            ))}
          </div>
          
          {text && (
            <div className="flex justify-center p-4">
              <LoadingState text={text} size="sm" />
            </div>
          )}
        </div>
      </div>
    </Card>
  );
} 