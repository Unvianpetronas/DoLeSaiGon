import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Checkout.css";

export default function Checkout() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    name: "",
    phone: "",
    address: "",
    city: "",
    district: "",
    ward: "",
    note: "",
    paymentMethod: "transfer",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Dữ liệu đơn hàng:", form);

    // TODO: Gửi đơn hàng lên server nếu có API

    // Chuyển sang trang "Đặt hàng thành công"
    navigate("/success");
  };

  return (
    <div className="checkout-container">
      <div className="checkout-grid">
        {/* Cột trái: Form thông tin nhận hàng */}
        <div className="checkout-form">
          <h2>Thông tin nhận hàng</h2>
          <div className="checkout-two-column">
            <div className="left-column">
              <input name="email" placeholder="Email" value={form.email} onChange={handleChange} className="form-input" />
              <input name="name" placeholder="Họ và tên" value={form.name} onChange={handleChange} className="form-input" />
              <input name="phone" placeholder="Số điện thoại" value={form.phone} onChange={handleChange} className="form-input" />
              <input name="address" placeholder="Địa chỉ" value={form.address} onChange={handleChange} className="form-input" />
              <input name="city" placeholder="Tỉnh thành" value={form.city} onChange={handleChange} className="form-input" />
              <input name="district" placeholder="Quận huyện" value={form.district} onChange={handleChange} className="form-input" />
              <input name="ward" placeholder="Phường xã" value={form.ward} onChange={handleChange} className="form-input" />
            </div>

            <div className="right-column">
              <textarea name="note" placeholder="Ghi chú" value={form.note} onChange={handleChange} className="form-textarea" />

              <div className="payment-method-box">
                <label className="block mb-2 font-medium">Phương thức thanh toán</label>
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

        {/* Cột phải: Thông tin đơn hàng */}
        <div className="checkout-summary">
          <h2>Đơn hàng (2 sản phẩm)</h2>
          <div className="summary-line">
            <span>Set 12 Thượng Vy Yến Đảo</span>
            <span>1.656.000₫</span>
          </div>
          <div className="summary-line">
            <span>Thượng Vy Yến biển - Kid’s Cam</span>
            <span>57.000₫</span>
          </div>
          <div className="summary-total">
            <span>Tổng cộng</span>
            <span className="text-total">1.713.000₫</span>
          </div>
          <button className="checkout-btn" onClick={handleSubmit}>Đặt hàng</button>

          <div className="checkout-note">
            <p><strong>Chính sách thanh toán</strong></p>
            <p>Khách hàng thanh toán trực tiếp tại cửa hàng hoặc chuyển khoản trước khi nhận hàng.</p>
            <p>Khách hàng có thể liên hệ hotline để được hỗ trợ đổi trả sản phẩm hoặc khiếu nại.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
