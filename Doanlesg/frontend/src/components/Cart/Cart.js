import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Cart.css";
import { FaShoppingCart, FaCartPlus } from "react-icons/fa";
import { useAuth } from "../../contexts/AuthContext";

const Cart = () => {
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [popupMessage, setPopupMessage] = useState("");

  const recommendedProducts = [
    { productId: 3, productName: "Tổ Yến Tinh Chế cho bé BaBy (loại 3)", priceAtAddition: 2900000, image: "/images/to_yen.png" },
    { productId: 4, productName: "Cao Hồng Sâm KGS Hàn Quốc Hộp 1 Lọ 240g", priceAtAddition: 3700000, image: "/images/to_yen.png" },
    { productId: 5, productName: "Set 6 Thưởng Vị Yến Đảo", priceAtAddition: 799000, image: "/images/to_yen.png" },
    { productId: 6, productName: "Chè Dưỡng Nhan Đông Trùng", priceAtAddition: 500000, image: "/images/to_yen.png" },
  ];

  const showPopupMessage = (message) => {
    setPopupMessage(message);
    setTimeout(() => {
      setPopupMessage("");
    }, 3000);
  };

  const fetchCartItems = async () => {
    if (!user) {
      setCartItems([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("http://localhost:8080/api/ver0.0.1/cartItem/allCartItem", {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Không thể tải giỏ hàng của bạn.");
      }
      const data = await response.json();
      setCartItems(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCartItems();
  }, [user]);

  // This function sends the quantity update to the database and handles errors
  const sendQuantityUpdateToDB = async (productId, newQuantity, originalCart) => {
    try {
      const response = await fetch(
          `http://localhost:8080/api/ver0.0.1/cartItem/updateId?productId=${productId}&quantity=${newQuantity}`,
          {
            method: "PUT",
            credentials: "include",
          }
      );
      console.log(`Response status: ${response.status}`);
      if (!response.ok) {
        throw new Error("Cập nhật số lượng sản phẩm trên hệ thống thất bại.");
      }
    } catch (err) {
      // Revert the UI state back to the original if the update fails
      setError(err.message);
      setCartItems(originalCart);
      showPopupMessage("Cập nhật thất bại. Vui lòng thử lại.");
    }
  };

  // The main function that updates the UI and then calls the DB update function
  const handleUpdateQuantity = (productId, newQuantity) => {
    console.log(`Updating quantity for productId: ${productId}, newQuantity: ${newQuantity}`);

    // Prevent quantity from going to 0 or less
    if (newQuantity <= 0) {
      showPopupMessage("Bạn không thể đặt số lượng sản phẩm là 0.");
      return;
    }

    // Store the original cart state for potential rollback
    const originalCart = [...cartItems];

    // Optimistically update the UI state for immediate feedback
    setCartItems(prev =>
        prev.map(item =>
            item.productId === productId ? { ...item, quantity: newQuantity } : item
        )
    );

    // Immediately invoke the function to send the update to the database
    sendQuantityUpdateToDB(productId, newQuantity, originalCart);
  };



  const handleRemoveItem = async (productId) => {
    const originalCart = [...cartItems];
    setCartItems(prev => prev.filter(item => item.productId !== productId));
    try {
      const response = await fetch(
          `http://localhost:8080/api/ver0.0.1/cartItem/removeId?productId=${productId}`,
          {
            method: "GET",
            credentials: "include",
          }
      );
      if (!response.ok) throw new Error("Lỗi khi xóa sản phẩm.");
    } catch (err) {
      setError(err.message);
      setCartItems(originalCart);
    }
  };

  const handleAddToCart = async (product) => {
    try {
      const response = await fetch('http://localhost:8080/api/ver0.0.1/cartItem/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.productId,
          quantity: 1
        }),
        credentials: 'include'
      });
      if (!response.ok) {
        if (response.status === 401) {
          showPopupMessage("Vui lòng đăng nhập để thêm sản phẩm.");
        } else {
          throw new Error("Không thể thêm sản phẩm.");
        }
      } else {
        showPopupMessage("Đã thêm sản phẩm vào giỏ hàng!");
        fetchCartItems();
      }
    } catch (err) {
      showPopupMessage(err.message);
    }
  };

  const handleCheckout = () => {
    navigate("/checkout");
  };

  const total = cartItems.reduce(
      (sum, item) => sum + item.priceAtAddition * item.quantity,
      0
  );

  const scrollLeft = () => { scrollRef.current.scrollBy({ left: -200, behavior: "smooth" }); };
  const scrollRight = () => { scrollRef.current.scrollBy({ left: 200, behavior: "smooth" }); };

  if (loading) {
    return <div className="cart-container"><p>Đang tải giỏ hàng...</p></div>;
  }

  if (error) {
    return <div className="cart-container"><p>Lỗi: {error}</p></div>;
  }

  return (
      <div className="cart-container">
        {popupMessage && (
            <div className="popup-message">
              {popupMessage}
            </div>
        )}

        <div className="cart-main">
          <div className="cart-left">
            <h2>Giỏ hàng của bạn</h2>
            {cartItems.length === 0 ? (
                <div className="empty-cart">
                  <div className="empty-icon">
                    <FaShoppingCart size={64} color="#ccc" />
                  </div>
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
                      <div key={item.cartItemId} className="cart-row">
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
                        <div className="column total">
                          {(item.priceAtAddition * item.quantity).toLocaleString()}đ
                        </div>
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
                <span className="summary-price">
                                {total.toLocaleString()}đ
                            </span>
              </div>
              <p className="summary-note">
                * Phí vận chuyển sẽ được tính ở trang thanh toán.
              </p>
              <button
                  className="checkout-btn"
                  onClick={handleCheckout}
                  disabled={cartItems.length === 0}
              >
                Thanh toán ngay
              </button>
            </div>
          </div>
        </div>
        <div className="suggestion-box">
          <h3>Có Thể Bạn Thích</h3>
          <div className="slider-wrapper">
            <button onClick={scrollLeft} className="slider-btn left">◀</button>
            <div className="recommended-products" ref={scrollRef}>
              {recommendedProducts.map((product) => (
                  <div key={product.productId} className="recommended-item">
                    <div className="img-wrapper">
                      <button
                          className="add-to-cart-btn icon-only"
                          onClick={() => handleAddToCart(product)}
                          title="Thêm vào giỏ hàng"
                      >
                        <FaCartPlus size={20} />
                      </button>
                      <img src={product.image} alt={product.productName} />
                    </div>
                    <span className="recommended-name">{product.productName}</span>
                    <span className="recommended-price">
                                    {product.priceAtAddition.toLocaleString()}đ
                                </span>
                  </div>
              ))}
            </div>
            <button onClick={scrollRight} className="slider-btn right">▶</button>
          </div>
        </div>
      </div>
  );
};

export default Cart;