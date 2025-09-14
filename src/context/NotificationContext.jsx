import React, { createContext, useContext, useReducer } from 'react';

// Initial state for notifications
const initialNotificationState = {
  notifications: [],
  settings: {
    autoRemove: true,
    autoRemoveDelay: 5000,
    maxNotifications: 5,
    position: 'top-right' // 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
  }
};

// Notification types
export const NotificationTypes = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

// Action types
const NotificationActionTypes = {
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  REMOVE_NOTIFICATION: 'REMOVE_NOTIFICATION',
  CLEAR_ALL_NOTIFICATIONS: 'CLEAR_ALL_NOTIFICATIONS',
  UPDATE_SETTINGS: 'UPDATE_SETTINGS'
};

// Reducer
const notificationReducer = (state, action) => {
  switch (action.type) {
    case NotificationActionTypes.ADD_NOTIFICATION:
      const newNotifications = [action.payload, ...state.notifications];
      
      // Limit the number of notifications
      const limitedNotifications = newNotifications.slice(0, state.settings.maxNotifications);
      
      return {
        ...state,
        notifications: limitedNotifications
      };
      
    case NotificationActionTypes.REMOVE_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload)
      };
      
    case NotificationActionTypes.CLEAR_ALL_NOTIFICATIONS:
      return {
        ...state,
        notifications: []
      };
      
    case NotificationActionTypes.UPDATE_SETTINGS:
      return {
        ...state,
        settings: { ...state.settings, ...action.payload }
      };
      
    default:
      return state;
  }
};

// Create context
const NotificationContext = createContext();

// Provider component
export const NotificationProvider = ({ children }) => {
  const [state, dispatch] = useReducer(notificationReducer, initialNotificationState);

  // Action creators
  const actions = {
    addNotification: (notification) => {
      const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
      const fullNotification = {
        id,
        timestamp: new Date().toISOString(),
        ...notification
      };
      
      dispatch({ 
        type: NotificationActionTypes.ADD_NOTIFICATION, 
        payload: fullNotification 
      });
      
      // Auto-remove if enabled
      if (state.settings.autoRemove) {
        setTimeout(() => {
          dispatch({ 
            type: NotificationActionTypes.REMOVE_NOTIFICATION, 
            payload: id 
          });
        }, state.settings.autoRemoveDelay);
      }
      
      return id;
    },
    
    removeNotification: (id) => 
      dispatch({ type: NotificationActionTypes.REMOVE_NOTIFICATION, payload: id }),
      
    clearAllNotifications: () => 
      dispatch({ type: NotificationActionTypes.CLEAR_ALL_NOTIFICATIONS }),
      
    updateSettings: (settings) => 
      dispatch({ type: NotificationActionTypes.UPDATE_SETTINGS, payload: settings }),
    
    // Convenience methods for different notification types
    success: (message, options = {}) => 
      actions.addNotification({ 
        type: NotificationTypes.SUCCESS, 
        message, 
        ...options 
      }),
      
    error: (message, options = {}) => 
      actions.addNotification({ 
        type: NotificationTypes.ERROR, 
        message, 
        ...options 
      }),
      
    warning: (message, options = {}) => 
      actions.addNotification({ 
        type: NotificationTypes.WARNING, 
        message, 
        ...options 
      }),
      
    info: (message, options = {}) => 
      actions.addNotification({ 
        type: NotificationTypes.INFO, 
        message, 
        ...options 
      })
  };

  const value = {
    state,
    dispatch,
    actions
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

// Custom hook
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

// Notification component for rendering
export const NotificationContainer = () => {
  const { state, actions } = useNotifications();
  
  if (state.notifications.length === 0) return null;
  
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4'
  };
  
  return (
    <div className={`fixed z-50 ${positionClasses[state.settings.position]} space-y-2`}>
      {state.notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onRemove={() => actions.removeNotification(notification.id)}
        />
      ))}
    </div>
  );
};

// Individual notification item component
const NotificationItem = ({ notification, onRemove }) => {
  const typeStyles = {
    [NotificationTypes.SUCCESS]: 'bg-green-50 border-green-200 text-green-800',
    [NotificationTypes.ERROR]: 'bg-red-50 border-red-200 text-red-800',
    [NotificationTypes.WARNING]: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    [NotificationTypes.INFO]: 'bg-blue-50 border-blue-200 text-blue-800'
  };
  
  const iconMap = {
    [NotificationTypes.SUCCESS]: '✓',
    [NotificationTypes.ERROR]: '✕',
    [NotificationTypes.WARNING]: '⚠',
    [NotificationTypes.INFO]: 'ℹ'
  };
  
  return (
    <div className={`
      max-w-sm w-full border rounded-lg p-4 shadow-lg transition-all duration-300
      ${typeStyles[notification.type]}
    `}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <span className="text-lg">{iconMap[notification.type]}</span>
        </div>
        <div className="ml-3 flex-1">
          {notification.title && (
            <h4 className="font-semibold text-sm">{notification.title}</h4>
          )}
          <p className="text-sm">{notification.message}</p>
          {notification.action && (
            <button
              onClick={notification.action.onClick}
              className="mt-2 text-sm font-medium underline hover:no-underline"
            >
              {notification.action.label}
            </button>
          )}
        </div>
        <button
          onClick={onRemove}
          className="flex-shrink-0 ml-2 text-lg hover:opacity-70"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export { NotificationActionTypes };
export default NotificationContext;