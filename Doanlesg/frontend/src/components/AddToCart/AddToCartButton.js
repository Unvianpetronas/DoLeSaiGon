import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useNotification } from '../../contexts/NotificationContext';
import { useCart } from '../../contexts/CartProvider'; // 1. Import the useCart hook

// --- Component to embed CSS (No changes here) ---
const AddToCartStyles = () => {
    const styles = `
    /* Container for the button and error message */
    .dole-btn-wrapper {
      position: relative;
      width: 100%;
    }
    /* Main "Add to Cart" button */
    .dole-add-to-cart-btn {
      width: 100%;
      background-color: #ffffff;
      color: #1f3f32;
      border: 1px solid #1f3f32;
      padding: 12px 15px;
      cursor: pointer;
      font-family: inherit;
      font-size: 16px;
      font-weight: 500;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
      border-radius: 4px; /* Slightly rounded corners for a modern look */
    }
    /* Hover effect */
    .dole-add-to-cart-btn:hover:not(:disabled) {
      background-color: #1f3f32;
      color: #ffffff;
    }
    /* Disabled state */
    .dole-add-to-cart-btn:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }
    /* Cart icon */
    .dole-add-to-cart-btn .cart-icon {
      margin-left: 10px;
      width: 20px;
      height: 20px;
      fill: currentColor;
    }
    /* Success state */
    .dole-add-to-cart-btn.success {
       background-color: #1f3f32;
       color: #ffffff;
    }
    /* Loading spinner */
    .spinner {
      width: 18px;
      height: 18px;
      border: 2px solid rgba(0, 0, 0, 0.2);
      border-top-color: #1f3f32;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin-right: 8px;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `;
    return <style>{styles}</style>;
};

// --- SVG Icons (No changes here) ---
const CartIcon = () => ( <svg className="cart-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/></svg> );
const CheckIcon = () => ( <svg className="cart-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg> );
const LoadingSpinner = () => <div className="spinner"></div>;


const AddToCartButton = ({ product, quantity = 1, onSuccess }) => {
    // 2. Get the addToCart function from the context
    const { addToCart, loading } = useCart();
    const { addNotification } = useNotification();
    const [isSuccess, setIsSuccess] = useState(false);

    // Reset the success state after a short delay
    useEffect(() => {
        if (isSuccess) {
            const timer = setTimeout(() => setIsSuccess(false), 2000);
            return () => clearTimeout(timer);
        }
    }, [isSuccess]);

    // 3. The handleAddToCart function is now much simpler
    const handleAddToCart = async () => {
        if (loading || isSuccess) return;

        try {
            await addToCart(product, quantity);
            addNotification('Đã thêm sản phẩm vào giỏ!', 'success');
            setIsSuccess(true);
            if (onSuccess) {
                onSuccess();
            }
        } catch (error) {
            // The context will handle the error logic, but we can still show a notification
            addNotification(error.message || 'Có lỗi xảy ra, vui lòng thử lại.', 'error');
        }
    };

    const getButtonContent = () => {
        if (isSuccess) return <>Đã thêm <CheckIcon /></>;
        if (loading) return <><LoadingSpinner /> Đang xử lý</>;
        return <>Thêm vào giỏ <CartIcon /></>;
    };

    return (
        <div className="dole-btn-wrapper">
            <AddToCartStyles />
            <button
                onClick={handleAddToCart}
                className={`dole-add-to-cart-btn ${isSuccess ? 'success' : ''}`}
                disabled={loading || isSuccess}
            >
                {getButtonContent()}
            </button>
        </div>
    );
};

// 4. Update PropTypes to expect a product object
AddToCartButton.propTypes = {
    product: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        // Add other product properties you need for the guest cart
        productName: PropTypes.string,
        price: PropTypes.number,
    }).isRequired,
    quantity: PropTypes.number,
    onSuccess: PropTypes.func,
};

export default AddToCartButton;
