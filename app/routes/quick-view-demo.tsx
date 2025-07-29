import {ProductItem} from '~/components/ProductItem';

// Mock product data for quick view demo
const mockProducts = [
  {
    id: 'demo-product-1',
    title: 'Eco-Friendly T-Shirt',
    vendor: 'Green Fashion',
    handle: 'eco-friendly-t-shirt',
    description: 'Made from 100% organic cotton, this comfortable t-shirt is perfect for everyday wear.',
    descriptionHtml: '<p>Made from 100% organic cotton, this comfortable t-shirt is perfect for everyday wear. Features include:</p><ul><li>100% organic cotton</li><li>Soft and breathable</li><li>Machine washable</li><li>Available in multiple colors</li></ul>',
    availableForSale: true,
    featuredImage: {
      id: 'image-1',
      url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop',
      altText: 'Eco-Friendly T-Shirt',
      width: 400,
      height: 400,
    },
    images: {
      nodes: [
        {
          id: 'image-1',
          url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop',
          altText: 'Eco-Friendly T-Shirt - Front View',
          width: 400,
          height: 400,
        },
        {
          id: 'image-1-back',
          url: 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=400&h=400&fit=crop',
          altText: 'Eco-Friendly T-Shirt - Back View',
          width: 400,
          height: 400,
        },
        {
          id: 'image-1-detail',
          url: 'https://images.unsplash.com/photo-1503341960582-b45751874cf0?w=400&h=400&fit=crop',
          altText: 'Eco-Friendly T-Shirt - Fabric Detail',
          width: 400,
          height: 400,
        },
      ],
    },
    priceRange: {
      minVariantPrice: {
        amount: '29.99',
        currencyCode: 'USD',
      },
    },
    variants: {
      nodes: [
        {
          id: 'variant-1',
          availableForSale: true,
          quantityAvailable: 15,
        }
      ]
    },
    options: [
      {
        name: 'Size',
        optionValues: [
          {
            name: 'Small',
            firstSelectableVariant: {
              id: 'variant-1-s',
              availableForSale: true,
              price: { amount: '29.99', currencyCode: 'USD' },
              image: {
                id: 'image-1',
                url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop',
                altText: 'Eco-Friendly T-Shirt',
                width: 400,
                height: 400,
              },
              product: {
                title: 'Eco-Friendly T-Shirt',
                handle: 'eco-friendly-t-shirt',
              },
              selectedOptions: [{ name: 'Size', value: 'Small' }],
            },
          },
          {
            name: 'Medium',
            firstSelectableVariant: {
              id: 'variant-1-m',
              availableForSale: true,
              price: { amount: '29.99', currencyCode: 'USD' },
              image: {
                id: 'image-1',
                url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop',
                altText: 'Eco-Friendly T-Shirt',
                width: 400,
                height: 400,
              },
              product: {
                title: 'Eco-Friendly T-Shirt',
                handle: 'eco-friendly-t-shirt',
              },
              selectedOptions: [{ name: 'Size', value: 'Medium' }],
            },
          },
        ],
      },
    ],
    selectedOrFirstAvailableVariant: {
      id: 'variant-1-m',
      availableForSale: true,
      quantityAvailable: 15,
      price: { amount: '29.99', currencyCode: 'USD' },
      compareAtPrice: null,
      image: {
        id: 'image-1',
        url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop',
        altText: 'Eco-Friendly T-Shirt',
        width: 400,
        height: 400,
      },
      product: {
        title: 'Eco-Friendly T-Shirt',
        handle: 'eco-friendly-t-shirt',
      },
      selectedOptions: [{ name: 'Size', value: 'Medium' }],
    },
    adjacentVariants: [],
    seo: {
      title: 'Eco-Friendly T-Shirt',
      description: 'Made from 100% organic cotton',
    },
  },
  {
    id: 'demo-product-2',
    title: 'Wireless Headphones',
    vendor: 'TechSound',
    handle: 'wireless-headphones',
    description: 'Premium wireless headphones with noise cancellation and 30-hour battery life.',
    descriptionHtml: '<p>Premium wireless headphones with noise cancellation and 30-hour battery life. Features include:</p><ul><li>Active noise cancellation</li><li>30-hour battery life</li><li>Bluetooth 5.0</li><li>Quick charge capability</li></ul>',
    availableForSale: true,
    featuredImage: {
      id: 'image-2',
      url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
      altText: 'Wireless Headphones',
      width: 400,
      height: 400,
    },
    images: {
      nodes: [
        {
          id: 'image-2',
          url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
          altText: 'Wireless Headphones - Black',
          width: 400,
          height: 400,
        },
        {
          id: 'image-2-side',
          url: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=400&h=400&fit=crop',
          altText: 'Wireless Headphones - Side View',
          width: 400,
          height: 400,
        },
      ],
    },
    priceRange: {
      minVariantPrice: {
        amount: '199.99',
        currencyCode: 'USD',
      },
    },
    variants: {
      nodes: [
        {
          id: 'variant-2',
          availableForSale: true,
          quantityAvailable: 3,
        }
      ]
    },
    options: [
      {
        name: 'Color',
        optionValues: [
          {
            name: 'Black',
            firstSelectableVariant: {
              id: 'variant-2-black',
              availableForSale: true,
              price: { amount: '199.99', currencyCode: 'USD' },
              image: {
                id: 'image-2',
                url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
                altText: 'Wireless Headphones',
                width: 400,
                height: 400,
              },
              product: {
                title: 'Wireless Headphones',
                handle: 'wireless-headphones',
              },
              selectedOptions: [{ name: 'Color', value: 'Black' }],
            },
          },
        ],
      },
    ],
    selectedOrFirstAvailableVariant: {
      id: 'variant-2-black',
      availableForSale: true,
      quantityAvailable: 3,
      price: { amount: '199.99', currencyCode: 'USD' },
      compareAtPrice: { amount: '249.99', currencyCode: 'USD' },
      image: {
        id: 'image-2',
        url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
        altText: 'Wireless Headphones',
        width: 400,
        height: 400,
      },
      product: {
        title: 'Wireless Headphones',
        handle: 'wireless-headphones',
      },
      selectedOptions: [{ name: 'Color', value: 'Black' }],
    },
    adjacentVariants: [],
    seo: {
      title: 'Wireless Headphones',
      description: 'Premium wireless headphones with noise cancellation',
    },
  },
  {
    id: 'demo-product-3',
    title: 'Smart Water Bottle',
    vendor: 'HydroTech',
    handle: 'smart-water-bottle',
    description: 'Track your hydration with this smart water bottle that connects to your phone.',
    descriptionHtml: '<p>Track your hydration with this smart water bottle that connects to your phone. Features include:</p><ul><li>Hydration tracking</li><li>Temperature control</li><li>Mobile app integration</li><li>LED indicators</li></ul>',
    availableForSale: false,
    featuredImage: {
      id: 'image-3',
      url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop',
      altText: 'Smart Water Bottle',
      width: 400,
      height: 400,
    },
    priceRange: {
      minVariantPrice: {
        amount: '89.99',
        currencyCode: 'USD',
      },
    },
    variants: {
      nodes: [
        {
          id: 'variant-3',
          availableForSale: false,
          quantityAvailable: 0,
        }
      ]
    },
    options: [],
    selectedOrFirstAvailableVariant: {
      id: 'variant-3-blue',
      availableForSale: false,
      quantityAvailable: 0,
      price: { amount: '89.99', currencyCode: 'USD' },
      compareAtPrice: null,
      image: {
        id: 'image-3',
        url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop',
        altText: 'Smart Water Bottle',
        width: 400,
        height: 400,
      },
      product: {
        title: 'Smart Water Bottle',
        handle: 'smart-water-bottle',
      },
      selectedOptions: [],
    },
    adjacentVariants: [],
    seo: {
      title: 'Smart Water Bottle',
      description: 'Track your hydration with this smart water bottle',
    },
  },
];

export default function QuickViewDemo() {
  return (
    <div className="quick-view-demo-page">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-6">Quick View Demo</h1>
        <p className="text-gray-600 mb-8">
          Hover over product images and click "Quick View" to test the quick view modal functionality.
        </p>
        
        <div className="products-grid">
          {mockProducts.map((product) => (
            <ProductItem
              key={product.id}
              product={product as any}
              loading="eager"
              enableLazyLoading={false}
            />
          ))}
        </div>
      </div>
    </div>
  );
}