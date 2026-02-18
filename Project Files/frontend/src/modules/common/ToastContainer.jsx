import React, { createContext, useContext, useState, useCallback } from 'react';
import Toast from './Toast';

// Create context for toast management
const ToastContext = createContext();

// Toast provider component
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', options = {}) => {
    const id = Date.now() + Math.random();
    const newToast = {
      id,
      message,
      type,
      autohide: options.autohide !== false,
      delay: options.delay || 3000,
      position: options.position || 'top-end'
    };

    setToasts(prev => [...prev, newToast]);

    // Auto remove toast after delay if autohide is enabled
    if (newToast.autohide) {
      setTimeout(() => {
        removeToast(id);
      }, newToast.delay);
    }

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const showSuccess = useCallback((message, options) => addToast(message, 'success', options), [addToast]);
  const showError = useCallback((message, options) => addToast(message, 'error', options), [addToast]);
  const showWarning = useCallback((message, options) => addToast(message, 'warning', options), [addToast]);
  const showInfo = useCallback((message, options) => addToast(message, 'info', options), [addToast]);

  const value = {
    addToast,
    removeToast,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Render all active toasts */}
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          show={true}
          onClose={() => removeToast(toast.id)}
          message={toast.message}
          type={toast.type}
          autohide={toast.autohide}
          delay={toast.delay}
          position={toast.position}
        />
      ))}
    </ToastContext.Provider>
  );
};

// Custom hook to use toast functionality
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export default ToastContext;
