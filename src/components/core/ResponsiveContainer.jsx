import React, { useState, useEffect } from 'react';

// Hook for responsive breakpoints
export const useResponsive = () => {
  const [screenSize, setScreenSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768
  });

  useEffect(() => {
    const handleResize = () => {
      setScreenSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const breakpoints = {
    xs: screenSize.width < 480,
    sm: screenSize.width >= 480 && screenSize.width < 768,
    md: screenSize.width >= 768 && screenSize.width < 1024,
    lg: screenSize.width >= 1024 && screenSize.width < 1280,
    xl: screenSize.width >= 1280,
    mobile: screenSize.width < 768,
    tablet: screenSize.width >= 768 && screenSize.width < 1024,
    desktop: screenSize.width >= 1024
  };

  return {
    ...breakpoints,
    screenSize,
    isMobile: breakpoints.mobile,
    isTablet: breakpoints.tablet,
    isDesktop: breakpoints.desktop
  };
};

// Responsive container component
const ResponsiveContainer = ({ 
  children, 
  className = '',
  mobileClass = '',
  tabletClass = '',
  desktopClass = '',
  ...props 
}) => {
  const { isMobile, isTablet, isDesktop } = useResponsive();

  const getResponsiveClass = () => {
    if (isMobile && mobileClass) return mobileClass;
    if (isTablet && tabletClass) return tabletClass;
    if (isDesktop && desktopClass) return desktopClass;
    return '';
  };

  return (
    <div 
      className={`${className} ${getResponsiveClass()}`}
      {...props}
    >
      {children}
    </div>
  );
};

// Mobile-optimized grid component
export const ResponsiveGrid = ({ 
  children, 
  cols = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 4,
  className = '' 
}) => {
  const { isMobile, isTablet } = useResponsive();

  const getGridCols = () => {
    if (isMobile) return cols.mobile;
    if (isTablet) return cols.tablet;
    return cols.desktop;
  };

  const gridClass = `grid grid-cols-${getGridCols()} gap-${gap}`;

  return (
    <div className={`${gridClass} ${className}`}>
      {children}
    </div>
  );
};

// Mobile navigation component
export const MobileNavigation = ({ 
  isOpen, 
  onClose, 
  children,
  className = '' 
}) => {
  const { isMobile } = useResponsive();

  if (!isMobile) return null;

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onClose}
        />
      )}
      
      {/* Mobile menu */}
      <div className={`
        fixed top-0 right-0 h-full w-80 max-w-full bg-white shadow-xl z-50
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        ${className}
      `}>
        {children}
      </div>
    </>
  );
};

// Responsive text component
export const ResponsiveText = ({ 
  children,
  size = { mobile: 'text-sm', tablet: 'text-base', desktop: 'text-lg' },
  className = ''
}) => {
  const { isMobile, isTablet } = useResponsive();

  const getTextSize = () => {
    if (isMobile) return size.mobile;
    if (isTablet) return size.tablet;
    return size.desktop;
  };

  return (
    <span className={`${getTextSize()} ${className}`}>
      {children}
    </span>
  );
};

// Touch-friendly button for mobile
export const TouchButton = ({ 
  children, 
  className = '',
  size = 'md',
  ...props 
}) => {
  const { isMobile } = useResponsive();

  const getSizeClass = () => {
    const baseSize = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg'
    };

    const mobileSize = {
      sm: 'px-4 py-3 text-sm',
      md: 'px-6 py-4 text-base',
      lg: 'px-8 py-5 text-lg'
    };

    return isMobile ? mobileSize[size] : baseSize[size];
  };

  return (
    <button
      className={`
        ${getSizeClass()}
        min-h-[44px] // iOS minimum touch target
        rounded-lg font-medium transition-colors
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
};

// Responsive spacing component
export const ResponsiveSpacing = ({ 
  children,
  spacing = { mobile: 4, tablet: 6, desktop: 8 },
  direction = 'y',
  className = ''
}) => {
  const { isMobile, isTablet } = useResponsive();

  const getSpacing = () => {
    const space = isMobile ? spacing.mobile : isTablet ? spacing.tablet : spacing.desktop;
    return direction === 'y' ? `space-y-${space}` : `space-x-${space}`;
  };

  return (
    <div className={`${getSpacing()} ${className}`}>
      {children}
    </div>
  );
};

// Responsive image component
export const ResponsiveImage = ({
  src,
  alt,
  sizes = { mobile: '100vw', tablet: '50vw', desktop: '33vw' },
  className = ''
}) => {
  const { isMobile, isTablet } = useResponsive();

  const getImageSize = () => {
    if (isMobile) return sizes.mobile;
    if (isTablet) return sizes.tablet;
    return sizes.desktop;
  };

  return (
    <img
      src={src}
      alt={alt}
      className={`w-full h-auto object-cover ${className}`}
      style={{ maxWidth: getImageSize() }}
      loading="lazy"
    />
  );
};

export default ResponsiveContainer;