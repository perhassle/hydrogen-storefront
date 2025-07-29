import {useWishlist} from '~/lib/wishlist-context';
import {useAside} from '~/components/Aside';

export function WishlistIcon() {
  const {items} = useWishlist();
  const {open} = useAside();
  
  // Handle SSR case where items might be undefined
  const wishlistItems = items || [];
  const count = wishlistItems.length;

  return (
    <button
      className="wishlist-icon reset"
      onClick={() => open('wishlist')}
      aria-label={`Wishlist with ${count} items`}
    >
      <svg
        className="w-6 h-6"
        fill="none"
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
      {count > 0 && (
        <span className="wishlist-count">{count}</span>
      )}
    </button>
  );
}