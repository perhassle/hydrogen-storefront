import {
  SkeletonProductGrid,
  SkeletonProductCard,
  LoadingSpinner,
  LoadingButton,
  ErrorBoundary,
} from '~/components/Skeleton';
import {useState} from 'react';

export default function LoadingStatesDemo() {
  const [isLoading, setIsLoading] = useState(false);
  const [showError, setShowError] = useState(false);

  const simulateLoading = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 3000);
  };

  const ErrorComponent = () => {
    if (showError) {
      throw new Error('This is a demo error to test the error boundary');
    }
    return null;
  };

  return (
    <div className="demo-page p-6 space-y-8">
      <h1 className="text-3xl font-bold mb-6">Loading States Demo</h1>
      
      {/* Loading Buttons Demo */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Loading Buttons</h2>
        <div className="flex gap-4 flex-wrap">
          <LoadingButton
            variant="primary"
            loading={isLoading}
            loadingText="Adding..."
            onClick={simulateLoading}
          >
            Add to Cart
          </LoadingButton>
          
          <LoadingButton
            variant="secondary"
            loading={isLoading}
            loadingText="Updating..."
            onClick={simulateLoading}
          >
            Update Quantity
          </LoadingButton>
          
          <LoadingButton
            variant="danger"
            loading={isLoading}
            loadingText="Removing..."
            onClick={simulateLoading}
          >
            Remove Item
          </LoadingButton>
        </div>
      </section>

      {/* Loading Spinners Demo */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Loading Spinners</h2>
        <div className="flex gap-4 items-center">
          <div className="flex items-center gap-2">
            <LoadingSpinner size="sm" />
            <span>Small</span>
          </div>
          <div className="flex items-center gap-2">
            <LoadingSpinner size="md" />
            <span>Medium</span>
          </div>
          <div className="flex items-center gap-2">
            <LoadingSpinner size="lg" />
            <span>Large</span>
          </div>
        </div>
      </section>

      {/* Skeleton Components Demo */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Skeleton Loaders</h2>
        
        <h3 className="text-lg font-medium">Single Product Card</h3>
        <div className="max-w-xs">
          <SkeletonProductCard />
        </div>
        
        <h3 className="text-lg font-medium">Product Grid (4 items)</h3>
        <SkeletonProductGrid count={4} />
      </section>

      {/* Error Boundary Demo */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Error Boundary</h2>
        <button
          onClick={() => setShowError(!showError)}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
        >
          {showError ? 'Hide Error' : 'Trigger Error'}
        </button>
        
        <ErrorBoundary>
          <div className="p-4 border border-gray-200 rounded">
            <p>This content is wrapped in an error boundary.</p>
            <ErrorComponent />
          </div>
        </ErrorBoundary>
      </section>

      {/* Real-world Example */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Real-world Example: Product Collection</h2>
        <p className="text-gray-600">
          This shows how the skeleton loader would appear while fetching products from an API:
        </p>
        
        <ErrorBoundary>
          {isLoading ? (
            <SkeletonProductGrid count={8} />
          ) : (
            <div className="products-grid">
              {Array.from({length: 8}, (_, i) => (
                <div key={i} className="product-item bg-white border rounded-lg p-4 shadow-sm">
                  <div className="bg-gray-100 aspect-square rounded mb-3 flex items-center justify-center">
                    <span className="text-gray-400">Product {i + 1}</span>
                  </div>
                  <h4 className="font-semibold mb-2">Sample Product {i + 1}</h4>
                  <p className="text-green-600 font-bold">$99.99</p>
                </div>
              ))}
            </div>
          )}
        </ErrorBoundary>
        
        <button
          onClick={simulateLoading}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Simulate Loading
        </button>
      </section>
    </div>
  );
}