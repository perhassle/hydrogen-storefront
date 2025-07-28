import {SkeletonProductCard} from './SkeletonProductCard';

interface SkeletonProductGridProps {
  count?: number;
  className?: string;
}

export function SkeletonProductGrid({ 
  count = 8, 
  className = "products-grid" 
}: SkeletonProductGridProps) {
  return (
    <div className={className}>
      {Array.from({ length: count }, (_, index) => (
        <SkeletonProductCard key={index} />
      ))}
    </div>
  );
}