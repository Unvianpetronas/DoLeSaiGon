import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Cart.css";
import { FaShoppingCart, FaCartPlus } from "react-icons/fa";
import { useAuth } from "../../contexts/AuthContext";
import { useCart } from "../../contexts/CartProvider";
import { useNotification } from "../../contexts/NotificationContext";

const Cart = () => {
  const navigate = useNavigate();
  const scrollRef = useRef(null);

  const { user } = useAuth();
  const {
    cartItems,
    loading,
    updateQuantity,
    removeItem,
    addToCart
  } = useCart();
  const { addNotification } = useNotification();

  // 1. New state for dynamic recommendations
  const [recommendedProducts, setRecommendedProducts] = useState([]);

  // 2. New useEffect to fetch recommended products
  useEffect(() => {
    const fetchRecommendations = async () => {
      // Don't fetch if the main cart is still loading
      if (loading) return;

      let categoryToFetch = null;

      if (cartItems.length > 0) {
        // Find the category with the most items in the cart
        const categoryCounts = cartItems.reduce((acc, item) => {
          const categoryId = item.category?.id;
          if (categoryId) {
            acc[categoryId] = (acc[categoryId] || 0) + 1;
          }
          return acc;
        }, {});

        // Get the category ID with the highest count
        const topCategoryId = Object.keys(categoryCounts).reduce((a, b) =>
                categoryCounts[a] > categoryCounts[b] ? a : b
            , null);

        categoryToFetch = topCategoryId;
      }

      try {
        let response;
        if (categoryToFetch) {
          // Fetch from the top category
          response = await fetch(`http://localhost:8080/api/ver0.0.1/product/categoryID?categoryID=${categoryToFetch}&page=0&size=10&sort=productName`);
        } else {
          // If cart is empty, fetch any 5 products
          response = await fetch(`http://localhost:8080/api/ver0.0.1/product?page=0&size=5&sort=price`);
        }

        if (response.ok) {
          const data = await response.json();
          const products = data.content || [];

          // Get a list of product IDs currently in the cart
          const cartProductIds = new Set(cartItems.map(item => item.productId));

          // Filter out products that are already in the cart and take the first 5
          const filteredRecommendations = products
              .filter(p => !cartProductIds.has(p.id))
              .slice(0, 5);

          setRecommendedProducts(filteredRecommendations);
        }

      } catch (error) {
        console.error("Failed to fetch recommended products:", error);
      }
    };

    fetchRecommendations();
  }, [cartItems, loading]); // Reruns when cartItems change

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
    addToCart(product, 1);
    addNotification("Đã thêm sản phẩm vào giỏ hàng!", "success");
  };

  const handleCheckout = () => {
    if (cartItems.length > 0) {
      navigate("/checkout");
    }
  };

  const total = cartItems.reduce((sum, item) => sum + (item.priceAtAddition || item.price) * item.quantity, 0);

  const scroll = (direction) => {
    scrollRef.current.scrollBy({ left: direction * 300, behavior: "smooth" });
  };

  if (loading) {
    return <div className="cart-container"><p>Đang tải giỏ hàng...</p></div>;
  }

  return (
      <div className="cart-container">
        <div className="cart-main">
          <div className="cart-left">
            <h2>Giỏ hàng của bạn</h2>
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
                        <div className="column total">{((item.priceAtAddition || item.price) * item.quantity).toLocaleString()}₫</div>
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
                <span className="summary-price">{total.toLocaleString()}₫</span>
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
              {/* 3. Map over the new dynamic state */}
              {recommendedProducts.map((product) => (
                  <div key={product.id} className="recommended-item">
                    <div className="img-wrapper">
                      <button className="add-to-cart-btn icon-only" onClick={() => handleAddToCart(product)} title="Thêm vào giỏ hàng">
                        <FaCartPlus size={20} />
                      </button>
                      <img src={`/products/${product.id}.png`} alt={product.productName} />
                    </div>
                    <span className="recommended-name">{product.productName}</span>
                    <span className="recommended-price">{product.price.toLocaleString()}₫</span>
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