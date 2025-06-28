import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

// --- Component để nhúng CSS của nút vào trang ---
const AddToCartStyles = () => {
    const styles = `
    /* Nút chính "Thêm vào giỏ hàng" */
    .dole-add-to-cart-btn {
      width: 100%;
      background-color: #ffffff; /* Thay đổi: Nền màu trắng */
      color: #1f3f32; /* Thay đổi: Chữ màu xanh đậm */
      border: 1px solid #1f3f32; /* Thay đổi: Viền màu xanh đậm */
      padding: 12px 15px;
      cursor: pointer;
      font-family: inherit;
      font-size: 16px;
      font-weight: 500;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease; /* Áp dụng transition cho tất cả thuộc tính */
      border-radius: 0;
    }

    /* Hiệu ứng khi di chuột: Đảo ngược màu */
    .dole-add-to-cart-btn:hover:not(:disabled) {
      background-color: #1f3f32; /* Nền xanh đậm */
      color: #ffffff; /* Chữ trắng */
      border-color: #1f3f32;
    }

    /* Trạng thái bị vô hiệu hóa */
    .dole-add-to-cart-btn:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }

    /* Icon giỏ hàng */
    .dole-add-to-cart-btn .cart-icon {
      margin-left: 10px;
      width: 20px;
      height: 20px;
      fill: currentColor; /* Icon sẽ luôn có màu giống chữ */
    }
    
    /* Trạng thái thành công: Giữ nguyên kiểu hover để có phản hồi rõ ràng */
    .dole-add-to-cart-btn.success {
       background-color: #1f3f32;
       color: #ffffff;
    }

    /* Vòng xoay cho trạng thái đang tải */
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
      to {
        transform: rotate(360deg);
      }
    }
  `;
    return <style>{styles}</style>;
};

// --- SVG Icons ---
const CartIcon = () => (
    <svg className="cart-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
    </svg>
);
const CheckIcon = () => (
    <svg className="cart-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
    </svg>
);
const LoadingSpinner = () => <div className="spinner"></div>;

const AddToCartButton = ({ productId, quantity = 1, onSuccess, onError }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        if (isSuccess) {
            const timer = setTimeout(() => setIsSuccess(false), 2000);
            return () => clearTimeout(timer);
        }
    }, [isSuccess]);

    const handleAddToCart = async () => {
        if (isLoading || isSuccess) return;
        setIsLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            setIsSuccess(true);
            if (onSuccess) onSuccess();
        } catch (err) {
            if (onError) onError(err);
        } finally {
            setIsLoading(false);
        }
    };

    const getButtonContent = () => {
        if (isSuccess) return <>Đã thêm <CheckIcon /></>;
        if (isLoading) return <><LoadingSpinner /> Đang xử lý</>;
        return <>Thêm vào giỏ <CartIcon /></>;
    };

    return (
        <>
            <AddToCartStyles />
            <button
                onClick={handleAddToCart}
                className={`dole-add-to-cart-btn ${isSuccess ? 'success' : ''}`}
                disabled={isLoading || isSuccess}
            >
                {getButtonContent()}
            </button>
        </>
    );
};

AddToCartButton.propTypes = {
    productId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    quantity: PropTypes.number,
    onSuccess: PropTypes.func,
    onError: PropTypes.func,
};

export default AddToCartButton;
