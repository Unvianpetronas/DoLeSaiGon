import React, { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import "./Description.css";
import { useCart } from "../../contexts/CartProvider";
import AddToCartButton from "../AddToCart/AddToCartButton";
import { FaHeart } from 'react-icons/fa';
import { toggleFavoriteItem, isItemFavorite } from '../LikeButton/LikeButton';
// 1. Import the ProductImage component
import ProductImage from '../common/ProductImage'; // Adjust path if necessary

const parseDescription = (rawDescription) => {
  if (!rawDescription) return [];
  const hasSections = rawDescription.includes('#') && rawDescription.includes('||');
  if (!hasSections) return [];

  return rawDescription
      .split('#')
      .map((section) => {
        const [title, content] = section.trim().split('||');
        return { title: title?.trim(), content: content?.trim() };
      })
      .filter(section => section.title && section.content);
};

const Description = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [imageIndex, setImageIndex] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`http://localhost:8080/api/ver0.0.1/product/productID?id=${productId}`);
        if (!res.ok) {
          throw new Error('Không tìm thấy sản phẩm.');
        }
        const data = await res.json();
        setProduct(data);
        setIsFavorite(isItemFavorite(data.id));

        if (data?.category?.id) {
          const relRes = await fetch(`http://localhost:8080/api/ver0.0.1/product/categoryID?categoryID=${data.category.id}&page=0&size=10`);
          if (relRes.ok) {
            const relData = await relRes.json();
            const related = (relData.content || []).filter(p => p.id !== data.id);
            setRelatedProducts(related);
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct().then();
  }, [productId]);

  const handleQuantity = (type) => {
    if (type === "decrease" && quantity > 1) setQuantity(quantity - 1);
    else if (type === "increase") setQuantity(quantity + 1);
  };

  // ✅ UPDATED: Logic now works with an array of image IDs
  const allImageIds = product ? [product.id, ...(product.extraImages || [])] : [];

  const handleImageChange = (direction) => {
    if (allImageIds.length <= 1) return;
    let newIndex = imageIndex + direction;
    if (newIndex < 0) newIndex = allImageIds.length - 1;
    if (newIndex >= allImageIds.length) newIndex = 0;
    setImageIndex(newIndex);
  };

  const handleBuyNow = () => {
    if (!product) return;
    const buyNowItem = {
      productId: product.id,
      productName: product.productName,
      quantity: quantity,
      price: product.price,
      priceAtAddition: product.price,
      category: product.category
    };
    navigate('/checkout', { state: { buyNowCart: [buyNowItem] } });
  };

  const handleToggleFavorite = () => {
    if (!product) return;
    toggleFavoriteItem(product);
    setIsFavorite(!isFavorite);
  };

  const scroll = (direction) => {
    scrollRef.current.scrollBy({ left: direction * 220, behavior: "smooth" });
  };

  if (loading) return <div className="loading-state">Đang tải sản phẩm...</div>;
  if (error) return <div className="error-state">Lỗi: {error}</div>;
  if (!product) return <div className="not-found">Không tìm thấy sản phẩm.</div>;

  const sections = parseDescription(product?.detailDescription);
  const selectedImageId = allImageIds[imageIndex];

  return (
      <div className="product-detail-container">
        <div className="product-main-wrapper">
          <div className="product-main">
            {/* ✅ REFACTORED: Entire image section now uses ProductImage */}
            <div className="product-images">
              <div className="image-wrapper">
                {allImageIds.length > 1 && (
                    <button className="nav-button prev" onClick={() => handleImageChange(-1)}>❮</button>
                )}

                <ProductImage
                    productId={selectedImageId}
                    alt={product.productName}
                    className="main-image"
                />

                {allImageIds.length > 1 && (
                    <button className="nav-button next" onClick={() => handleImageChange(1)}>❯</button>
                )}
              </div>

              {allImageIds.length > 1 && (
                  <div className="thumbnails">
                    {allImageIds.map((id, index) => (
                        <div
                            key={index}
                            className={`thumbnail-item ${imageIndex === index ? "active" : ""}`}
                            onClick={() => setImageIndex(index)}
                        >
                          <ProductImage productId={id} alt={`Thumbnail ${index + 1}`} />
                        </div>
                    ))}
                  </div>
              )}
            </div>

            <div className="product-info">
              <h1 className="product-title">{product.productName}</h1>
              <p className="product-sub">Thương hiệu: DoleSaigon | Tình trạng: {product.status ? 'Còn hàng' : 'Hết hàng'}</p>
              <p className="product-price">
                {product.price.toLocaleString()}đ
                {product.originalPrice && (
                    <span className="original-price">{product.originalPrice.toLocaleString()}đ</span>
                )}
              </p>
              <div className="product-options">
                <label>Số lượng:</label>
                <div className="quantity-control">
                  <button onClick={() => handleQuantity("decrease")}>-</button>
                  <span>{quantity}</span>
                  <button onClick={() => handleQuantity("increase")}>+</button>
                </div>
              </div>
              <div className="action-buttons">
                <button className="buy-now" onClick={handleBuyNow}>Mua ngay</button>
                <div className="add-to-cart-wrapper">
                  <AddToCartButton product={product} quantity={quantity} />
                </div>
              </div>
              <div className="product-icons">
                <button className={`wishlist-btn-detail ${isFavorite ? 'active' : ''}`} onClick={handleToggleFavorite}>
                  <FaHeart />
                  <span>{isFavorite ? 'Đã thích' : 'Thích'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="product-description-wrapper">
          <h2>Mô Tả Sản Phẩm</h2>
          {sections.length > 0 ? (
              sections.map((section, idx) => (
                  <div key={idx} className="description-section">
                    <h3>{section.title}</h3>
                    {(section.content || '').split('\n').map((line, i) => (<p key={i}>{line}</p>))}
                  </div>
              ))
          ) : (
              <p>Chưa có mô tả chi tiết cho sản phẩm này.</p>
          )}
        </div>

        {relatedProducts.length > 0 && (
            <div className="related-products-wrapper">
              <h2>Sản Phẩm Liên Quan</h2>
              <div className="slider-wrapper">
                <button onClick={() => scroll(-1)} className="slider-btn left">◀</button>
                <div className="related-products" ref={scrollRef}>
                  {relatedProducts.map((rel) => (
                      <Link to={`/product/${rel.id}`} className="related-item" key={rel.id}>
                        {/* ✅ REFACTORED: Use ProductImage for related products */}
                        <ProductImage productId={rel.id} alt={rel.productName} />
                        <p>{rel.productName}</p>
                        <span className="related-price">{rel.price.toLocaleString()}₫</span>
                      </Link>
                  ))}
                </div>
                <button onClick={() => scroll(1)} className="slider-btn right">▶</button>
              </div>
            </div>
        )}
      </div>
  );
};

export default Description;
