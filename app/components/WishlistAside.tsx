import {Aside} from '~/components/Aside';
import {useWishlist} from '~/lib/wishlist-context';
import {Link} from 'react-router';
import {CartForm, type OptimisticCartLineInput} from '@shopify/hydrogen';
import type {WishlistItem} from '~/lib/wishlist-context';

export function WishlistAside() {
  const {items, removeFromWishlist} = useWishlist();
  
  // Handle SSR case where items might be undefined
  const wishlistItems = items || [];
  
  const handleAddToCart = (item: WishlistItem) => {
    // Remove from wishlist when cart form is submitted
    removeFromWishlist(item.productId);
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
                <CartForm
                  route="/cart"
                  inputs={{
                    lines: wishlistItems.map(item => ({
                      merchandiseId: item.variantId,
                      quantity: 1,
                    } as OptimisticCartLineInput))
                  }}
                  action={CartForm.ACTIONS.LinesAdd}
                >
                  {(fetcher) => (
                    <button
                      type="submit"
                      className="add-all-btn"
                      disabled={fetcher.state !== 'idle'}
                      onClick={() => {
                        // Remove all items from wishlist after successful cart addition
                        wishlistItems.forEach(item => removeFromWishlist(item.productId));
                      }}
                    >
                      {fetcher.state !== 'idle' ? 'Adding All...' : 'Add All to Cart'}
                    </button>
                  )}
                </CartForm>
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
                      <CartForm
                        route="/cart"
                        inputs={{
                          lines: [{
                            merchandiseId: item.variantId,
                            quantity: 1,
                          } as OptimisticCartLineInput]
                        }}
                        action={CartForm.ACTIONS.LinesAdd}
                      >
                        {(fetcher) => (
                          <button
                            type="submit"
                            className="add-to-cart-btn"
                            disabled={fetcher.state !== 'idle'}
                            onClick={() => handleAddToCart(item)}
                          >
                            {fetcher.state !== 'idle' ? 'Adding...' : 'Add to Cart'}
                          </button>
                        )}
                      </CartForm>
                      
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