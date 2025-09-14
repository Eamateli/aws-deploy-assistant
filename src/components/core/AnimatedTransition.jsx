import React from 'react';

// Smooth transition wrapper component
const AnimatedTransition = ({ 
  children, 
  type = 'fade',
  duration = 300,
  delay = 0,
  className = '',
  ...props 
}) => {
  const getTransitionClasses = () => {
    const baseClasses = `transition-all duration-${duration} ease-in-out`;
    
    switch (type) {
      case 'fade':
        return `${baseClasses} opacity-0 animate-fade-in`;
      case 'slide-up':
        return `${baseClasses} transform translate-y-4 opacity-0 animate-slide-up`;
      case 'slide-down':
        return `${baseClasses} transform -translate-y-4 opacity-0 animate-slide-down`;
      case 'slide-left':
        return `${baseClasses} transform translate-x-4 opacity-0 animate-slide-left`;
      case 'slide-right':
        return `${baseClasses} transform -translate-x-4 opacity-0 animate-slide-right`;
      case 'scale':
        return `${baseClasses} transform scale-95 opacity-0 animate-scale-in`;
      case 'bounce':
        return `${baseClasses} transform scale-95 opacity-0 animate-bounce-in`;
      default:
        return baseClasses;
    }
  };

  return (
    <div 
      className={`${getTransitionClasses()} ${className}`}
      style={{ 
        animationDelay: `${delay}ms`,
        animationFillMode: 'forwards'
      }}
      {...props}
    >
      {children}
    </div>
  );
};

// Staggered animation for lists
export const StaggeredList = ({ children, staggerDelay = 100, className = '' }) => {
  return (
    <div className={className}>
      {React.Children.map(children, (child, index) => (
        <AnimatedTransition
          type="slide-up"
          delay={index * staggerDelay}
          key={index}
        >
          {child}
        </AnimatedTransition>
      ))}
    </div>
  );
};

// Page transition wrapper
export const PageTransition = ({ children, className = '' }) => {
  return (
    <AnimatedTransition
      type="fade"
      duration={400}
      className={`min-h-screen ${className}`}
    >
      {children}
    </AnimatedTransition>
  );
};

// Loading state transition
export const LoadingTransition = ({ isLoading, children, fallback }) => {
  return (
    <div className="relative">
      <AnimatedTransition
        type="fade"
        className={isLoading ? 'opacity-0 pointer-events-none' : 'opacity-100'}
      >
        {children}
      </AnimatedTransition>
      
      {isLoading && (
        <AnimatedTransition
          type="fade"
          className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90"
        >
          {fallback}
        </AnimatedTransition>
      )}
    </div>
  );
};

export default AnimatedTransition;