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

    const [paymentInfo, setPaymentInfo] = useState(location.state?.paymentInfo);
    const [orderData, setOrderData] = useState(location.state?.orderData);
    const [timeLeft, setTimeLeft] = useState(0);
    const [isRegenerating, setIsRegenerating] = useState(false);

    // Use refs to hold interval IDs. This prevents re-renders from interfering with them.
    const pollerRef = useRef(null);
    const countdownRef = useRef(null);

    // This is now a derived state. It's simpler and less prone to bugs.
    const isExpired = timeLeft <= 0;

    // This single, robust useEffect handles all timers and polling.
    // It runs only when the paymentInfo changes (i.e., on load and on regeneration).
    useEffect(() => {
        if (!paymentInfo) {
            navigate('/');
            return; // Exit if there's no data
        }

        // 1. Calculate and set the initial time
        const expiryDate = new Date(paymentInfo.expiryTime).getTime();
        const now = new Date().getTime();
        const initialTime = Math.floor((expiryDate - now) / 1000);
        setTimeLeft(initialTime > 0 ? initialTime : 0);

        // 2. Set up the countdown timer for the UI
        countdownRef.current = setInterval(() => {
            setTimeLeft(prevTime => {
                if (prevTime <= 1) {
                    clearInterval(countdownRef.current); // Stop countdown when it hits 0
                    return 0;
                }
                return prevTime - 1;
            });
        }, 1000);

        // 3. Set up the payment status poller
        const checkPaymentStatus = async () => {
            // Stop polling if the component has already determined the QR is expired
            if (new Date().getTime() > expiryDate) {
                console.log("QR Code has expired. Stopping poller.");
                clearInterval(pollerRef.current);
                return;
            }

            try {
                const response = await fetch(`http://localhost:8080/api/ver0.0.1/orders/status/${paymentInfo.uniqueCode}`);
                if (response.ok) {
                    const data = await response.json();
                    console.log("Polling Response:", data); // You will see this every 5 seconds

                    if (data.status === 'Paid') {
                        console.log("Payment confirmed!");
                        const isBuyNow = location.state?.isBuyNow;
                        if (!isBuyNow) {
                            clearCart();
                        }
                        navigate('/success'); // Redirect on successful payment
                    }
                }
            } catch (error) {
                console.error("Error polling payment status:", error);
            }
        };

        // Start polling immediately and then every 5 seconds
        checkPaymentStatus().then();
        pollerRef.current = setInterval(checkPaymentStatus, 5000);

        // 4. Cleanup function: this runs when the component unmounts or paymentInfo changes
        return () => {
            clearInterval(countdownRef.current);
            clearInterval(pollerRef.current);
        };
    }, [paymentInfo, navigate, clearCart, location.state]);


    const handleRegenerateCode = async () => {
        setIsRegenerating(true);
        try {
            const response = await fetch("http://localhost:8080/api/ver0.0.1/orders", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData),
                credentials: 'include'
            });
            if (!response.ok) throw new Error('Không thể tạo lại mã QR.');

            const newPaymentInfo = await response.json();
            setPaymentInfo(newPaymentInfo); // This will trigger the main useEffect to restart everything

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