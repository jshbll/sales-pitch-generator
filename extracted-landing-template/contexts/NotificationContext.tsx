import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { IOSNotification, NotificationVariant } from '../components/common/IOSNotification';
import { Box, Button } from '@mui/material';

interface Notification {
  id: string;
  title?: string;
  message: string;
  variant?: NotificationVariant;
  icon?: ReactNode;
  autoHideDuration?: number;
  action?: ReactNode;
}

interface NotificationContextType {
  showNotification: (notification: Omit<Notification, 'id'>) => void;
  showError: (message: string, title?: string) => void;
  showSuccess: (message: string, title?: string) => void;
  showWarning: (message: string, title?: string) => void;
  showInfo: (message: string, title?: string) => void;
  showFormatError: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = Date.now().toString();
    const newNotification: Notification = {
      ...notification,
      id,
    };
    
    setNotifications(prev => [...prev, newNotification]);
  }, []);

  const hideNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const showError = useCallback((message: string, title?: string) => {
    showNotification({
      title: title || 'Error',
      message,
      variant: 'error',
      autoHideDuration: 6000,
    });
  }, [showNotification]);

  const showSuccess = useCallback((message: string, title?: string) => {
    showNotification({
      title: title || 'Success',
      message,
      variant: 'success',
      autoHideDuration: 4000,
    });
  }, [showNotification]);

  const showWarning = useCallback((message: string, title?: string) => {
    showNotification({
      title: title || 'Warning',
      message,
      variant: 'warning',
      autoHideDuration: 5000,
    });
  }, [showNotification]);

  const showInfo = useCallback((message: string, title?: string) => {
    showNotification({
      title: title || 'Info',
      message,
      variant: 'info',
      autoHideDuration: 5000,
    });
  }, [showNotification]);

  const showFormatError = useCallback(() => {
    showNotification({
      title: 'Unsupported Format',
      message: 'AVIF images are not supported. Convert to JPG/PNG to upload.',
      variant: 'error',
      autoHideDuration: 8000,
      action: (
        <Button
          size="small"
          variant="text"
          sx={{
            color: '#007AFF',
            textTransform: 'none',
            fontSize: '13px',
            p: 0.5,
            minWidth: 'auto',
            '&:hover': {
              backgroundColor: 'rgba(0, 122, 255, 0.1)',
            },
          }}
          onClick={() => window.open('https://picflow.com/image-converter', '_blank')}
        >
          Open Converter →
        </Button>
      ),
    });
  }, [showNotification]);

  const value = {
    showNotification,
    showError,
    showSuccess,
    showWarning,
    showInfo,
    showFormatError,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <Box
        sx={{
          position: 'fixed',
          top: 20,
          right: 20,
          zIndex: 99999,
          pointerEvents: 'none',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          maxHeight: 'calc(100vh - 40px)',
          overflow: 'hidden',
          '& > *': {
            pointerEvents: 'auto',
          },
        }}
      >
        {notifications.slice(0, 3).map((notification) => (
          <IOSNotification
            key={notification.id}
            {...notification}
            open={true}
            onClose={() => hideNotification(notification.id)}
          />
        ))}
      </Box>
    </NotificationContext.Provider>
  );
};

export default NotificationContext;