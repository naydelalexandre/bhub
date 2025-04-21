import { Skeleton } from "@/components/ui/skeleton";

interface StatCardProps {
  title: string;
  value: number;
  icon: string;
  iconColor: string;
  progress: {
    current: number;
    total: number;
    color: string;
    label?: string;
    trend?: string;
    trendColor?: string;
  };
  suffix?: string;
  isLoading?: boolean;
}

export default function StatCard({
  title,
  value,
  icon,
  iconColor,
  progress,
  suffix = "",
  isLoading = false
}: StatCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-neutral-300 mb-1">{title}</p>
          {isLoading ? (
            <Skeleton className="h-8 w-20" />
          ) : (
            <h2 className="text-2xl font-semibold text-neutral-400">
              {value}<span className="text-sm font-normal">{suffix}</span>
            </h2>
          )}
        </div>
        <span className={`material-icons ${iconColor}`}>{icon}</span>
      </div>
      <div className="mt-2">
        <div className="flex justify-between text-xs mb-1">
          <span>{progress.label || "Progresso"}</span>
          {isLoading ? (
            <Skeleton className="h-4 w-10" />
          ) : (
            <span>
              {progress.trend ? (
                <span className={progress.trendColor}>{progress.trend}</span>
              ) : (
                `${progress.current}/${progress.total}`
              )}
            </span>
          )}
        </div>
        {isLoading ? (
          <Skeleton className="h-2 w-full rounded-full" />
        ) : (
          <div className="w-full bg-neutral-200 rounded-full h-2">
            <div
              className={`${progress.color} h-2 rounded-full`}
              style={{ width: `${(progress.current / progress.total) * 100}%` }}
            ></div>
          </div>
        )}
      </div>
    </div>
  );
}
