import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Cart.css";
import { FaShoppingCart, FaCartPlus } from "react-icons/fa";
import { useAuth } from "../../contexts/AuthContext";
import { useCart } from "../../contexts/CartProvider"; // 1. Import the primary cart hook
import { useNotification } from "../../contexts/NotificationContext";

const Cart = () => {
  const navigate = useNavigate();
  const scrollRef = useRef(null);

  // 2. Get everything needed from the contexts
  const { user } = useAuth();
  const {
    cartItems,
    loading,
    updateQuantity,
    removeItem,
    addToCart
  } = useCart();
  const { addNotification } = useNotification();

  // Mock data for recommended products (can stay as is)
  const recommendedProducts = [
    { id: 3, productName: "Tổ Yến Tinh Chế cho bé BaBy (loại 3)", price: 2900000, image: "/images/to_yen.png" },
    { id: 4, productName: "Cao Hồng Sâm KGS Hàn Quốc Hộp 1 Lọ 240g", price: 3700000, image: "/images/to_yen.png" },
    { id: 5, productName: "Set 6 Thưởng Vị Yến Đảo", price: 799000, image: "/images/to_yen.png" },
    { id: 6, productName: "Chè Dưỡng Nhan Đông Trùng", price: 500000, image: "/images/to_yen.png" },
  ];

  // 3. The large useEffect for fetching data is NO LONGER NEEDED. The CartProvider handles it.

  // 4. Simplify handler functions to call the context methods
  const handleUpdateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      addNotification("Số lượng sản phẩm phải lớn hơn 0.", "error");
      return;
    }
    updateQuantity(productId, newQuantity);
  };

  const handleRemoveItem = (productId) => {
    removeItem(productId);
    addNotification("Đã xóa sản phẩm khỏi giỏ hàng.", "success");
  };

  const handleAddToCart = (product) => {
    // Pass the whole product object to the context
    addToCart(product, 1);
    addNotification("Đã thêm sản phẩm vào giỏ hàng!", "success");
  };

  const handleCheckout = () => {
    // A guest can check out, but a user must be logged in to see their order history.
    // The checkout page will handle the final order submission.
    if (cartItems.length > 0) {
      navigate("/checkout");
    }
  };

  // The total calculation remains the same
  const total = cartItems.reduce((sum, item) => sum + (item.priceAtAddition || item.price) * item.quantity, 0);

  const scroll = (direction) => {
    scrollRef.current.scrollBy({ left: direction * 300, behavior: "smooth" });
  };

  // 5. Use the loading state from the context
  if (loading) {
    return <div className="cart-container"><p>Đang tải giỏ hàng...</p></div>;
  }

  return (
      <div className="cart-container">
        <div className="cart-main">
          <div className="cart-left">
            <h2>Giỏ hàng của bạn</h2>
            {/* 6. Simplified display logic. It works for both guests and users. */}
            {cartItems.length === 0 ? (
                <div className="empty-cart">
                  <FaShoppingCart size={64} color="#ccc" />
                  <p>Giỏ hàng của bạn đang trống</p>
                </div>
            ) : (
                <div className="cart-table">
                  <div className="cart-header">
                    <div className="column image">Hình ảnh</div>
                    <div className="column name">Sản phẩm</div>
                    <div className="column total">Thành tiền</div>
                  </div>
                  {cartItems.map((item) => (
                      <div key={item.productId} className="cart-row">
                        <div className="column image">
                          <img src={`/products/${item.productId}.png`} alt={item.productName} className="cart-item-image" />
                        </div>
                        <div className="column name">
                          <div className="item-name">{item.productName}</div>
                          <div className="quantity-controls">
                            <button onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}>-</button>
                            <span>{item.quantity}</span>
                            <button onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}>+</button>
                          </div>
                          <button className="remove-btn" onClick={() => handleRemoveItem(item.productId)}>Xóa</button>
                        </div>
                        <div className="column total">{((item.priceAtAddition || item.price) * item.quantity).toLocaleString()}đ</div>
                      </div>
                  ))}
                </div>
            )}
          </div>
          <div className="cart-right">
            <div className="order-summary">
              <h3>Thông Tin Đơn Hàng</h3>
              <div className="summary-row">
                <span>Tổng tiền:</span>
                <span className="summary-price">{total.toLocaleString()}đ</span>
              </div>
              <p className="summary-note">* Phí vận chuyển sẽ được tính ở trang thanh toán.</p>
              <button className="checkout-btn" onClick={handleCheckout} disabled={cartItems.length === 0}>
                Thanh toán ngay
              </button>
            </div>
          </div>
        </div>
        <div className="suggestion-box">
          <h3>Có Thể Bạn Thích</h3>
          <div className="slider-wrapper">
            <button onClick={() => scroll(-1)} className="slider-btn left">◀</button>
            <div className="recommended-products" ref={scrollRef}>
              {recommendedProducts.map((product) => (
                  <div key={product.id} className="recommended-item">
                    <div className="img-wrapper">
                      <button className="add-to-cart-btn icon-only" onClick={() => handleAddToCart(product)} title="Thêm vào giỏ hàng">
                        <FaCartPlus size={20} />
                      </button>
                      <img src={product.image} alt={product.productName} />
                    </div>
                    <span className="recommended-name">{product.productName}</span>
                    <span className="recommended-price">{product.price.toLocaleString()}đ</span>
                  </div>
              ))}
            </div>
            <button onClick={() => scroll(1)} className="slider-btn right">▶</button>
          </div>
        </div>
      </div>
  );
};

export default Cart;
