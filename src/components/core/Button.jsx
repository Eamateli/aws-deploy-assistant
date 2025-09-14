import React from 'react';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  loading = false, 
  disabled = false,
  icon = null,
  className = '',
  onClick,
  ...props 
}) => {
  const baseClasses = 'font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2';
  
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-900 focus:ring-gray-500',
    success: 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  const disabledClasses = disabled || loading ? 'opacity-50 cursor-not-allowed' : '';
  
  const buttonClasses = `
    ${baseClasses}
    ${variants[variant]}
    ${sizes[size]}
    ${disabledClasses}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  const handleClick = (e) => {
    if (disabled || loading) return;
    if (onClick) onClick(e);
  };

  return (
    <button
      className={buttonClasses}
      onClick={handleClick}
      disabled={disabled || loading}
      aria-disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span data-testid="loading-spinner" className="mr-2">
          ⏳
        </span>
      )}
      {icon && !loading && (
        <span className="mr-2">
          {icon}
        </span>
      )}
      {children}
    </button>
  );
};

export default Button;