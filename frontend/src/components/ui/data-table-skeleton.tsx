import { Skeleton } from "./skeleton";

interface DataTableSkeletonProps {
  columnCount: number;
  rowCount?: number;
  showHeader?: boolean;
  className?: string;
}

export function DataTableSkeleton({
  columnCount,
  rowCount = 5,
  showHeader = true,
  className = "",
}: DataTableSkeletonProps) {
  return (
    <div className={`w-full space-y-3 ${className}`}>
      {showHeader && (
        <div className="flex items-center py-4">
          <Skeleton className="h-8 w-[250px]" />
          <div className="ml-auto flex items-center gap-2">
            <Skeleton className="h-8 w-[70px]" />
            <Skeleton className="h-8 w-[100px]" />
          </div>
        </div>
      )}
      <div className="rounded-md border">
        <div className="border-b">
          <div className="flex h-10 items-center gap-4 px-4">
            {Array(columnCount)
              .fill(null)
              .map((_, index) => (
                <Skeleton key={index} className="h-4 w-full max-w-[120px]" />
              ))}
          </div>
        </div>
        <div>
          {Array(rowCount)
            .fill(null)
            .map((_, rowIndex) => (
              <div key={rowIndex} className="flex h-16 items-center gap-4 border-b px-4 last:border-0">
                {Array(columnCount)
                  .fill(null)
                  .map((_, colIndex) => (
                    <Skeleton key={colIndex} className="h-4 w-full max-w-[120px]" />
                  ))}
              </div>
            ))}
        </div>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Skeleton className="h-8 w-[100px]" />
        <Skeleton className="h-8 w-[70px]" />
      </div>
    </div>
  );
} 