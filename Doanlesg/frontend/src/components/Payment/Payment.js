import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartProvider';
import { useNotification } from '../../contexts/NotificationContext';
import './Payment.css';

const Payment = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { clearCart } = useCart();
    const { addNotification } = useNotification();

    // --- STATE MANAGEMENT ---
    const [paymentInfo, setPaymentInfo] = useState(location.state?.paymentInfo);
    const [orderData, setOrderData] = useState(location.state?.orderData);
    const [timeLeft, setTimeLeft] = useState(0);
    const [isRegenerating, setIsRegenerating] = useState(false);

    // Use a ref to hold the interval IDs so they don't trigger re-renders
    const pollerRef = useRef(null);

    // --- DERIVED STATE ---
    // isExpired is now calculated directly from timeLeft, not managed separately.
    const isExpired = timeLeft <= 0;

    // --- MAIN EFFECT FOR TIMER AND POLLING ---
    useEffect(() => {
        // This effect runs only when paymentInfo changes (e.g., after regeneration)
        if (!paymentInfo) {
            navigate('/');
            return;
        }

        // 1. Calculate initial time
        const expiryDate = new Date(paymentInfo.expiryTime).getTime();
        const now = new Date().getTime();
        const initialTime = Math.floor((expiryDate - now) / 1000);
        setTimeLeft(initialTime > 0 ? initialTime : 0);

        // 2. Setup the polling interval
        const checkPaymentStatus = async () => {
            try {
                const response = await fetch(`http://localhost:8080/api/ver0.0.1/orders/status/${paymentInfo.uniqueCode}`);
                if (response.ok) {
                    const data = await response.json();
                    console.log("Polling Response:", data); // You will see this every 5 seconds
                    if (data.status === 'Paid') {
                        console.log("Payment confirmed!");
                        clearCart();
                        navigate('/success');
                    }
                }
            } catch (error) {
                console.error("Error polling payment status:", error);
            }
        };

        // Start polling immediately and then every 5 seconds
        checkPaymentStatus(); // Initial check
        pollerRef.current = setInterval(checkPaymentStatus, 5000);

        // 3. Cleanup function to stop polling when the component unmounts or paymentInfo changes
        return () => {
            if (pollerRef.current) {
                clearInterval(pollerRef.current);
            }
        };
    }, [paymentInfo, clearCart, navigate]);


    // --- EFFECT FOR COUNTDOWN DISPLAY ---
    useEffect(() => {
        // If time runs out, stop the timers
        if (timeLeft <= 0) {
            if (pollerRef.current) clearInterval(pollerRef.current);
            return;
        }

        // This timer just updates the UI every second
        const countdownTimer = setInterval(() => {
            setTimeLeft(prevTime => prevTime - 1);
        }, 1000);

        return () => clearInterval(countdownTimer);
    }, [timeLeft]);


    // --- HANDLER FUNCTIONS ---
    const handleRegenerateCode = async () => {
        setIsRegenerating(true);
        try {
            const response = await fetch("http://localhost:8080/api/ver0.0.1/orders", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData),
            });
            if (!response.ok) throw new Error('Không thể tạo lại mã QR.');

            const newPaymentInfo = await response.json();
            setPaymentInfo(newPaymentInfo); // This will trigger the main useEffect to restart the timer and polling

        } catch (err) {
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

    if (!paymentInfo) return null;

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
                        {isExpired ? "Hết hạn" : formatTime(timeLeft)}
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
                                <li>Đối với khách hàng không có tài khoản vui lòng minh chứng hóa đơn được gửi qua mail hoặc biên lai giao dịch của ngân hàng.</li>
                            </ol>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Payment;