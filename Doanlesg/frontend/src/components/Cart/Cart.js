import React, { useState, useEffect, useRef, useMemo } from "react"; // ✅ ADDED: useMemo
import { useNavigate } from "react-router-dom";
import "./Cart.css";
import { FaShoppingCart, FaCartPlus } from "react-icons/fa";
import { useAuth } from "../../contexts/AuthContext";
import { useCart } from "../../contexts/CartProvider";
import { useNotification } from "../../contexts/NotificationContext";
import ProductImage from "../common/ProductImage";

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

  const [recommendedProducts, setRecommendedProducts] = useState([]);

  // ✅ ADDED: Create a memoized version of cart items with a cache key
  const processedCartItems = useMemo(() => {
    return cartItems.map(item => ({
      ...item,
      lastUpdated: Date.now()
    }));
  }, [cartItems]);


  useEffect(() => {
    const fetchRecommendations = async () => {
      if (loading) return;

      let categoryToFetch = null;

      if (cartItems.length > 0) {
        const categoryCounts = cartItems.reduce((acc, item) => {
          const categoryId = item.category?.id;
          if (categoryId) {
            acc[categoryId] = (acc[categoryId] || 0) + 1;
          }
          return acc;
        }, {});

        const topCategoryId = Object.keys(categoryCounts).reduce((a, b) =>
                categoryCounts[a] > categoryCounts[b] ? a : b
            , null);

        categoryToFetch = topCategoryId;
      }

      try {
        let response;
        if (categoryToFetch) {
          response = await fetch(`http://localhost:8080/api/ver0.0.1/product/categoryID?categoryID=${categoryToFetch}&page=0&size=10&sort=productName`);
        } else {
          response = await fetch(`http://localhost:8080/api/ver0.0.1/product?page=0&size=5&sort=price`);
        }

        if (response.ok) {
          const data = await response.json();
          // ✅ MODIFIED: Add 'lastUpdated' timestamp for cache-busting
          const products = (data.content || []).map(p => ({
            ...p,
            lastUpdated: Date.now()
          }));

          const cartProductIds = new Set(cartItems.map(item => item.productId));
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
  }, [cartItems, loading]);

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
            {processedCartItems.length === 0 ? (
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
                  {/* ✅ MODIFIED: Use processedCartItems */}
                  {processedCartItems.map((item) => (
                      <div key={item.productId} className="cart-row">
                        <div className="column image">
                          <ProductImage
                              productId={item.productId}
                              alt={item.productName}
                              className="cart-item-image"
                              cacheKey={item.lastUpdated} // ✅ ADDED: Pass the cacheKey
                          />
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
              {recommendedProducts.map((product) => (
                  <div key={product.id} className="recommended-item">
                    <div className="img-wrapper">
                      <button className="add-to-cart-btn icon-only" onClick={() => handleAddToCart(product)} title="Thêm vào giỏ hàng">
                        <FaCartPlus size={20} />
                      </button>
                      <ProductImage
                          productId={product.id}
                          alt={product.productName}
                          cacheKey={product.lastUpdated} // ✅ ADDED: Pass the cacheKey
                      />
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