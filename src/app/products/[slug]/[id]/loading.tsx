export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="animate-pulse">
        <div className="h-8 w-48 bg-neutral-200 rounded mb-8"></div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="aspect-square bg-neutral-200 rounded-lg"></div>
          <div className="space-y-4">
            <div className="h-8 bg-neutral-200 rounded w-3/4"></div>
            <div className="h-4 bg-neutral-200 rounded w-1/2"></div>
            <div className="h-6 bg-neutral-200 rounded w-1/4 mt-8"></div>
            <div className="h-12 bg-neutral-200 rounded w-full mt-4"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
