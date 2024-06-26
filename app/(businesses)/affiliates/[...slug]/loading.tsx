import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  // You can add any UI inside Loading, including a Skeleton.
  return (
    <div className="grid grid-cols-3 gap-3 min-h-[100vh]">
      <Skeleton className="h-full w-full col-span-1" />
      <div className="col-span-2 h-full">
        <Skeleton className="h-full w-full" />
      </div>
    </div>
  );
}
