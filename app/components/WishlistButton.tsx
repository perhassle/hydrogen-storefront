import {useState} from 'react';
import {useWishlist, type WishlistItem} from '~/lib/wishlist-context';

interface WishlistButtonProps {
  product: {
    id: string;
    handle: string;
    title: string;
    featuredImage?: {
      url: string;
      altText?: string | null;
    } | null;
    priceRange?: {
      minVariantPrice: {
        amount: string;
        currencyCode: string;
      };
    };
  };
  selectedVariant?: {
    id: string;
    price: {
      amount: string;
      currencyCode: string;
    };
  } | null;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
}

export function WishlistButton({
  product,
  selectedVariant,
  className = '',
  size = 'md',
  showTooltip = true,
}: WishlistButtonProps) {
  const {addToWishlist, removeFromWishlist, isInWishlist} = useWishlist();
  const [isAnimating, setIsAnimating] = useState(false);
  
  const inWishlist = isInWishlist(product.id);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);

    if (inWishlist) {
      removeFromWishlist(product.id);
    } else {
      // Use selectedVariant if available, otherwise create a placeholder variant ID
      // This is a temporary solution - in a real app you'd fetch the first available variant
      const variantId = selectedVariant?.id || `${product.id}_default_variant`;
      
      const wishlistItem: Omit<WishlistItem, 'addedDate'> = {
        productId: product.id,
        productHandle: product.handle,
        productTitle: product.title,
        productImage: product.featuredImage?.url,
        price: selectedVariant?.price || product.priceRange?.minVariantPrice,
        variantId: variantId,
      };
      addToWishlist(wishlistItem);
    }
  };

  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  };

  const buttonClasses = `
    inline-flex items-center justify-center
    transition-all duration-200 ease-in-out
    hover:scale-125 hover:bg-red-50 hover:rounded-full
    active:scale-95
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500
    p-2 rounded-full
    cursor-pointer
    ${sizeClasses[size]}
    ${isAnimating ? 'animate-pulse' : ''}
    ${className}
  `;

  const heartClasses = `
    ${sizeClasses[size]}
    transition-all duration-200
    ${inWishlist 
      ? 'text-red-500 fill-current hover:text-red-600' 
      : 'text-gray-400 hover:text-red-500'
    }
  `;

  return (
    <button
      onClick={handleClick}
      className={buttonClasses}
      aria-label={
        inWishlist 
          ? `Remove ${product.title} from wishlist` 
          : `Add ${product.title} to wishlist`
      }
      title={
        showTooltip 
          ? (inWishlist ? 'Remove from wishlist' : 'Add to wishlist')
          : undefined
      }
    >
      <svg
        className={heartClasses}
        fill={inWishlist ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    </button>
  );
}