import React from 'react';
import { AlertCircle, AlertTriangle, Info, CheckCircle } from 'lucide-react';

const ValidationMessage = ({ 
  type = 'error', 
  message, 
  messages = [], 
  className = '',
  showIcon = true,
  onDismiss 
}) => {
  const allMessages = message ? [{ message, type }] : messages;
  
  if (allMessages.length === 0) return null;

  const getIcon = (messageType) => {
    switch (messageType) {
      case 'error':
        return AlertCircle;
      case 'warning':
        return AlertTriangle;
      case 'info':
        return Info;
      case 'success':
        return CheckCircle;
      default:
        return AlertCircle;
    }
  };

  const getStyles = (messageType) => {
    switch (messageType) {
      case 'error':
        return {
          container: 'bg-red-50 border-red-200 text-red-800',
          icon: 'text-red-500',
          title: 'text-red-900'
        };
      case 'warning':
        return {
          container: 'bg-yellow-50 border-yellow-200 text-yellow-800',
          icon: 'text-yellow-500',
          title: 'text-yellow-900'
        };
      case 'info':
        return {
          container: 'bg-blue-50 border-blue-200 text-blue-800',
          icon: 'text-blue-500',
          title: 'text-blue-900'
        };
      case 'success':
        return {
          container: 'bg-green-50 border-green-200 text-green-800',
          icon: 'text-green-500',
          title: 'text-green-900'
        };
      default:
        return {
          container: 'bg-gray-50 border-gray-200 text-gray-800',
          icon: 'text-gray-500',
          title: 'text-gray-900'
        };
    }
  };

  // Group messages by type
  const groupedMessages = allMessages.reduce((acc, msg) => {
    const msgType = msg.type || type;
    if (!acc[msgType]) acc[msgType] = [];
    acc[msgType].push(msg);
    return acc;
  }, {});

  return (
    <div className={`space-y-2 ${className}`}>
      {Object.entries(groupedMessages).map(([messageType, msgs]) => {
        const styles = getStyles(messageType);
        const Icon = getIcon(messageType);
        
        return (
          <div
            key={messageType}
            className={`border rounded-lg p-3 ${styles.container}`}
          >
            <div className="flex items-start space-x-2">
              {showIcon && (
                <Icon className={`flex-shrink-0 mt-0.5 ${styles.icon}`} size={16} />
              )}
              <div className="flex-1 min-w-0">
                {msgs.length === 1 ? (
                  <p className="text-sm">{msgs[0].message}</p>
                ) : (
                  <div>
                    <p className={`text-sm font-medium mb-1 ${styles.title}`}>
                      {messageType === 'error' ? 'Errors:' : 
                       messageType === 'warning' ? 'Warnings:' : 
                       messageType === 'info' ? 'Information:' : 'Messages:'}
                    </p>
                    <ul className="text-sm space-y-1">
                      {msgs.map((msg, index) => (
                        <li key={index} className="flex items-start space-x-1">
                          <span className="text-current mt-0.5">•</span>
                          <span>{msg.message}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              {onDismiss && (
                <button
                  onClick={onDismiss}
                  className={`flex-shrink-0 ${styles.icon} hover:opacity-75`}
                >
                  ×
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ValidationMessage;