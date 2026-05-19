import { Clock, DollarSign, Layers, Calendar } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8 flex justify-center">
      <div className="w-full max-w-3xl space-y-6">
        <div className="text-center space-y-3 mb-8 flex flex-col items-center">
          <div className="h-8 w-64 bg-primary/20 animate-pulse rounded-md"></div>
          <div className="flex items-center justify-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground/50" />
            <div className="h-4 w-32 bg-muted animate-pulse rounded"></div>
          </div>
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 bg-card border border-border/50 rounded-xl text-center shadow-lg">
              <div className="flex justify-center mb-3">
                <div className="w-6 h-6 bg-muted animate-pulse rounded-full"></div>
              </div>
              <div className="flex justify-center mb-2">
                <div className="h-3 w-20 bg-muted animate-pulse rounded"></div>
              </div>
              <div className="flex justify-center">
                <div className="h-8 w-16 bg-primary/20 animate-pulse rounded-md"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Laps List Skeleton */}
        <div className="bg-card border border-border/50 rounded-xl p-4 md:p-6 shadow-lg">
          <div className="h-4 w-32 bg-muted animate-pulse rounded mb-5"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex justify-between items-center p-3 bg-background/50 rounded-lg border border-border/30">
                <div className="flex items-center gap-3">
                  <div className="h-5 w-16 bg-primary/20 animate-pulse rounded"></div>
                  <div className="h-3 w-16 bg-muted animate-pulse rounded"></div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-5 w-16 bg-muted animate-pulse rounded"></div>
                  <div className="h-5 w-20 bg-emerald-400/20 animate-pulse rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
