import { dashboardSkeleton } from "./dashboard-ui";
import { cn } from "@/lib/utils";

function Bone({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-lg bg-stone-200/60", className)} />;
}

export function StatsCardsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className={cn(dashboardSkeleton, "h-[88px] p-3")}>
          <div className="flex gap-2.5">
            <Bone className="h-9 w-9 shrink-0 rounded-[12px]" />
            <div className="flex-1 space-y-2">
              <Bone className="h-2 w-14" />
              <Bone className="h-5 w-8" />
              <Bone className="h-2 w-16" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function TodayCardSkeleton() {
  return (
    <div className={cn(dashboardSkeleton, "p-5")}>
      <Bone className="mb-3 h-5 w-32" />
      <Bone className="mb-4 h-3 w-64" />
      <div className="grid gap-2 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Bone key={i} className="h-24 rounded-[18px]" />
        ))}
      </div>
    </div>
  );
}

export function ProjectsSectionSkeleton() {
  return (
    <div className={cn(dashboardSkeleton, "p-5")}>
      <div className="mb-4 flex justify-between">
        <div className="space-y-2">
          <Bone className="h-5 w-40" />
          <Bone className="h-3 w-48" />
        </div>
        <Bone className="h-8 w-20" />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-[20px] border border-stone-200/40 p-3">
            <Bone className="mb-3 h-[76px] w-full rounded-[12px]" />
            <Bone className="mb-2 h-4 w-3/4" />
            <Bone className="h-1.5 w-full rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function BottomCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className={cn(dashboardSkeleton, "h-40 p-4")}>
          <Bone className="mb-3 h-3.5 w-28" />
          <div className="space-y-2">
            <Bone className="h-9 w-full rounded-xl" />
            <Bone className="h-9 w-full rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SidebarCardsSkeleton() {
  return (
    <div className="space-y-3">
      <div className={cn(dashboardSkeleton, "h-52 p-4")}>
        <Bone className="mb-2 h-3.5 w-24" />
        <Bone className="mb-3 h-2 w-32" />
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 35 }).map((_, i) => (
            <Bone key={i} className="h-7 w-full rounded-full" />
          ))}
        </div>
      </div>
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className={cn(dashboardSkeleton, "h-32 p-4")}>
          <Bone className="mb-3 h-3.5 w-28" />
          <Bone className="h-8 w-full rounded-xl" />
        </div>
      ))}
    </div>
  );
}

export default function DashboardSkeletons() {
  return (
    <div className="space-y-6">
      <Bone className="h-16 w-full max-w-lg rounded-2xl" />
      <StatsCardsSkeleton />
      <div className="flex flex-col gap-5 xl:flex-row xl:gap-6">
        <div className="flex flex-1 flex-col gap-5">
          <TodayCardSkeleton />
          <ProjectsSectionSkeleton />
          <BottomCardsSkeleton />
        </div>
        <div className="w-full shrink-0 xl:w-[340px]">
          <SidebarCardsSkeleton />
        </div>
      </div>
    </div>
  );
}
