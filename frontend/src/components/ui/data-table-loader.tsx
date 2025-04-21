import { LoadingSpinner } from "./loading-spinner";

interface DataTableLoaderProps {
  columnCount: number;
  rowCount?: number;
  className?: string;
}

export function DataTableLoader({ 
  columnCount,
  rowCount = 5,
  className = ""
}: DataTableLoaderProps) {
  return (
    <div className={`w-full py-10 ${className}`}>
      <div className="flex flex-col items-center justify-center space-y-3">
        <LoadingSpinner size={32} text="Carregando dados da tabela..." />
      </div>
    </div>
  );
} 