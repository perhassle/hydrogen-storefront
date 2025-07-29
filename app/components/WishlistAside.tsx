import {Aside} from '~/components/Aside';
import {useWishlist} from '~/lib/wishlist-context';
import {Link, useNavigate} from 'react-router';
import type {WishlistItem} from '~/lib/wishlist-context';

export function WishlistAside() {
  const {items, removeFromWishlist} = useWishlist();
  const navigate = useNavigate();
  
  // Handle SSR case where items might be undefined
  const wishlistItems = items || [];

  const handleAddToCart = (item: WishlistItem) => {
    // Remove from wishlist first
    removeFromWishlist(item.productId);
    
    // Navigate to product page with addToCart parameter
    navigate(`/products/${item.productHandle}?addToCart=true`);
  };

  const handleAddAllToCart = () => {
    // Add all items to cart and remove from wishlist
    wishlistItems.forEach((item) => {
      removeFromWishlist(item.productId);
    });
    
    // Navigate to cart page
    navigate('/cart');
    
    // Show feedback to user
    console.log(`Added ${wishlistItems.length} items to cart`);
  };

  return (
    <Aside type="wishlist" heading="WISHLIST">
      <div className="wishlist-aside">
        {wishlistItems.length === 0 ? (
          <div className="empty-wishlist">
            <p>Your wishlist is empty</p>
            <p>Add items to your wishlist to see them here.</p>
          </div>
        ) : (
          <>
            <div className="wishlist-header">
              <p>{wishlistItems.length} items in your wishlist</p>
              {wishlistItems.length > 1 && (
                <button
                  className="add-all-btn"
                  onClick={handleAddAllToCart}
                >
                  Add All to Cart
                </button>
              )}
            </div>
            
            <div className="wishlist-items">
              {wishlistItems.map((item) => (
                <div key={item.productId} className="wishlist-item">
                  <div className="item-image">
                    {item.productImage && (
                      <img
                        src={item.productImage}
                        alt={item.productTitle}
                        width="60"
                        height="60"
                      />
                    )}
                  </div>
                  
                  <div className="item-details">
                    <Link 
                      to={`/products/${item.productHandle}`}
                      className="item-title"
                    >
                      {item.productTitle}
                    </Link>
                    
                    {item.price && (
                      <p className="item-price">
                        {item.price.amount} {item.price.currencyCode}
                      </p>
                    )}
                    
                    <div className="item-actions">
                      <button
                        className="add-to-cart-btn"
                        onClick={() => handleAddToCart(item)}
                      >
                        Add to Cart
                      </button>
                      
                      <button
                        className="remove-btn"
                        onClick={() => removeFromWishlist(item.productId)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </Aside>
  );
}