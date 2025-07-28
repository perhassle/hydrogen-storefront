import * as React from 'react';
import {Pagination} from '@shopify/hydrogen';
import {LoadingSpinner, useLoadingDelay} from './Skeleton';

/**
 * <PaginatedResourceSection > is a component that encapsulate how the previous and next behaviors throughout your application.
 */
export function PaginatedResourceSection<NodesType>({
  connection,
  children,
  resourcesClassName,
}: {
  connection: React.ComponentProps<typeof Pagination<NodesType>>['connection'];
  children: React.FunctionComponent<{node: NodesType; index: number}>;
  resourcesClassName?: string;
}) {
  return (
    <Pagination connection={connection}>
      {({nodes, isLoading, PreviousLink, NextLink}) => {
        const resourcesMarkup = nodes.map((node, index) =>
          children({node, index}),
        );

        return (
          <div>
            <PreviousLink>
              <PaginationLinkContent isLoading={isLoading} direction="previous" />
            </PreviousLink>
            {resourcesClassName ? (
              <div className={resourcesClassName}>{resourcesMarkup}</div>
            ) : (
              resourcesMarkup
            )}
            <NextLink>
              <PaginationLinkContent isLoading={isLoading} direction="next" />
            </NextLink>
          </div>
        );
      }}
    </Pagination>
  );
}

function PaginationLinkContent({ 
  isLoading, 
  direction 
}: { 
  isLoading: boolean; 
  direction: 'previous' | 'next';
}) {
  const showLoading = useLoadingDelay(isLoading);
  
  if (showLoading) {
    return (
      <span className="flex items-center gap-2">
        <LoadingSpinner size="sm" />
        Loading...
      </span>
    );
  }
  
  return direction === 'previous' ? 
    <span>↑ Load previous</span> : 
    <span>Load more ↓</span>;
}
