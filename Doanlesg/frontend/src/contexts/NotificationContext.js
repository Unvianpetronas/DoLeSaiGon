// src/contexts/NotificationContext.js

import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import ReactDOM from 'react-dom';
import './Notification.css'; // The CSS file for the notification

// 1. Create the context
const NotificationContext = createContext(null);

// 2. Create the Provider component
export const NotificationProvider = ({ children }) => {
    const [notification, setNotification] = useState(null);

    const addNotification = useCallback((message, type = 'error') => {
        setNotification({ message, type, key: Date.now() });
    }, []);

    const removeNotification = useCallback(() => {
        setNotification(null);
    }, []);

    const value = { addNotification };

    return (
        <NotificationContext.Provider value={value}>
            {children}
            {notification && ReactDOM.createPortal(
                <NotificationToast notification={notification} onClose={removeNotification} />,
                document.body
            )}
        </NotificationContext.Provider>
    );
};

// 3. Create the custom Hook to use the context
export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (context === null) {
        // This error will trigger if the provider is missing, which is a clear indicator.
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};

// 4. The UI for the notification toast
const NotificationToast = ({ notification, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [notification, onClose]);

    return (
        <div className={`notification-toast ${notification.type}`}>
            {notification.message}
        </div>
    );
};