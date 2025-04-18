import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

interface PerformerProps {
  brokerId: number;
  brokerName: string;
  brokerInitials: string;
  score: number;
  activitiesCompleted: number;
}

interface PerformanceCardProps {
  performances: PerformerProps[];
  isLoading: boolean;
  className?: string;
}

export default function PerformanceCard({ performances, isLoading, className }: PerformanceCardProps) {
  return (
    <div className={cn("bg-white rounded-lg shadow-sm p-4", className)}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-neutral-400">Performance dos Corretores</h2>
        <Button variant="link" className="text-primary text-sm flex items-center">
          <span>Ver relatório completo</span>
          <span className="material-icons text-sm ml-1">arrow_forward</span>
        </Button>
      </div>
      
      <div className="scrollable-container pr-2 max-h-[420px] overflow-y-auto">
        {isLoading ? (
          <>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="mb-4 border-b border-neutral-200 pb-4 last:border-b-0 last:pb-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <div className="ml-3">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-24 mt-1" />
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Skeleton className="h-6 w-10" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                  </div>
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            ))}
          </>
        ) : (
          <>
            {performances.map((performer) => (
              <div key={performer.brokerId} className="mb-4 border-b border-neutral-200 pb-4 last:border-b-0 last:pb-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-medium">
                      {performer.brokerInitials}
                    </div>
                    <div className="ml-3">
                      <h3 className="font-medium text-neutral-400">{performer.brokerName}</h3>
                      <p className="text-xs text-neutral-300">{performer.activitiesCompleted} atividades esta semana</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-center">
                      <p className="text-xs text-neutral-300">Score</p>
                      <p className={cn(
                        "font-semibold",
                        performer.score >= 80 ? "text-secondary" : 
                        performer.score >= 70 ? "text-primary" :
                        performer.score >= 60 ? "text-accent" :
                        "text-danger"
                      )}>
                        {performer.score}
                      </p>
                    </div>
                    <Button variant="ghost" size="icon" className="rounded-full text-primary hover:bg-primary/10">
                      <span className="material-icons">chat</span>
                    </Button>
                  </div>
                </div>
                <div className="w-full bg-neutral-200 rounded-full h-2">
                  <div 
                    className={cn(
                      "h-2 rounded-full",
                      performer.score >= 80 ? "bg-secondary" : 
                      performer.score >= 70 ? "bg-primary" :
                      performer.score >= 60 ? "bg-accent" :
                      "bg-danger"
                    )} 
                    style={{ width: `${performer.score}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
