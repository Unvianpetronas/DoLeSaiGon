import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

// --- Component để nhúng CSS của nút vào trang ---
const AddToCartStyles = () => {
    const styles = `
    /* Container cho nút và thông báo lỗi */
    .dole-btn-wrapper {
      position: relative;
      width: 100%;
    }
    /* Nút chính "Thêm vào giỏ hàng" */
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
      border-radius: 0;
    }
    /* Hiệu ứng khi di chuột */
    .dole-add-to-cart-btn:hover:not(:disabled) {
      background-color: #1f3f32;
      color: #ffffff;
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
      fill: currentColor;
    }
    /* Trạng thái thành công */
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
    /* Thông báo lỗi */
    .dole-btn-error-msg {
      font-size: 12px;
      color: #d10000;
      text-align: center;
      margin-top: 5px;
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
    const [error, setError] = useState(null); // Thêm state để lưu lỗi

    useEffect(() => {
        if (isSuccess) {
            const timer = setTimeout(() => {
                setIsSuccess(false);
                setError(null); // Xóa lỗi khi trạng thái thành công kết thúc
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [isSuccess]);

    const handleAddToCart = async () => {
        if (isLoading || isSuccess) return;
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('http://localhost:8080/api/ver0.0.1/cartItem/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    productId: productId,
                    quantity: quantity
                }),
                // --- THAY ĐỔI QUAN TRỌNG NHẤT Ở ĐÂY ---
                credentials: 'include' // Yêu cầu trình duyệt gửi cookie xác thực
            });

            if (!response.ok) {
                if (response.status === 401) {
                    if (onError) {
                        onError('auth', "Bạn phải đăng nhập để thêm vào giỏ hàng");
                    }
                    return;
                }
                const errorMessage = await response.text();
                throw new Error(errorMessage || 'Đã có lỗi xảy ra.');
            }

            setIsSuccess(true);
            if (onSuccess) onSuccess();

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Lỗi kết nối đến máy chủ.';
            setError(errorMessage);
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
        <div className="dole-btn-wrapper">
            <AddToCartStyles />
            <button
                onClick={handleAddToCart}
                className={`dole-add-to-cart-btn ${isSuccess ? 'success' : ''}`}
                disabled={isLoading || isSuccess}
            >
                {getButtonContent()}
            </button>
            {/* Hiển thị thông báo lỗi nếu có */}
            {error && <p className="dole-btn-error-msg">{error}</p>}
        </div>
    );
};

AddToCartButton.propTypes = {
    productId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    quantity: PropTypes.number,
    onSuccess: PropTypes.func,
    onError: PropTypes.func,
};

export default AddToCartButton;
