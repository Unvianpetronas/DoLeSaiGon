import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === null) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user, isLoading: isAuthLoading } = useAuth();

    // Effect to load cart from API (for users) or Local Storage (for guests)
    useEffect(() => {
        if (isAuthLoading) return; // Wait for authentication to be resolved

        const loadCart = async () => {
            setLoading(true);
            if (user) {
                // User is logged in, fetch from API
                try {
                    const response = await fetch("http://localhost:8080/api/ver0.0.1/cartItem/allCartItem", { credentials: "include" });
                    if (response.ok) {
                        const data = await response.json();
                        setCartItems(data);
                    } else {
                        setCartItems([]);
                    }
                } catch (error) {
                    console.error("Failed to fetch user cart:", error);
                    setCartItems([]);
                }
            } else {
                // Guest user, load from Local Storage
                const localCart = localStorage.getItem('guestCart');
                setCartItems(localCart ? JSON.parse(localCart) : []);
            }
            setLoading(false);
        };

        loadCart();
    }, [user, isAuthLoading]);

    // --- IMPLEMENTED FUNCTIONS ---

    const addToCart = useCallback(async (product, quantity = 1) => {
        if (user) {
            // API logic for logged-in user
            await fetch('http://localhost:8080/api/ver0.0.1/cartItem/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId: product.id, quantity }),
                credentials: 'include'
            });
            // Refetch cart to get the latest state from DB
            const response = await fetch("http://localhost:8080/api/ver0.0.1/cartItem/allCartItem", { credentials: "include" });
            const data = await response.json();
            setCartItems(data);
        } else {
            // Local Storage logic for guest
            const currentCart = JSON.parse(localStorage.getItem('guestCart')) || [];
            const existingItemIndex = currentCart.findIndex(item => item.productId === product.id);

            if (existingItemIndex > -1) {
                currentCart[existingItemIndex].quantity += quantity;
            } else {
                currentCart.push({ ...product, productId: product.id, quantity });
            }
            localStorage.setItem('guestCart', JSON.stringify(currentCart));
            setCartItems(currentCart);
        }
    }, [user]);

    const updateQuantity = useCallback(async (productId, newQuantity) => {
        if (user) {
            // API logic for logged-in user
            await fetch(`http://localhost:8080/api/ver0.0.1/cartItem/updateId?productId=${productId}&quantity=${newQuantity}`, {
                method: "PUT",
                credentials: "include",
            });
            setCartItems(prev => prev.map(item => item.productId === productId ? { ...item, quantity: newQuantity } : item));
        } else {
            // Local Storage logic for guest
            const currentCart = JSON.parse(localStorage.getItem('guestCart')) || [];
            const updatedCart = currentCart.map(item => item.productId === productId ? { ...item, quantity: newQuantity } : item);
            localStorage.setItem('guestCart', JSON.stringify(updatedCart));
            setCartItems(updatedCart);
        }
    }, [user]);

    const removeItem = useCallback(async (productId) => {
        if (user) {
            // API logic for logged-in user
            await fetch(`http://localhost:8080/api/ver0.0.1/cartItem/removeId?productId=${productId}`, {
                method: "DELETE", // Using DELETE is best practice
                credentials: "include",
            });
            setCartItems(prev => prev.filter(item => item.productId !== productId));
        } else {
            // Local Storage logic for guest
            const currentCart = JSON.parse(localStorage.getItem('guestCart')) || [];
            const updatedCart = currentCart.filter(item => item.productId !== productId);
            localStorage.setItem('guestCart', JSON.stringify(updatedCart));
            setCartItems(updatedCart);
        }
    }, [user]);

    const clearCart = useCallback(() => {
        if (user) {
            // You would need an API endpoint to clear the user's cart
            // e.g., fetch('/api/cart/clear', { method: 'POST', ... })
        }
        localStorage.removeItem('guestCart');
        setCartItems([]);
    }, [user]);

    // The value object now includes all necessary functions
    const value = {
        cartItems,
        loading,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};
