import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartProvider';
import { useNotification } from '../../contexts/NotificationContext';
import './Payment.css';

// --- Constants for Session Storage Keys ---
const PAYMENT_INFO_KEY = 'paymentInfo';
const ORDER_DATA_KEY = 'orderData'; // Keep this for consistency
const IS_BUY_NOW_KEY = 'isBuyNowSession'; // Key for the isBuyNow flag

const Payment = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { clearCart } = useCart();
    const { addNotification } = useNotification();

    // --- STATE MANAGEMENT ---
    // Initialize state using a function for lazy evaluation.
    // This function runs ONLY ONCE when the component mounts.
    const [paymentInfo, setPaymentInfo] = useState(() => {
        const fromLocation = location.state?.paymentInfo;
        if (fromLocation) {
            sessionStorage.setItem(PAYMENT_INFO_KEY, JSON.stringify(fromLocation));
            return fromLocation;
        }
        return JSON.parse(sessionStorage.getItem(PAYMENT_INFO_KEY));
    });

    const [orderData, setOrderData] = useState(() => {
        const fromLocation = location.state?.orderData;
        if (fromLocation) {
            sessionStorage.setItem(ORDER_DATA_KEY, JSON.stringify(fromLocation));
            return fromLocation;
        }
        return JSON.parse(sessionStorage.getItem(ORDER_DATA_KEY));
    });

    // Initialize the isBuyNow flag as well, ensuring it's persistent
    const [isBuyNow, setIsBuyNow] = useState(() => {
        const fromLocation = location.state?.isBuyNow;
        if (typeof fromLocation === 'boolean') { // Check if it's explicitly passed as boolean
            sessionStorage.setItem(IS_BUY_NOW_KEY, JSON.stringify(fromLocation));
            return fromLocation;
        }
        const fromSession = JSON.parse(sessionStorage.getItem(IS_BUY_NOW_KEY));
        return typeof fromSession === 'boolean' ? fromSession : false; // Default to false
    });

    const [timeLeft, setTimeLeft] = useState(0);
    const [isRegenerating, setIsRegenerating] = useState(false);

    const pollerRef = useRef(null);
    const countdownRef = useRef(null);

    const isExpired = timeLeft <= 0;

    // --- MAIN EFFECT FOR TIMER AND POLLING ---
    useEffect(() => {
        if (!paymentInfo) {
            addNotification('Không tìm thấy thông tin thanh toán. Vui lòng thử lại.', 'error');
            navigate('/');
            return;
        }

        const expiryDate = new Date(paymentInfo.expiryTime).getTime();
        const now = new Date().getTime();
        const initialTime = Math.floor((expiryDate - now) / 1000);
        setTimeLeft(initialTime > 0 ? initialTime : 0);

        // Clear any existing intervals before setting new ones (important on re-render, like after regeneration)
        clearInterval(countdownRef.current);
        clearInterval(pollerRef.current);

        // Set up the countdown timer
        countdownRef.current = setInterval(() => {
            setTimeLeft(prevTime => {
                if (prevTime <= 1) {
                    clearInterval(countdownRef.current);
                    return 0;
                }
                return prevTime - 1;
            });
        }, 1000);

        // Set up the payment status poller
        const checkPaymentStatus = async () => {
            if (new Date().getTime() > expiryDate) {
                console.log("QR Code has expired on client side. Stopping poller.");
                clearInterval(pollerRef.current);
                return;
            }

            try {
                const response = await fetch(`http://localhost:8080/api/ver0.0.1/orders/status/${paymentInfo.uniqueCode}`);
                if (response.ok) {
                    const data = await response.json();
                    console.log("Polling Response:", data);

                    if (data.status === 'Paid') {
                        console.log("Payment confirmed!");
                        // Clear all relevant stored data on success
                        sessionStorage.removeItem(PAYMENT_INFO_KEY);
                        sessionStorage.removeItem(ORDER_DATA_KEY);
                        sessionStorage.removeItem(IS_BUY_NOW_KEY); // Clear the buy now flag too

                        if (!isBuyNow) { // Use the 'isBuyNow' state from the component
                            clearCart();
                        }
                        addNotification('Thanh toán thành công!', 'success');
                        navigate('/success');
                    }
                } else {
                    const errorData = await response.json().catch(() => ({ message: 'Lỗi không xác định khi kiểm tra trạng thái.' }));
                    console.error("Error response from status check:", errorData.message || response.statusText);
                }
            } catch (error) {
                console.error("Error polling payment status:", error);
                addNotification('Lỗi khi kiểm tra trạng thái thanh toán.', 'error');
            }
        };

        checkPaymentStatus().then();
        pollerRef.current = setInterval(checkPaymentStatus, 5000);

        // Cleanup function: runs when the component unmounts or dependencies change
        return () => {
            clearInterval(countdownRef.current);
            clearInterval(pollerRef.current);
        };
    }, [paymentInfo, navigate, clearCart, addNotification, isBuyNow]); // Add isBuyNow to dependencies

    // --- Regeneration Handler ---
    const handleRegenerateCode = async () => {
        setIsRegenerating(true);
        try {
            // Ensure orderData is available for regeneration
            if (!orderData) {
                // If orderData is unexpectedly null, this indicates a deeper issue
                // (e.g., initial load failed and was not fixed by F5)
                // In a real app, you might navigate back or show a fatal error.
                console.error("Order data is missing for regeneration!");
                addNotification('Không tìm thấy thông tin đơn hàng để tạo lại mã QR. Vui lòng liên hệ hỗ trợ.', 'error');
                return; // Stop here if critical data is missing
            }

            const response = await fetch("http://localhost:8080/api/ver0.0.1/orders", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData), // Re-using the existing orderData state
                credentials: 'include'
            });
            if (!response.ok) {
                const errorResponse = await response.json().catch(() => ({ message: 'Lỗi không xác định khi tạo lại mã QR.' }));
                throw new Error(errorResponse.message || 'Không thể tạo lại mã QR.');
            }

            const newPaymentInfo = await response.json();

            // --- IMPORTANT: Update paymentInfo state AND sessionStorage ---
            setPaymentInfo(newPaymentInfo);
            sessionStorage.setItem(PAYMENT_INFO_KEY, JSON.stringify(newPaymentInfo));

            // --- Crucial: If regeneration implies a *new* order for "buy now"
            // (e.g., if you process it as a fresh order with a new ID),
            // you might want to update orderData here too if the backend returns it.
            // For now, assuming orderData remains the same for regeneration.

            addNotification('Mã QR đã được tạo lại thành công!', 'success');

        } catch (err) {
            console.error("Regenerate code error:", err);
            addNotification(err.message, 'error');
        } finally {
            setIsRegenerating(false);
        }
    };

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
            <div className="payment-box">
                <div className="qr-section">
                    <div className={`qr-image-wrapper ${isExpired ? 'expired' : ''}`}>
                        <img className="qr-code-image" src={paymentInfo.qrUrl} alt="VietQR Payment Code" />
                        {isExpired && <div className="expired-overlay">Đã hết hạn</div>}
                    </div>
                </div>
                <div className="info-section">
                    <div className={`timer ${isExpired ? 'expired-text' : ''}`}>
                        {formatTime(timeLeft)}
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
                            <h3>Lưu ý:</h3>
                            <ol>
                                <li>Vui lòng <strong>không thay đổi</strong> nội dung chuyển khoản.</li>
                                <li>Bất kỳ giao dịch nào diễn ra sau thời gian quy định đều sẽ phải liên lạc với bộ phận chăm sóc khách hàng.</li>
                                <li>Sau khi thanh toán vui lòng đợi, để hệ thống xác nhận đã thực hiện giao dịch.</li>
                            </ol>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Payment;