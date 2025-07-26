import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Checkout.css";
import { useAuth } from "../../contexts/AuthContext";
import { useCart } from "../../contexts/CartProvider";
import { getProvinces, getDistricts, getWards } from "../../services/GhnApiService";
// BƯỚC 1: Import hook useNotification
import { useNotification } from "../../contexts/NotificationContext";
import { Helmet } from 'react-helmet-async';

// Define a constant for the session storage key
const IS_BUY_NOW_KEY = 'isBuyNowSession';

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();

  // BƯỚC 2: Khởi tạo hook
  const { addNotification } = useNotification();

  const { user, isLoading: isAuthLoading } = useAuth();
  const { cartItems: mainCartItems, loading: isCartLoading, clearCart } = useCart();

  const buyNowCart = location.state?.buyNowCart;
  const isBuyNowFlow = !!buyNowCart;

  useEffect(() => {
    sessionStorage.setItem(IS_BUY_NOW_KEY, JSON.stringify(isBuyNowFlow));
    return () => {
      sessionStorage.removeItem(IS_BUY_NOW_KEY);
    };
  }, [isBuyNowFlow]);

  const cartItems = buyNowCart || mainCartItems;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const [form, setForm] = useState({
    email: "", name: "", phone: "", address: "",
    provinceId: null, districtId: null, wardCode: null,
    note: "", paymentMethod: "transfer", shippingMethodId: 2, voucherCode: "",
  });

  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  // Tải danh sách tỉnh/thành và xử lý lỗi bằng notification
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const provinceData = await getProvinces();
        setProvinces(provinceData || []);
      } catch (error) {
        console.error("Failed to fetch provinces:", error);
        // BƯỚC 3: Dùng addNotification để hiển thị lỗi
        addNotification("Không thể tải danh sách tỉnh thành, vui lòng thử lại.", "error");
      }
    };
    fetchProvinces();
  }, [addNotification]); // Thêm addNotification vào dependency array

  useEffect(() => {
    if (!isAuthLoading && user) {
      setForm(prevForm => ({ ...prevForm, email: user.email || "", name: user.fullName || "", phone: user.phone || "" }));
    }
  }, [user, isAuthLoading]);

  const handleProvinceChange = async (e) => {
    const provinceId = parseInt(e.target.value, 10);
    setForm({ ...form, provinceId, districtId: null, wardCode: null });
    setDistricts([]);
    setWards([]);
    if (provinceId) {
      try {
        const districtData = await getDistricts(provinceId);
        setDistricts(districtData || []);
      } catch (error) {
        console.error("Failed to fetch districts:", error);
        addNotification("Không thể tải danh sách quận/huyện.", "error");
      }
    }
  };

  const handleDistrictChange = async (e) => {
    const districtId = parseInt(e.target.value, 10);
    setForm({ ...form, districtId, wardCode: null });
    setWards([]);
    if (districtId) {
      try {
        const wardData = await getWards(districtId);
        setWards(wardData || []);
      } catch (error) {
        console.error("Failed to fetch wards:", error);
        addNotification("Không thể tải danh sách phường/xã.", "error");
      }
    }
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    const finalValue = name === 'shippingMethodId' ? parseInt(value, 10) : value;
    setForm({ ...form, [name]: finalValue });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      addNotification("Giỏ hàng của bạn đang trống, không thể đặt hàng.", "error");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    const provinceName = provinces.find(p => p.ProvinceID === form.provinceId)?.ProvinceName || '';
    const districtName = districts.find(d => d.DistrictID === form.districtId)?.DistrictName || '';
    const wardName = wards.find(w => w.WardCode === form.wardCode)?.WardName || '';
    const fullAddressString = [form.address, wardName, districtName, provinceName].filter(Boolean).join(', ');

    const checkoutRequest = {
      customerId: user ? user.id : null,
      guestName: form.name,
      guestEmail: form.email,
      guestPhone: form.phone,
      guestAddress: fullAddressString,
      guestWardCode: form.wardCode,
      guestDistrictId: form.districtId,
      shippingMethodId: form.shippingMethodId,
      paymentMethodId: form.paymentMethod === 'transfer' ? 1 : 2,
      voucherCode: form.voucherCode.trim() || null,
      items: cartItems.map(item => ({ productId: item.productId, quantity: item.quantity }))
    };

    try {
      const response = await fetch("/api/ver0.0.1/orders", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(checkoutRequest),
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Không thể tạo đơn hàng. Vui lòng kiểm tra lại thông tin.' }));
        throw new Error(errorData.message);
      }

      if (form.paymentMethod === 'transfer') {
        const paymentInfo = await response.json();
        navigate("/payment", { state: { paymentInfo, orderData: checkoutRequest, isBuyNow: isBuyNowFlow } });
      } else {
        if (!isBuyNowFlow) {
          clearCart();
        }
        navigate("/success");
      }

    } catch (err) {
      // Thay vì set state, giờ ta dùng notification
      addNotification(err.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce((sum, item) => sum + (item.priceAtAddition || item.price) * item.quantity, 0);
  const shippingFee = form.shippingMethodId === 2 ? 22000 : 0;
  const finalTotal = totalPrice + shippingFee;

  if (isAuthLoading || (isCartLoading && !buyNowCart)) {
    return <div className="checkout-container"><p>Đang tải thông tin thanh toán...</p></div>;
  }

  return (
      <div className="checkout-container">
        <Helmet>
          <title>Checkout</title>
        </Helmet>
        <form onSubmit={handleSubmit} className="checkout-grid">
          <div className="checkout-form">
            <h2>Thông tin nhận hàng</h2>
            <div className="checkout-two-column">
              <div className="left-column">
                <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} className="form-input" required />
                <input name="name" placeholder="Họ và tên" value={form.name} onChange={handleChange} className="form-input" required />
                <input name="phone" placeholder="Số điện thoại" value={form.phone} onChange={handleChange} className="form-input" required />

                <select name="provinceId" value={form.provinceId || ''} onChange={handleProvinceChange} className="form-input" required>
                  <option value="" disabled>Chọn Tỉnh/Thành phố</option>
                  {provinces.map(p => <option key={p.ProvinceID} value={p.ProvinceID}>{p.ProvinceName}</option>)}
                </select>

                <select name="districtId" value={form.districtId || ''} onChange={handleDistrictChange} className="form-input" required disabled={!form.provinceId}>
                  <option value="" disabled>Chọn Quận/Huyện</option>
                  {districts.map(d => <option key={d.DistrictID} value={d.DistrictID}>{d.DistrictName}</option>)}
                </select>

                <select name="wardCode" value={form.wardCode || ''} onChange={handleChange} className="form-input" required disabled={!form.districtId}>
                  <option value="" disabled>Chọn Phường/Xã</option>
                  {wards.map(w => <option key={w.WardCode} value={w.WardCode}>{w.WardName}</option>)}
                </select>

                <input name="address" placeholder="Số nhà, tên đường" value={form.address} onChange={handleChange} className="form-input" required />
              </div>
              <div className="right-column">
                <textarea name="note" placeholder="Ghi chú (tùy chọn)" value={form.note} onChange={handleChange} className="form-textarea" />
                <div className="shipping-method-box">
                  <label>Phương thức vận chuyển</label>
                  <label className="radio-label">
                    <input type="radio" name="shippingMethodId" value={1} checked={form.shippingMethodId === 1} onChange={handleChange} />
                    <span>Lấy tại cửa hàng (Miễn phí)</span>
                  </label>
                  <label className="radio-label">
                    <input type="radio" name="shippingMethodId" value={2} checked={form.shippingMethodId === 2} onChange={handleChange} />
                    <span>Giao hàng GHN (20,000₫)</span>
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
                  <div className="summary-line">
                    <span>Tạm tính</span>
                    <span>{totalPrice.toLocaleString()}₫</span>
                  </div>
                  <div className="summary-line">
                    <span>Phí vận chuyển</span>
                    <span>{shippingFee.toLocaleString()}₫</span>
                  </div>
                  <div className="summary-total">
                    <span>Tổng cộng</span>
                    <span className="text-total">{finalTotal.toLocaleString()}₫</span>
                  </div>
                </>
            ) : (
                <p>Giỏ hàng của bạn đang trống.</p>
            )}
            {/*<div className="voucher-section">*/}
            {/*  <input type="text" name="voucherCode" placeholder="Mã giảm giá" value={form.voucherCode} onChange={handleChange} className="voucher-input"/>*/}
            {/*  <button type="button" className="apply-voucher-btn">Áp dụng</button>*/}
            {/*</div>*/}
            <button type="submit" className="checkout-btn" disabled={isSubmitting || cartItems.length === 0}>
              {isSubmitting ? 'Đang xử lý...' : 'Đặt hàng'}
            </button>
          </div>
        </form>
      </div>
  );
}