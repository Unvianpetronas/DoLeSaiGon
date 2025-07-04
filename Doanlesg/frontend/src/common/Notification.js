import React, { createContext, useState, useContext, useCallback } from 'react';

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
    const [notification, setNotification] = useState(null);

    const addNotification = useCallback((message, type = 'error') => {
        setNotification({ message, type });
        setTimeout(() => {
            setNotification(null);
        }, 3000); // Notification disappears after 3 seconds
    }, []);

    return (
        <NotificationContext.Provider value={{ addNotification }}>
            {children}
            {notification && <Notification message={notification.message} type={notification.type} />}
        </NotificationContext.Provider>
    );
};

// This is the actual UI component for the notification
function Notification({ message, type }) {
    return (
        <div className={`notification ${type}`}>
            {message}
        </div>
    );
}