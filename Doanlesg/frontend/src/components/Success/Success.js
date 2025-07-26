import React from 'react';
import './Success.css';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

function Success() {
    const navigate = useNavigate();
    const location = useLocation();

    // Get the orderId from the state passed during navigation
    // This could be the order ID for cash payments or the unique code for QR payments
    const orderCode = location.state?.orderCode;
    const orderId = location.state?.orderId;

    return (
        <div className="success-page">
            <Helmet>
                <title>Thanh toán thành công</title>
            </Helmet>
            <div className="success-card">
              <div className="success-notification">
                <p>Cảm ơn bạn đã tin tưởng và đặt hàng tại DoleSaigon.</p>
                {orderId && (
                    <p className="order-code">Mã đơn hàng của bạn là: <strong>{orderCode || orderId}</strong></p>
                )}
                <p>Chúng tôi sẽ liên hệ với bạn để xác nhận đơn hàng trong thời gian sớm nhất.</p>
              </div>
                <div className="success-actions">
                    {orderId && (
                        <button
                            className="success-btn view-order"
                            onClick={() => navigate(`/details/${orderId}`)}
                        >
                            Xem chi tiết đơn hàng
                        </button>
                    )}
                    <button
                        className="success-btn continue-shopping"
                        onClick={() => navigate('/')}
                    >
                        Tiếp tục mua sắm
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Success;