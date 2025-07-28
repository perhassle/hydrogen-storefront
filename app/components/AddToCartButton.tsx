import {type FetcherWithComponents} from 'react-router';
import {CartForm, type OptimisticCartLineInput} from '@shopify/hydrogen';
import {LoadingButton} from './Skeleton/LoadingButton';

export function AddToCartButton({
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
          <LoadingButton
            type="submit"
            onClick={onClick}
            loading={fetcher.state !== 'idle'}
            loadingText="Adding..."
            disabled={disabled}
            variant="primary"
            className="w-full"
          >
            {children}
          </LoadingButton>
        </>
      )}
    </CartForm>
  );
}
