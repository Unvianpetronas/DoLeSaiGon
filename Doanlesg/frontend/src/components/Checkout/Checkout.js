import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Checkout.css";
import { useAuth } from "../../contexts/AuthContext";
import { useCart } from "../../contexts/CartProvider";

export default function Checkout() {
  const navigate = useNavigate();

  const { user, isLoading: isAuthLoading } = useAuth();
  const { cartItems, loading: isCartLoading, clearCart } = useCart();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // --- 1. ADD NEW FIELDS TO THE FORM STATE ---
  const [form, setForm] = useState({
    email: "",
    name: "",
    phone: "",
    address: "",
    ward: "",
    city: "",
    note: "",
    paymentMethod: "transfer",
    shippingMethodId: 1, // Default to the first shipping option
    voucherCode: "",
  });

  // This useEffect handles auto-filling the user's info
  useEffect(() => {
    if (!isAuthLoading && user) {
      setForm(prevForm => ({
        ...prevForm,
        email: user.email || "",
        name: user.fullName || "",
        phone: user.phone || "",
      }));
    }
  }, [user, isAuthLoading]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    // Convert value to a number if it's the shippingMethodId radio button
    const finalValue = name === 'shippingMethodId' ? parseInt(value, 10) : value;
    setForm({ ...form, [name]: finalValue });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      setSubmitError("Giỏ hàng của bạn đang trống, không thể đặt hàng.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    // Combine separate address fields into a single string.
    const guestAddress = [form.address, form.ward, form.city]
        .filter(part => part && part.trim() !== '')
        .join(', ');

    // --- 2. BUILD THE FINAL JSON PAYLOAD ---
    // This now includes all fields from your DTO
    const checkoutRequest = {
      customerId: user ? user.id : null,
      guestName: form.name,
      guestEmail: form.email,
      guestPhone: form.phone,
      guestAddress: guestAddress,
      shippingMethodId: form.shippingMethodId,
      paymentMethodId: form.paymentMethod === 'transfer' ? 1 : 2, // Assuming 1=transfer, 2=cash
      voucherCode: form.voucherCode.trim() === '' ? null : form.voucherCode.trim(),
      items: cartItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity
      }))
    };

    try {
      // The rest of the fetch logic remains the same
      const response = await fetch("http://localhost:8080/api/ver0.0.1/orders", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(checkoutRequest),
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Không thể tạo đơn hàng.' }));
        throw new Error(errorData.message);
      }

      if (form.paymentMethod === 'transfer') {
        // FLOW 1: For Bank Transfer, get QR info and go to payment page
        const paymentInfo = await response.json();
        // The cart will be cleared AFTER payment is confirmed on the next page
        navigate("/payment", { state: { paymentInfo, orderData: checkoutRequest } });
      } else {
        // FLOW 2: For Cash on Delivery, clear cart and go directly to success
        clearCart();
        navigate("/success");
      }

    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce((sum, item) => sum + (item.priceAtAddition || item.price) * item.quantity, 0);

  if (isAuthLoading || isCartLoading) {
    return <div className="checkout-container"><p>Đang tải thông tin thanh toán...</p></div>;
  }

  return (
      <div className="checkout-container">
        <form onSubmit={handleSubmit} className="checkout-grid">
          <div className="checkout-form">
            <h2>Thông tin nhận hàng</h2>
            <div className="checkout-two-column">
              <div className="left-column">
                <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} className="form-input" required />
                <input name="name" placeholder="Họ và tên" value={form.name} onChange={handleChange} className="form-input" required />
                <input name="phone" placeholder="Số điện thoại" value={form.phone} onChange={handleChange} className="form-input" required />
                <input name="address" placeholder="Số nhà, tên đường" value={form.address} onChange={handleChange} className="form-input" required />
                <input name="ward" placeholder="Phường/Xã" value={form.ward} onChange={handleChange} className="form-input" required />
                <input name="city" placeholder="Tỉnh/Thành phố" value={form.city} onChange={handleChange} className="form-input" required />
              </div>
              <div className="right-column">
                <textarea name="note" placeholder="Ghi chú (tùy chọn)" value={form.note} onChange={handleChange} className="form-textarea" />

                {/* --- 3. ADD SHIPPING METHOD OPTIONS --- */}
                <div className="payment-method-box">
                  <label>Phương thức vận chuyển</label>
                  <label className="radio-label">
                    <input type="radio" name="shippingMethodId" value="1" checked={form.shippingMethodId === 1} onChange={handleChange} />
                    <span>lấy tại cửa hàng</span>
                  </label>
                  <label className="radio-label">
                    <input type="radio" name="shippingMethodId" value="2" checked={form.shippingMethodId === 2} onChange={handleChange} />
                    <span>Giao hàng tiêu chuẩn (20,000₫)</span>
                  </label>
                </div>

                <div className="payment-method-box">
                  <label>Phương thức thanh toán</label>
                  <label className="radio-label">
                    <input type="radio" name="paymentMethod" value="transfer" checked={form.paymentMethod === "transfer"} onChange={handleChange} />
                    <span>Chuyển khoản</span>
                  </label>
                  <label className="radio-label">
                    <input type="radio" name="paymentMethod" value="cash" checked={form.paymentMethod === "cash"} onChange={handleChange} />
                    <span>Tiền mặt</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="checkout-summary">
            <h2>Đơn hàng ({totalItems} sản phẩm)</h2>

            {cartItems.length > 0 ? (
                <>
                  {cartItems.map(item => (
                      <div className="summary-line" key={item.productId}>
                        <span>{item.productName} (x{item.quantity})</span>
                        <span>{((item.priceAtAddition || item.price) * item.quantity).toLocaleString()}₫</span>
                      </div>
                  ))}
                  <div className="summary-total">
                    <span>Tổng cộng</span>
                    <span className="text-total">{totalPrice.toLocaleString()}₫</span>
                  </div>
                </>
            ) : (
                <p>Giỏ hàng của bạn đang trống.</p>
            )}

            {/* --- 4. ADD VOUCHER CODE INPUT --- */}
            <div className="voucher-section">
              <input
                  type="text"
                  name="voucherCode"
                  placeholder="Mã giảm giá"
                  value={form.voucherCode}
                  onChange={handleChange}
                  className="voucher-input"
              />
              <button type="button" className="apply-voucher-btn">Áp dụng</button>
            </div>

            <button type="submit" className="checkout-btn" disabled={isSubmitting || cartItems.length === 0}>
              {isSubmitting ? 'Đang xử lý...' : 'Đặt hàng'}
            </button>
            {submitError && <p className="error-message">{submitError}</p>}

            <div className="checkout-note">
              <p><strong>Chính sách thanh toán</strong></p>
              <p>Khách hàng thanh toán trực tiếp tại cửa hàng hoặc chuyển khoản trước khi nhận hàng.</p>
            </div>
          </div>
        </form>
      </div>
  );
}