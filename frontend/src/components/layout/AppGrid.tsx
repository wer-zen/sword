import { Skeleton } from "@heroui/react";
import { AppCard } from "../ui/AppCard";
import { useApps } from "../../hooks/useApps";

export function AppGrid() {
  const { apps, isLoading } = useApps({});

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton
            key={i}
            className="rounded-xl h-[189px]"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {apps.map((entry) => (
        <AppCard key={entry.id} entry={entry} />
      ))}
    </div>
  );
}
