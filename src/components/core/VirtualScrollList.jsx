import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';

const VirtualScrollList = ({ 
  items, 
  itemHeight = 60, 
  containerHeight = 400, 
  renderItem, 
  className = '',
  overscan = 5 
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef(null);

  // Calculate visible items based on scroll position
  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );

    return { startIndex, endIndex };
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan]);

  // Get visible items
  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.startIndex, visibleRange.endIndex + 1);
  }, [items, visibleRange]);

  // Calculate total height and offset
  const totalHeight = items.length * itemHeight;
  const offsetY = visibleRange.startIndex * itemHeight;

  // Handle scroll events
  const handleScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop);
  }, []);

  // Scroll to specific item
  const scrollToItem = useCallback((index) => {
    if (containerRef.current) {
      const scrollTop = index * itemHeight;
      containerRef.current.scrollTop = scrollTop;
      setScrollTop(scrollTop);
    }
  }, [itemHeight]);

  return (
    <div
      ref={containerRef}
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map((item, index) => {
            const actualIndex = visibleRange.startIndex + index;
            return (
              <div
                key={item.id || actualIndex}
                style={{ height: itemHeight }}
                className="flex items-center"
              >
                {renderItem(item, actualIndex)}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Service list component using virtual scrolling
export const VirtualServiceList = ({ services, onServiceSelect, selectedService }) => {
  const renderServiceItem = useCallback((service, index) => (
    <div
      className={`
        w-full p-4 border-b border-gray-200 cursor-pointer transition-colors
        ${selectedService?.id === service.id ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'}
      `}
      onClick={() => onServiceSelect(service)}
    >
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
          <span className="text-blue-600 font-semibold text-sm">
            {service.name.charAt(0)}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 truncate">{service.name}</h4>
          <p className="text-sm text-gray-600 truncate">{service.purpose}</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-green-600">{service.cost}</p>
          <p className="text-xs text-gray-500">{service.category}</p>
        </div>
      </div>
    </div>
  ), [selectedService, onServiceSelect]);

  if (!services || services.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📋</span>
          </div>
          <p>No services available</p>
        </div>
      </div>
    );
  }

  return (
    <VirtualScrollList
      items={services}
      itemHeight={80}
      containerHeight={400}
      renderItem={renderServiceItem}
      className="border border-gray-200 rounded-lg"
    />
  );
};

// Recommendation list component using virtual scrolling
export const VirtualRecommendationList = ({ recommendations, onSelect, selectedId }) => {
  const renderRecommendationItem = useCallback((recommendation, index) => (
    <div
      className={`
        w-full p-6 border-b border-gray-200 cursor-pointer transition-all
        ${selectedId === recommendation.id ? 'bg-blue-50 border-blue-200 shadow-md' : 'hover:bg-gray-50 hover:shadow-sm'}
      `}
      onClick={() => onSelect(recommendation)}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{recommendation.name}</h3>
          <p className="text-gray-600 mt-1">{recommendation.description}</p>
        </div>
        {selectedId === recommendation.id && (
          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm">✓</span>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
        <div>
          <span className="font-medium text-gray-700">Complexity:</span>
          <div className="flex mt-1">
            {[1,2,3,4,5].map(i => (
              <div 
                key={i} 
                className={`w-2 h-2 rounded-full mr-1 ${
                  i <= recommendation.complexity ? 'bg-orange-400' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>
        
        <div>
          <span className="font-medium text-gray-700">Cost:</span>
          <p className="text-green-600 font-medium mt-1">
            ${recommendation.cost?.min}-${recommendation.cost?.max}/mo
          </p>
        </div>
        
        <div>
          <span className="font-medium text-gray-700">Setup Time:</span>
          <p className="text-gray-600 mt-1">{recommendation.deploymentTime}</p>
        </div>
        
        <div>
          <span className="font-medium text-gray-700">Scalability:</span>
          <div className="flex mt-1">
            {[1,2,3,4,5].map(i => (
              <div 
                key={i} 
                className={`w-2 h-2 rounded-full mr-1 ${
                  i <= recommendation.scalability ? 'bg-green-400' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {recommendation.services?.slice(0, 4).map((service, idx) => (
          <span 
            key={idx}
            className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
          >
            {service.name}
          </span>
        ))}
        {recommendation.services?.length > 4 && (
          <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-full">
            +{recommendation.services.length - 4} more
          </span>
        )}
      </div>
    </div>
  ), [selectedId, onSelect]);

  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🔍</span>
          </div>
          <p>No recommendations available</p>
        </div>
      </div>
    );
  }

  return (
    <VirtualScrollList
      items={recommendations}
      itemHeight={200}
      containerHeight={600}
      renderItem={renderRecommendationItem}
      className="border border-gray-200 rounded-lg"
    />
  );
};

export default VirtualScrollList;