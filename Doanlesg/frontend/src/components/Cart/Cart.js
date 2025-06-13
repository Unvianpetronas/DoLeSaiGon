import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Cart.css";
import { FaShoppingCart } from "react-icons/fa";
import { FaCartPlus } from 'react-icons/fa';

const Cart = () => {
  const navigate = useNavigate();
  const scrollRef = useRef(null);

  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: "Cơm gói lá sen",
      price: 2900000,
      quantity: 1,
      image: "/Comhoasen.png",
    },
    {
      id: 2,
      name: "Xôi ngũ sắc khuôn tròn",
      price: 3700000,
      quantity: 1,
      image: "/Xoingusac.png",
    },
  ]);

  const recommendedProducts = [
    {
      id: 3,
      name: "Tổ Yến Tinh Chế cho bé BaBy (loại 3)",
      price: 2900000,
      image: "/to_yen.png",
    },
    {
      id: 4,
      name: "Cao Hồng Sâm KGS Hàn Quốc Hộp 1 Lọ 240g",
      price: 3700000,
      image: "/to_yen.png",
    },
    {
      id: 5,
      name: "Set 6 Thưởng Vị Yến Đảo",
      price: 799000,
      image: "/to_yen.png",
    },
    {
      id: 6,
      name: "Chè Dưỡng Nhan Đông Trùng",
      price: 500000,
      image: "/to_yen.png",
    },
    {
      id: 7,
      name: "Hộp Quà Sức Khỏe 2025",
      price: 1500000,
      image: "/to_yen.png",
    },
    {
      id: 8,
      name: "Hộp Quà Sức Khỏe 2025",
      price: 1500000,
      image: "/to_yen.png",
    },
    {
      id: 9,
      name: "Hộp Quà Sức Khỏe 2025",
      price: 1500000,
      image: "/to_yen.png",
    },
    {
      id: 10,
      name: "Hộp Quà Sức Khỏe 2025",
      price: 1500000,
      image: "/to_yen.png",
    },
  ];

  const increaseQuantity = (id) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const decreaseQuantity = (id) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
    );
  };

  const removeItem = (id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleCheckout = () => {
    navigate("/checkout");
  };

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const scrollLeft = () => {
    scrollRef.current.scrollBy({ left: -200, behavior: "smooth" });
  };

  const scrollRight = () => {
    scrollRef.current.scrollBy({ left: 200, behavior: "smooth" });
  };

  const handleAddToCart = (product) => {
    const existing = cartItems.find((item) => item.id === product.id);
    if (existing) {
      setCartItems((prev) =>
        prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCartItems((prev) => [...prev, { ...product, quantity: 1 }]);
    }
  };

  return (
    <div className="cart-container">
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
                <div className="column product">Sản phẩm</div>
                <div className="column price">Đơn giá</div>
                <div className="column quantity">Số lượng</div>
                <div className="column total">Tổng</div>
                <div className="column action"></div>
              </div>
              {cartItems.map((item) => (
                <div key={item.id} className="cart-row">
                  <div className="column product">
                    <div className="product-info">
                      <img src={item.image} alt={item.name} />
                      <div>
                        <div className="item-name">{item.name}</div>
                        <button
                          className="remove-btn"
                          onClick={() => removeItem(item.id)}
                        >
                          Xóa
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="column price">
                    {item.price.toLocaleString()}đ
                  </div>
                  <div className="column quantity">
                    <button onClick={() => decreaseQuantity(item.id)}>-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => increaseQuantity(item.id)}>+</button>
                  </div>
                  <div className="column total">
                    {(item.price * item.quantity).toLocaleString()}đ
                  </div>
                  <div className="column action"></div>
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
              <div key={product.id} className="recommended-item">
                <div className="img-wrapper">
                  <button
                    className="add-to-cart-btn icon-only"
                    onClick={() => handleAddToCart(product)}
                    title="Thêm vào giỏ hàng"
                  >
                    <FaCartPlus size={20} />
                  </button>
                  <img src={product.image} alt={product.name} />
                </div>
                <span className="recommended-name">{product.name}</span>
                <span className="recommended-price">
                  {product.price.toLocaleString()}đ
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
