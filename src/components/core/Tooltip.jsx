import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { HelpCircle, Info, AlertCircle, CheckCircle } from 'lucide-react';

const Tooltip = ({ 
  children, 
  content, 
  position = 'top',
  trigger = 'hover',
  delay = 300,
  className = '',
  maxWidth = '200px',
  variant = 'default'
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);
  const tooltipRef = useRef(null);
  const timeoutRef = useRef(null);

  const showTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
      calculatePosition();
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  const calculatePosition = () => {
    if (!triggerRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current?.getBoundingClientRect() || { width: 0, height: 0 };
    
    let top, left;

    switch (position) {
      case 'top':
        top = triggerRect.top - tooltipRect.height - 8;
        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
        break;
      case 'bottom':
        top = triggerRect.bottom + 8;
        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
        break;
      case 'left':
        top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.left - tooltipRect.width - 8;
        break;
      case 'right':
        top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.right + 8;
        break;
      default:
        top = triggerRect.top - tooltipRect.height - 8;
        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
    }

    // Ensure tooltip stays within viewport
    const padding = 8;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    if (left < padding) left = padding;
    if (left + tooltipRect.width > viewportWidth - padding) {
      left = viewportWidth - tooltipRect.width - padding;
    }
    if (top < padding) top = padding;
    if (top + tooltipRect.height > viewportHeight - padding) {
      top = viewportHeight - tooltipRect.height - padding;
    }

    setTooltipPosition({ top, left });
  };

  useEffect(() => {
    if (isVisible) {
      calculatePosition();
    }
  }, [isVisible]);

  const getVariantClasses = () => {
    switch (variant) {
      case 'info':
        return 'bg-blue-900 text-blue-100 border-blue-700';
      case 'warning':
        return 'bg-yellow-900 text-yellow-100 border-yellow-700';
      case 'error':
        return 'bg-red-900 text-red-100 border-red-700';
      case 'success':
        return 'bg-green-900 text-green-100 border-green-700';
      default:
        return 'bg-gray-900 text-white border-gray-700';
    }
  };

  const getArrowClasses = () => {
    const baseClasses = 'absolute w-2 h-2 transform rotate-45';
    const variantClasses = getVariantClasses().split(' ')[0]; // Get background color
    
    switch (position) {
      case 'top':
        return `${baseClasses} ${variantClasses} top-full left-1/2 -translate-x-1/2 -translate-y-1/2`;
      case 'bottom':
        return `${baseClasses} ${variantClasses} bottom-full left-1/2 -translate-x-1/2 translate-y-1/2`;
      case 'left':
        return `${baseClasses} ${variantClasses} left-full top-1/2 -translate-x-1/2 -translate-y-1/2`;
      case 'right':
        return `${baseClasses} ${variantClasses} right-full top-1/2 translate-x-1/2 -translate-y-1/2`;
      default:
        return `${baseClasses} ${variantClasses} top-full left-1/2 -translate-x-1/2 -translate-y-1/2`;
    }
  };

  const triggerProps = trigger === 'hover' ? {
    onMouseEnter: showTooltip,
    onMouseLeave: hideTooltip,
    onFocus: showTooltip,
    onBlur: hideTooltip
  } : {
    onClick: () => setIsVisible(!isVisible)
  };

  return (
    <>
      <div
        ref={triggerRef}
        className={`inline-block ${className}`}
        {...triggerProps}
      >
        {children}
      </div>
      
      {isVisible && createPortal(
        <div
          ref={tooltipRef}
          className={`
            fixed z-50 px-3 py-2 text-sm rounded-lg border shadow-lg
            animate-fade-in pointer-events-none
            ${getVariantClasses()}
          `}
          style={{
            top: tooltipPosition.top,
            left: tooltipPosition.left,
            maxWidth
          }}
        >
          {content}
          <div className={getArrowClasses()} />
        </div>,
        document.body
      )}
    </>
  );
};

// Specialized tooltip components
export const HelpTooltip = ({ content, ...props }) => (
  <Tooltip content={content} variant="info" {...props}>
    <HelpCircle className="w-4 h-4 text-gray-400 hover:text-blue-500 cursor-help" />
  </Tooltip>
);

export const InfoTooltip = ({ content, ...props }) => (
  <Tooltip content={content} variant="info" {...props}>
    <Info className="w-4 h-4 text-blue-500 cursor-help" />
  </Tooltip>
);

export const WarningTooltip = ({ content, ...props }) => (
  <Tooltip content={content} variant="warning" {...props}>
    <AlertCircle className="w-4 h-4 text-yellow-500 cursor-help" />
  </Tooltip>
);

export const SuccessTooltip = ({ content, ...props }) => (
  <Tooltip content={content} variant="success" {...props}>
    <CheckCircle className="w-4 h-4 text-green-500 cursor-help" />
  </Tooltip>
);

export default Tooltip;