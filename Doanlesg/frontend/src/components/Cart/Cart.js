import React, { useState } from "react";
import { FaShoppingCart } from "react-icons/fa";
import "./Cart.css";

const Cart = () => {
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: "Cơm gói lá sen",
      price: 2900000,
      quantity: 1,
      image: "/assets/Cơmhoasen.png"
    },
    {
      id: 2,
      name: "Xôi ngũ sắc khuôn tròn",
      price: 3700000,
      quantity: 1,
      image: "/assets/Xoingusac.png"
    }
  ]);

  const recommendedProducts = [
    {
      id: 3,
      name: "Tổ Yến Tinh Chế cho bé BaBy (loại 3)",
      price: 2900000,
      image: "/assets/to-yen-baby.png"
    },
    {
      id: 4,
      name: "Cao Hồng Sâm KGS Hàn Quốc Hộp 1 Lọ 240g",
      price: 3700000,
      image: "/assets/caohongsam.png"
    },
    {
      id: 5,
      name: "Set 6 Thưởng Vị Yến Đảo",
      price: 799000,
      image: "/assets/set-thuong-vi-yen.png"
    }
  ];

  const increaseQuantity = (id) => {
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const decreaseQuantity = (id) => {
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === id && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
    );
  };

  const removeItem = (id) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

   return (
      <div className="cart-page">
        <div className="cart-left">
          <h2>Giỏ hàng của bạn</h2>
          {cartItems.length === 0 ? (
            <div className="cart-empty">
              <FaShoppingCart className="cart-empty-icon" />
              <p>Giỏ hàng của bạn đang trống.</p>
            </div>
          ) : (
            <>
              <div className="cart-table">
                {cartItems.map(item => (
                  <div key={item.id} className="cart-item">
                    <div className="cart-item-info">
                      <img src={item.image} alt={item.name} />
                      <div className="item-details">
                        <span className="item-name">{item.name}</span>
                        <button className="remove-btn" onClick={() => removeItem(item.id)}>Xóa</button>
                      </div>
                    </div>
                    <div className="cart-item-price">{item.price.toLocaleString()}đ</div>
                    <div className="cart-item-quantity">
                      <button onClick={() => decreaseQuantity(item.id)}>-</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => increaseQuantity(item.id)}>+</button>
                    </div>
                    <div className="cart-item-total">
                      {(item.price * item.quantity).toLocaleString()}đ
                    </div>
                  </div>
                ))}
              </div>
              <h3>Có Thể Bạn Thích</h3>
              <div className="recommended-products">
                            {recommendedProducts.map(product => (
                              <div key={product.id} className="recommended-item">
                                <img src={product.image} alt={product.name} />
                                <span>{product.name}</span>
                                <span className="recommended-price">
                                  {product.price.toLocaleString()}đ
                                </span>
                              </div>
                            ))}
                          </div>
            </>
          )}
        </div>
        <div className="cart-right">
          <div className="order-summary">
            <h3>Thông Tin Đơn Hàng</h3>
            <div className="summary-row">
              <span>Tổng tiền:</span>
              <span className="summary-price">{total.toLocaleString()}đ</span>
            </div>
            <div className="summary-note">
              <p>* Phí vận chuyển sẽ được tính ở trang thanh toán.</p>
            </div>
            <div className="summary-buttons">
              <button
                className="checkout-btn"
                disabled={cartItems.length === 0}
              >
                Thanh toán ngay
              </button>

            </div>
          </div>
        </div>
      </div>
    );
};

export default Cart;
