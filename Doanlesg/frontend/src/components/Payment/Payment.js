import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartProvider';
import { useNotification } from '../../contexts/NotificationContext';
import './Payment.css';
import { Helmet } from 'react-helmet-async';

// --- Constants for Session Storage Keys ---
const PAYMENT_INFO_KEY = 'paymentInfo';
const ORDER_DATA_KEY = 'orderData';
const IS_BUY_NOW_KEY = 'isBuyNowSession';

// --- API Endpoint from Environment Variable ---
// In your .env file: REACT_APP_API_BASE_URL=http://localhost:8080
const API_BASE_URL = '';


const Payment = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { clearCart } = useCart();
    const { addNotification } = useNotification();

    // --- STATE MANAGEMENT ---
    // Using a lazy initializer function to read from sessionStorage only once.
    const [paymentInfo, setPaymentInfo] = useState(() => JSON.parse(sessionStorage.getItem(PAYMENT_INFO_KEY)));
    const [orderData, setOrderData] = useState(() => JSON.parse(sessionStorage.getItem(ORDER_DATA_KEY)));
    const [isBuyNow, setIsBuyNow] = useState(() => JSON.parse(sessionStorage.getItem(IS_BUY_NOW_KEY)) || false);

    const [timeLeft, setTimeLeft] = useState(300); // Default to 5 minutes
    const [isRegenerating, setIsRegenerating] = useState(false);

    const pollerRef = useRef(null);
    const countdownRef = useRef(null);

    const isExpired = timeLeft <= 0;

    // --- EFFECT TO INITIALIZE STATE FROM LOCATION ---
    // This effect runs only when the component is loaded via navigation,
    // ensuring state is correctly populated from `location.state`.
    useEffect(() => {
        if (location.state) {
            const { paymentInfo: pi, orderData: od, isBuyNow: ibn } = location.state;
            if (pi) {
                setPaymentInfo(pi);
                sessionStorage.setItem(PAYMENT_INFO_KEY, JSON.stringify(pi));
            }
            if (od) {
                setOrderData(od);
                sessionStorage.setItem(ORDER_DATA_KEY, JSON.stringify(od));
            }
            if (typeof ibn === 'boolean') {
                setIsBuyNow(ibn);
                sessionStorage.setItem(IS_BUY_NOW_KEY, JSON.stringify(ibn));
            }
        }
    }, [location.state]);


    // --- PAYMENT STATUS CHECKER ---
    // Wrapped in useCallback to memoize the function.
    const checkPaymentStatus = useCallback(async () => {
        if (!paymentInfo?.uniqueCode) return;

        console.log(`[POLLER] Checking status for ${paymentInfo.uniqueCode}`);
        try {
            const response = await fetch(`${API_BASE_URL}/api/ver0.0.1/orders/status/${paymentInfo.uniqueCode}`);
            if (!response.ok) {
                // Don't show error notification for pending status, just log it.
                console.error("Status check failed with status:", response.status);
                return;
            }

            const data = await response.json();
            if (data.status === 'Paid') {
                console.log("✅ Payment confirmed!");
                addNotification('Thanh toán thành công!', 'success');

                // Cleanup session storage
                sessionStorage.removeItem(PAYMENT_INFO_KEY);
                sessionStorage.removeItem(ORDER_DATA_KEY);
                sessionStorage.removeItem(IS_BUY_NOW_KEY);

                if (!isBuyNow) {
                    clearCart();
                }
                navigate('/success', { replace: true });
            }
        } catch (error) {
            // Avoid spamming notifications on network errors during polling
            console.error("Error polling payment status:", error);
        }
    }, [paymentInfo, navigate, clearCart, addNotification, isBuyNow]);


    // --- MAIN EFFECT FOR TIMER AND POLLING ---
    useEffect(() => {
        if (!paymentInfo) {
            // If there's no payment info after initial load, navigate away.
            const timer = setTimeout(() => {
                if (!sessionStorage.getItem(PAYMENT_INFO_KEY)) {
                    addNotification('Không tìm thấy thông tin thanh toán. Vui lòng thử lại.', 'error');
                    navigate('/');
                }
            }, 500);
            return () => clearTimeout(timer);
        }

        // --- Countdown Timer Logic ---
        const expiryDate = new Date(paymentInfo.expiryTime).getTime();
        const now = new Date().getTime();
        const initialTime = Math.floor((expiryDate - now) / 1000);
        setTimeLeft(initialTime > 0 ? initialTime : 0);

        clearInterval(countdownRef.current);
        countdownRef.current = setInterval(() => {
            setTimeLeft(prevTime => (prevTime > 0 ? prevTime - 1 : 0));
        }, 1000);

        // --- Polling Logic ---
        clearInterval(pollerRef.current);
        // Check immediately on load, then set interval
        checkPaymentStatus();
        pollerRef.current = setInterval(checkPaymentStatus, 5000);

        // --- ⭐ SMART POLLING IMPROVEMENT ⭐ ---
        // Add an event listener to check status immediately when the tab becomes visible.
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                console.log("Tab is visible again. Checking payment status immediately.");
                checkPaymentStatus();
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);

        // Cleanup function
        return () => {
            clearInterval(countdownRef.current);
            clearInterval(pollerRef.current);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [paymentInfo, navigate, addNotification, checkPaymentStatus]); // checkPaymentStatus is now a stable dependency


    // --- REGENERATION HANDLER ---
    const handleRegenerateCode = useCallback(async () => {
        if (!orderData) {
            addNotification('Không tìm thấy thông tin đơn hàng để tạo lại mã.', 'error');
            return;
        }
        setIsRegenerating(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/ver0.0.1/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData),
                credentials: 'include'
            });
            if (!response.ok) {
                const errorResponse = await response.json().catch(() => ({}));
                throw new Error(errorResponse.message || 'Không thể tạo lại mã QR.');
            }
            const newPaymentInfo = await response.json();
            setPaymentInfo(newPaymentInfo);
            sessionStorage.setItem(PAYMENT_INFO_KEY, JSON.stringify(newPaymentInfo));
            addNotification('Mã QR đã được tạo lại thành công!', 'success');
        } catch (err) {
            addNotification(err.message, 'error');
        } finally {
            setIsRegenerating(false);
        }
    }, [orderData, addNotification]);

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    };

    if (!paymentInfo) {
        return <div className="payment-loading">Đang tải thông tin thanh toán...</div>;
    }

    return (
        <div className="payment-container">
            <Helmet>
                <title>Thanh toán</title>
            </Helmet>
            <div className="payment-box">
                <div className="qr-section">
                    <div className={`qr-image-wrapper ${isExpired ? 'expired' : ''}`}>
                        <img className="qr-code-image" src={paymentInfo.qrUrl} alt="VietQR Payment Code" />
                        {isExpired && <div className="expired-overlay">Đã hết hạn</div>}
                    </div>
                </div>
                <div className="info-section">
                    <div className={`timer ${isExpired ? 'expired-text' : ''}`}>
                        {isExpired ? "Đã hết hạn" : formatTime(timeLeft)}
                    </div>
                    {isExpired ? (
                        <div className="expired-actions">
                            <h4>Mã QR đã hết hạn</h4>
                            <p>Vui lòng tạo lại mã để hoàn tất thanh toán.</p>
                            <button onClick={handleRegenerateCode} disabled={isRegenerating}>
                                {isRegenerating ? 'Đang tạo...' : 'Tạo lại mã QR'}
                            </button>
                        </div>
                    ) : (
                        <>
                            <h3>Lưu ý khi thanh toán:</h3>
                            <ol>
                                <li>Vui lòng <strong>không thay đổi</strong> nội dung chuyển khoản.</li>
                                <li>Mọi giao dịch sau khi mã hết hạn sẽ không được tự động xác nhận.</li>
                                <li>Sau khi thanh toán, hệ thống sẽ tự động xác nhận trong giây lát.</li>
                            </ol>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Payment;

