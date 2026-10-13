export default function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700 ${className}`} />
}

export function CardSkeleton() {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm dark:bg-gray-800">
      <Skeleton className="mb-3 h-48 w-full rounded-xl" />
      <Skeleton className="mb-2 h-5 w-3/4" />
      <Skeleton className="mb-2 h-4 w-1/2" />
      <Skeleton className="h-4 w-1/3" />
    </div>
  )
}