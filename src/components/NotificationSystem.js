import React, { createContext, useContext, useState, useEffect } from 'react';

// Notification Context
const NotificationContext = createContext();

// Custom hook to use notifications
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

// Notification Provider Component
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (message, type = 'info', duration = 5000) => {
    const id = Date.now() + Math.random();
    const notification = {
      id,
      message,
      type,
      duration,
      timestamp: new Date()
    };

    setNotifications(prev => [...prev, notification]);

    // Auto remove notification after duration
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }

    return id;
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  // Convenience methods
  const success = (message, duration) => addNotification(message, 'success', duration);
  const error = (message, duration) => addNotification(message, 'error', duration);
  const warning = (message, duration) => addNotification(message, 'warning', duration);
  const info = (message, duration) => addNotification(message, 'info', duration);

  const value = {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
    success,
    error,
    warning,
    info
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  );
};

// Individual Notification Component
const NotificationItem = ({ notification, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Slide in animation
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  const handleRemove = () => {
    setIsVisible(false);
    setTimeout(() => onRemove(notification.id), 300);
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return 'ℹ️';
    }
  };

  const getColors = () => {
    switch (notification.type) {
      case 'success': return { bg: '#d4edda', border: '#c3e6cb', text: '#155724' };
      case 'error': return { bg: '#f8d7da', border: '#f5c6cb', text: '#721c24' };
      case 'warning': return { bg: '#fff3cd', border: '#ffeaa7', text: '#856404' };
      case 'info': return { bg: '#d1ecf1', border: '#bee5eb', text: '#0c5460' };
      default: return { bg: '#d1ecf1', border: '#bee5eb', text: '#0c5460' };
    }
  };

  const colors = getColors();

  return (
    <div
      style={{
        ...notificationStyle,
        backgroundColor: colors.bg,
        borderColor: colors.border,
        color: colors.text,
        transform: isVisible ? 'translateX(0)' : 'translateX(100%)',
        opacity: isVisible ? 1 : 0
      }}
    >
      <div style={notificationContentStyle}>
        <span style={notificationIconStyle}>{getIcon()}</span>
        <span style={notificationMessageStyle}>{notification.message}</span>
      </div>
      <button
        onClick={handleRemove}
        style={closeButtonStyle}
        title="Close notification"
      >
        ×
      </button>
    </div>
  );
};

// Notification Container Component
const NotificationContainer = () => {
  const { notifications, removeNotification } = useNotification();

  return (
    <div style={containerStyle}>
      {notifications.map(notification => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onRemove={removeNotification}
        />
      ))}
    </div>
  );
};

// Enhanced Alert Component with Notifications
export const EnhancedAlert = ({ message, type, onClose }) => {
  useEffect(() => {
    if (onClose) {
      const timer = setTimeout(onClose, 5000);
      return () => clearTimeout(timer);
    }
  }, [onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      default: return 'ℹ️';
    }
  };

  return (
    <div className={`alert alert-${type}`} style={alertStyle}>
      <div style={alertContentStyle}>
        <span style={alertIconStyle}>{getIcon()}</span>
        <span>{message}</span>
      </div>
      {onClose && (
        <button onClick={onClose} style={alertCloseStyle}>×</button>
      )}
    </div>
  );
};

// Loading Component with Enhanced Styling
export const EnhancedLoading = ({ message = 'Loading...' }) => {
  return (
    <div style={loadingContainerStyle}>
      <div style={loadingSpinnerStyle}></div>
      <p style={loadingMessageStyle}>{message}</p>
    </div>
  );
};

// Confirmation Dialog Component
export const ConfirmDialog = ({ 
  isOpen, 
  title, 
  message, 
  onConfirm, 
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'warning'
}) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'danger': return '🗑️';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '❓';
    }
  };

  return (
    <div style={modalOverlayStyle} onClick={onCancel}>
      <div style={confirmDialogStyle} onClick={(e) => e.stopPropagation()}>
        <div style={confirmHeaderStyle}>
          <span style={confirmIconStyle}>{getIcon()}</span>
          <h3 style={confirmTitleStyle}>{title}</h3>
        </div>
        <div style={confirmBodyStyle}>
          <p>{message}</p>
        </div>
        <div style={confirmActionsStyle}>
          <button
            onClick={onCancel}
            style={{...confirmButtonStyle, ...cancelButtonStyle}}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            style={{...confirmButtonStyle, ...confirmButtonPrimaryStyle}}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

// Custom Hook for Confirm Dialog
export const useConfirm = () => {
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    type: 'warning'
  });

  const confirm = (options) => {
    return new Promise((resolve) => {
      setConfirmState({
        isOpen: true,
        title: options.title || 'Confirm Action',
        message: options.message || 'Are you sure?',
        type: options.type || 'warning',
        onConfirm: () => {
          setConfirmState(prev => ({ ...prev, isOpen: false }));
          resolve(true);
        },
        onCancel: () => {
          setConfirmState(prev => ({ ...prev, isOpen: false }));
          resolve(false);
        }
      });
    });
  };

  const ConfirmComponent = () => (
    <ConfirmDialog
      isOpen={confirmState.isOpen}
      title={confirmState.title}
      message={confirmState.message}
      type={confirmState.type}
      onConfirm={confirmState.onConfirm}
      onCancel={confirmState.onCancel}
    />
  );

  return { confirm, ConfirmComponent };
};

// Styles
const containerStyle = {
  position: 'fixed',
  top: '20px',
  right: '20px',
  zIndex: 9999,
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
  maxWidth: '400px'
};

const notificationStyle = {
  padding: '16px',
  borderRadius: '8px',
  border: '1px solid',
  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  transition: 'all 0.3s ease',
  backdropFilter: 'blur(10px)',
  minWidth: '300px'
};

const notificationContentStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  flex: 1
};

const notificationIconStyle = {
  fontSize: '18px'
};

const notificationMessageStyle = {
  fontSize: '14px',
  fontWeight: '500'
};

const closeButtonStyle = {
  background: 'none',
  border: 'none',
  fontSize: '20px',
  cursor: 'pointer',
  padding: '0',
  marginLeft: '12px',
  opacity: 0.7,
  transition: 'opacity 0.2s'
};

const alertStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '12px 16px'
};

const alertContentStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px'
};

const alertIconStyle = {
  fontSize: '16px'
};

const alertCloseStyle = {
  background: 'none',
  border: 'none',
  fontSize: '18px',
  cursor: 'pointer',
  marginLeft: '10px'
};

const loadingContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '60px 20px',
  gap: '20px'
};

const loadingSpinnerStyle = {
  width: '50px',
  height: '50px',
  border: '4px solid #f3f3f3',
  borderTop: '4px solid #007bff',
  borderRadius: '50%',
  animation: 'spin 1s linear infinite'
};

const loadingMessageStyle = {
  fontSize: '16px',
  color: '#666',
  margin: 0
};

const modalOverlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.5)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 10000
};

const confirmDialogStyle = {
  backgroundColor: 'white',
  borderRadius: '12px',
  padding: '0',
  maxWidth: '400px',
  width: '90%',
  boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
};

const confirmHeaderStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '24px 24px 16px',
  borderBottom: '1px solid #eee'
};

const confirmIconStyle = {
  fontSize: '24px'
};

const confirmTitleStyle = {
  margin: 0,
  fontSize: '18px',
  fontWeight: '600'
};

const confirmBodyStyle = {
  padding: '16px 24px'
};

const confirmActionsStyle = {
  display: 'flex',
  gap: '12px',
  padding: '16px 24px 24px',
  justifyContent: 'flex-end'
};

const confirmButtonStyle = {
  padding: '10px 20px',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: '500',
  transition: 'all 0.2s'
};

const cancelButtonStyle = {
  backgroundColor: '#f8f9fa',
  color: '#495057'
};

const confirmButtonPrimaryStyle = {
  backgroundColor: '#dc3545',
  color: 'white'
};

export default NotificationProvider;