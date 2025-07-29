import {Link, type MetaFunction} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';
import {useWishlist} from '~/lib/wishlist-context';
import {WishlistButton} from '~/components/WishlistButton';

export const meta: MetaFunction = () => {
  return [
    {title: 'Wishlist | Hydrogen'},
    {description: 'Your saved products'},
  ];
};

export default function Wishlist() {
  const {items, clearWishlist} = useWishlist();

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Wishlist</h1>
        <div className="text-center py-16">
          <div className="mb-6">
            <svg
              className="mx-auto h-24 w-24 text-gray-300"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Your wishlist is empty
          </h2>
          <p className="text-gray-500 mb-6">
            Start adding products you love to your wishlist
          </p>
          <Link
            to="/collections/all"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-black hover:bg-gray-800 transition-colors"
          >
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Wishlist</h1>
        <div className="flex items-center space-x-4">
          <span className="text-gray-500">
            {items.length} {items.length === 1 ? 'item' : 'items'}
          </span>
          {items.length > 0 && (
            <button
              onClick={clearWishlist}
              className="text-sm text-red-600 hover:text-red-800 underline"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <div
            key={item.productId}
            className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="relative">
              <Link to={`/products/${item.productHandle}`}>
                {item.productImage ? (
                  <img
                    src={item.productImage}
                    alt={item.productTitle}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400">No image</span>
                  </div>
                )}
              </Link>
              <div className="absolute top-2 right-2">
                <WishlistButton
                  product={{
                    id: item.productId,
                    handle: item.productHandle,
                    title: item.productTitle,
                    featuredImage: item.productImage ? {
                      url: item.productImage,
                      altText: item.productTitle,
                    } : undefined,
                    priceRange: item.price ? {
                      minVariantPrice: item.price,
                    } : undefined,
                  }}
                  className="bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full p-2 shadow-sm"
                />
              </div>
            </div>
            
            <div className="p-4">
              <Link to={`/products/${item.productHandle}`}>
                <h3 className="font-semibold text-gray-900 hover:text-gray-700 mb-2">
                  {item.productTitle}
                </h3>
              </Link>
              
              {item.price && (
                <p className="text-lg font-medium text-gray-900 mb-3">
                  ${item.price.amount} {item.price.currencyCode}
                </p>
              )}
              
              <div className="space-y-2">
                <Link
                  to={`/products/${item.productHandle}`}
                  className="block w-full text-center px-4 py-2 bg-black text-white font-medium rounded-md hover:bg-gray-800 transition-colors"
                >
                  View Product
                </Link>
                
                <p className="text-xs text-gray-500 text-center">
                  Added {new Date(item.addedDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}