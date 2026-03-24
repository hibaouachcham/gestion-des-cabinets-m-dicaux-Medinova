import { createContext, useContext, useState, useCallback } from 'react';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [notification, setNotification] = useState({
    visible: false,
    type: 'success', // 'success' | 'error' | 'info'
    message: '',
  });

  const showNotification = useCallback((message, type = 'success') => {
    setNotification({ visible: true, type, message });
  }, []);

  const hideNotification = useCallback(() => {
    setNotification((prev) => ({ ...prev, visible: false }));
  }, []);

  return (
    <NotificationContext.Provider value={{ notification, showNotification, hideNotification }}>
      {children}
      {notification.visible && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h2 className="text-lg font-semibold mb-2">
              {notification.type === 'success'
                ? 'Succès'
                : notification.type === 'error'
                ? 'Erreur'
                : 'Information'}
            </h2>
            <p className="text-sm text-gray-700 mb-4">{notification.message}</p>
            <div className="flex justify-end">
              <button
                onClick={hideNotification}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return ctx;
}


