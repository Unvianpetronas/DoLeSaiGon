import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Checkout.css";
import { useAuth } from "../../contexts/AuthContext";
import { useCart } from "../../contexts/CartProvider";

// Define a constant for the session storage key
const IS_BUY_NOW_KEY = 'isBuyNowSession';

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();

  const { user, isLoading: isAuthLoading } = useAuth();
  const { cartItems: mainCartItems, loading: isCartLoading, clearCart } = useCart();

  // Determine if it's a "buy now" flow at the very beginning
  const buyNowCart = location.state?.buyNowCart;
  const isBuyNowFlow = !!buyNowCart; // Convert to boolean for clarity

  // IMPORTANT: This useEffect runs once when Checkout mounts.
  // It ensures the 'isBuyNow' flag is saved to sessionStorage
  // so the Payment component can retrieve it even after a refresh.
  useEffect(() => {
    sessionStorage.setItem(IS_BUY_NOW_KEY, JSON.stringify(isBuyNowFlow));

    // Cleanup: When the Checkout component unmounts, remove the flag.
    // This prevents stale 'isBuyNow' flags if the user navigates away from checkout.
    return () => {
      sessionStorage.removeItem(IS_BUY_NOW_KEY);
    };
  }, [isBuyNowFlow]); // Re-run if isBuyNowFlow somehow changes (unlikely here but good practice)


  const cartItems = buyNowCart || mainCartItems; // Prioritize the "buy now" item

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const [form, setForm] = useState({
    email: "",
    name: "",
    phone: "",
    address: "",
    ward: "",
    district: "",
    city: "",
    note: "",
    paymentMethod: "transfer",
    shippingMethodId: 1,
    voucherCode: "",
  });

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

    const guestAddress = [form.address, form.ward, form.district, form.city]
        .filter(part => part && part.trim() !== '')
        .join(', ');

    const checkoutRequest = {
      customerId: user ? user.id : null,
      guestName: form.name,
      guestEmail: form.email,
      guestPhone: form.phone,
      guestAddress: guestAddress,
      shippingMethodId: form.shippingMethodId,
      paymentMethodId: form.paymentMethod === 'transfer' ? 1 : 2,
      voucherCode: form.voucherCode.trim() === '' ? null : form.voucherCode.trim(),
      items: cartItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity
      }))
    };

    try {
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

      // Check the actual payment method from the form
      if (form.paymentMethod === 'transfer') {
        const paymentInfo = await response.json();

        // Pass the isBuyNowFlow flag directly in state
        // The Payment component will handle storing paymentInfo, orderData, AND isBuyNow from here.
        navigate("/payment", { state: { paymentInfo, orderData: checkoutRequest, isBuyNow: isBuyNowFlow } });
      } else {
        // For Cash, go directly to the success page
        // Only clear the main cart if we weren't in a "buy now" flow
        if (!isBuyNowFlow) { // Use the determined flag
          clearCart();
        }
        navigate("/success");
      }

    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculations now correctly use the dynamic 'cartItems' variable
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce((sum, item) => sum + (item.priceAtAddition || item.price) * item.quantity, 0);

  if (isAuthLoading || (isCartLoading && !buyNowCart)) {
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
                <div className="shipping-method-box">
                  <label>Phương thức vận chuyển</label>
                  <label className="radio-label">
                    <input type="radio" name="shippingMethodId" value={1} checked={form.shippingMethodId === 1} onChange={handleChange} />
                    <span>Lấy tại cửa hàng</span>
                  </label>
                  <label className="radio-label">
                    <input type="radio" name="shippingMethodId" value={2} checked={form.shippingMethodId === 2} onChange={handleChange} />
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
            <div className="voucher-section">
              <input type="text" name="voucherCode" placeholder="Mã giảm giá" value={form.voucherCode} onChange={handleChange} className="voucher-input"/>
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