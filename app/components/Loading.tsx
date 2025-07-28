import {Suspense} from 'react';

export function LoadingSpinner() {
  return (
    <div className="loading-spinner">
      <div className="spinner" />
      <span>Loading...</span>
    </div>
  );
}

export function LoadingPlaceholder({
  height = '200px',
  children,
}: {
  height?: string;
  children?: React.ReactNode;
}) {
  return (
    <div 
      className="loading-placeholder"
      style={{
        height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: '4px',
        color: '#999',
      }}
    >
      {children || <LoadingSpinner />}
    </div>
  );
}

export function LazyWrapper({
  children,
  fallback,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  return (
    <Suspense fallback={fallback || <LoadingPlaceholder />}>
      {children}
    </Suspense>
  );
}