import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // This useEffect is now fully supported by the updated backend
    useEffect(() => {
        const checkUserStatus = async () => {
            try {
                const response = await fetch('http://localhost:8080/api/ver0.0.1/auth/status', {
                    credentials: 'include',
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.isAuthenticated) {
                        setUser(data.user); // This will now work correctly
                    }
                } else {
                    setUser(null);
                }
            } catch (error) {
                console.error("Không thể kiểm tra trạng thái đăng nhập:", error);
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };

        checkUserStatus();
    }, []);

    // The login function is correct
    const login = async (email, password) => {
        try {
            const response = await fetch('http://localhost:8080/api/ver0.0.1/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
                credentials: 'include',
            });

            const data = await response.json();

            if (data.success) {
                setUser(data.user);
            }

            return data;
        } catch (error) {
            console.error("Lỗi đăng nhập:", error);
            return { success: false, message: 'Lỗi kết nối' };
        }
    };

    // --- FIX THE LOGOUT FUNCTION ---
    const logout = async () => {
        try {
            // Call the new logout endpoint you created
            await fetch('http://localhost:8080/api/ver0.0.1/logout', {
                method: 'POST',
                credentials: 'include',
            });
        } catch (error) {
            console.error("Lỗi khi đăng xuất:", error);
        } finally {
            // Reset user state and redirect
            setUser(null);
            window.location.href = '/';
        }
    };

    const value = { user, isLoading, login, logout };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};