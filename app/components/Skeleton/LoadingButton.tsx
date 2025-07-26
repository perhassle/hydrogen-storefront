import * as React from 'react';
import {LoadingSpinner} from './LoadingSpinner';

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  loading?: boolean;
  loadingText?: string;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export function LoadingButton({
  children,
  loading = false,
  loadingText,
  variant = 'primary',
  size = 'md',
  disabled,
  className = '',
  ...props
}: LoadingButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-lg transition-colors duration-200 disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: 'bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-900',
    danger: 'bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white'
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  };

  const buttonClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;
  const isDisabled = disabled || loading;

  return (
    <button 
      {...props}
      disabled={isDisabled}
      className={buttonClasses}
    >
      {loading && (
        <LoadingSpinner 
          size={size === 'lg' ? 'md' : 'sm'} 
          className="mr-2"
        />
      )}
      {loading && loadingText ? loadingText : children}
    </button>
  );
}