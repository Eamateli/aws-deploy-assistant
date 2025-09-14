import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

// Accessibility Context
const AccessibilityContext = createContext();

export const AccessibilityProvider = ({ children }) => {
  const [focusVisible, setFocusVisible] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [fontSize, setFontSize] = useState('normal');

  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
    
    const handleChange = (e) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    // Check for high contrast preference
    const mediaQuery = window.matchMedia('(prefers-contrast: high)');
    setHighContrast(mediaQuery.matches);
    
    const handleChange = (e) => setHighContrast(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const announce = (message, priority = 'polite') => {
    const id = Date.now();
    setAnnouncements(prev => [...prev, { id, message, priority }]);
    
    // Remove announcement after it's been read
    setTimeout(() => {
      setAnnouncements(prev => prev.filter(a => a.id !== id));
    }, 1000);
  };

  const value = {
    focusVisible,
    setFocusVisible,
    announcements,
    announce,
    reducedMotion,
    highContrast,
    fontSize,
    setFontSize
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
      <LiveRegion announcements={announcements} />
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
};

// Live region for screen reader announcements
const LiveRegion = ({ announcements }) => {
  return (
    <div className="sr-only">
      {announcements.map(({ id, message, priority }) => (
        <div
          key={id}
          aria-live={priority}
          aria-atomic="true"
        >
          {message}
        </div>
      ))}
    </div>
  );
};

// Focus management hook
export const useFocusManagement = () => {
  const focusableSelectors = [
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    'a[href]',
    '[tabindex]:not([tabindex="-1"])'
  ].join(', ');

  const getFocusableElements = (container = document) => {
    return Array.from(container.querySelectorAll(focusableSelectors));
  };

  const trapFocus = (container) => {
    const focusableElements = getFocusableElements(container);
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    firstElement?.focus();

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  };

  return { getFocusableElements, trapFocus };
};

// Keyboard navigation hook
export const useKeyboardNavigation = (items, options = {}) => {
  const {
    orientation = 'vertical',
    loop = true,
    onSelect,
    disabled = false
  } = options;

  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef(null);

  const handleKeyDown = (e) => {
    if (disabled || items.length === 0) return;

    const isVertical = orientation === 'vertical';
    const nextKey = isVertical ? 'ArrowDown' : 'ArrowRight';
    const prevKey = isVertical ? 'ArrowUp' : 'ArrowLeft';

    switch (e.key) {
      case nextKey:
        e.preventDefault();
        setActiveIndex(prev => {
          const next = prev + 1;
          return loop ? next % items.length : Math.min(next, items.length - 1);
        });
        break;

      case prevKey:
        e.preventDefault();
        setActiveIndex(prev => {
          const next = prev - 1;
          return loop ? (next < 0 ? items.length - 1 : next) : Math.max(next, 0);
        });
        break;

      case 'Home':
        e.preventDefault();
        setActiveIndex(0);
        break;

      case 'End':
        e.preventDefault();
        setActiveIndex(items.length - 1);
        break;

      case 'Enter':
      case ' ':
        e.preventDefault();
        if (activeIndex >= 0 && onSelect) {
          onSelect(items[activeIndex], activeIndex);
        }
        break;

      case 'Escape':
        setActiveIndex(-1);
        break;
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('keydown', handleKeyDown);
      return () => container.removeEventListener('keydown', handleKeyDown);
    }
  }, [activeIndex, items, disabled]);

  return {
    activeIndex,
    setActiveIndex,
    containerRef,
    getItemProps: (index) => ({
      'aria-selected': activeIndex === index,
      tabIndex: activeIndex === index ? 0 : -1,
      role: 'option'
    })
  };
};

// Skip link component
export const SkipLink = ({ href = '#main-content', children = 'Skip to main content' }) => {
  return (
    <a
      href={href}
      className="
        sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 
        bg-blue-600 text-white px-4 py-2 rounded-md z-50
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
      "
    >
      {children}
    </a>
  );
};

// Accessible button component
export const AccessibleButton = ({ 
  children, 
  onClick,
  disabled = false,
  ariaLabel,
  ariaDescribedBy,
  className = '',
  ...props 
}) => {
  const { announce } = useAccessibility();
  const buttonRef = useRef(null);

  const handleClick = (e) => {
    if (onClick) {
      onClick(e);
      if (ariaLabel) {
        announce(`${ariaLabel} activated`);
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick(e);
    }
  };

  return (
    <button
      ref={buttonRef}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      className={`
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
};

// Accessible form field component
export const AccessibleField = ({
  label,
  id,
  error,
  description,
  required = false,
  children,
  className = ''
}) => {
  const errorId = error ? `${id}-error` : undefined;
  const descriptionId = description ? `${id}-description` : undefined;
  const ariaDescribedBy = [errorId, descriptionId].filter(Boolean).join(' ');

  return (
    <div className={`space-y-2 ${className}`}>
      <label 
        htmlFor={id}
        className="block text-sm font-medium text-gray-700"
      >
        {label}
        {required && (
          <span className="text-red-500 ml-1" aria-label="required">*</span>
        )}
      </label>
      
      {description && (
        <p id={descriptionId} className="text-sm text-gray-600">
          {description}
        </p>
      )}
      
      {React.cloneElement(children, {
        id,
        'aria-describedby': ariaDescribedBy || undefined,
        'aria-invalid': error ? 'true' : undefined,
        required
      })}
      
      {error && (
        <p id={errorId} className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

// Screen reader only text
export const ScreenReaderOnly = ({ children, className = '' }) => {
  return (
    <span className={`sr-only ${className}`}>
      {children}
    </span>
  );
};

// Accessible modal component
export const AccessibleModal = ({ 
  isOpen, 
  onClose, 
  title, 
  children,
  className = '' 
}) => {
  const modalRef = useRef(null);
  const { trapFocus } = useFocusManagement();
  const { announce } = useAccessibility();

  useEffect(() => {
    if (isOpen) {
      announce(`${title} dialog opened`);
      const cleanup = trapFocus(modalRef.current);
      
      const handleEscape = (e) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      
      document.addEventListener('keydown', handleEscape);
      
      return () => {
        cleanup();
        document.removeEventListener('keydown', handleEscape);
        announce(`${title} dialog closed`);
      };
    }
  }, [isOpen, title, onClose, announce, trapFocus]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
        aria-hidden="true"
      />
      
      <div 
        ref={modalRef}
        className={`
          relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4
          focus:outline-none
          ${className}
        `}
      >
        <div className="p-6">
          <h2 id="modal-title" className="text-lg font-semibold mb-4">
            {title}
          </h2>
          {children}
        </div>
      </div>
    </div>
  );
};

export default AccessibilityProvider;