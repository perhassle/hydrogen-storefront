import {type FetcherWithComponents} from 'react-router';
import {CartForm, type OptimisticCartLineInput} from '@shopify/hydrogen';

export function BuyNowButton({
  analytics,
  children,
  disabled,
  lines,
  onClick,
}: {
  analytics?: unknown;
  children: React.ReactNode;
  disabled?: boolean;
  lines: Array<OptimisticCartLineInput>;
  onClick?: () => void;
}) {
  return (
    <CartForm route="/cart" inputs={{lines}} action={CartForm.ACTIONS.LinesAdd}>
      {(fetcher: FetcherWithComponents<any>) => (
        <>
          <input
            name="analytics"
            type="hidden"
            value={JSON.stringify(analytics)}
          />
          <button
            type="submit"
            onClick={() => {
              onClick?.();
              // Navigate directly to checkout after adding to cart
              const navigate = useNavigate();
              setTimeout(() => {
                navigate('/cart');
              }, 100);
            }}
            disabled={disabled ?? fetcher.state !== 'idle'}
            className="buy-now-btn"
          >
            {children}
          </button>
        </>
      )}
    </CartForm>
  );
}