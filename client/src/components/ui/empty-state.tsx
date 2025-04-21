import { FolderIcon } from "lucide-react";

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title = "Nenhum dado encontrado",
  description = "Não há dados disponíveis para mostrar neste momento.",
  icon = <FolderIcon className="h-10 w-10 text-gray-400" />,
  className = "",
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-10 ${className}`}>
      <div className="flex flex-col items-center justify-center space-y-3 text-center">
        {icon}
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        <p className="max-w-sm text-sm text-gray-500">{description}</p>
      </div>
    </div>
  );
} 