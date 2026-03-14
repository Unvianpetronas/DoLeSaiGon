
import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import ReactDOM from 'react-dom';
import './Notification.css';


const NotificationContext = createContext(null);


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

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (context === null) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};

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