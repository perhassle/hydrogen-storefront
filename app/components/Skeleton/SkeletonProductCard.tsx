export function SkeletonProductCard() {
  return (
    <div className="product-item animate-pulse">
      {/* Image skeleton with border treatment */}
      <div className="bg-gray-200 aspect-square rounded-md mb-3 product-item-image-container"></div>
      
      {/* Title skeleton */}
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      </div>
    </div>
  );
}