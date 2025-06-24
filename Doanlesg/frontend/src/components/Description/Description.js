import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { CategoryData } from "../../data/CategoryData";
import "./Description.css";

const Description = () => {
  const { productId } = useParams();
  const id = parseInt(productId);

  // Trích xuất tất cả sản phẩm từ CategoryData
  const allProducts = CategoryData.flatMap((cat) =>
    cat.products.map((p) => ({ ...p, category: cat.slug }))
  );

  const product = allProducts.find((item) => item.id === id);
  const [quantity, setQuantity] = useState(1);
  const [imageIndex, setImageIndex] = useState(0);
  const selectedImage = product?.extraImages?.[imageIndex] || product?.image || "";

  if (!product) return <div className="not-found">Sản phẩm không tồn tại.</div>;

  const relatedProducts = product.related
    ?.map((rid) => allProducts.find((p) => p.id === rid))
    .filter(Boolean) || [];

  const handleQuantity = (type) => {
    if (type === "decrease" && quantity > 1) setQuantity(quantity - 1);
    else if (type === "increase") setQuantity(quantity + 1);
  };

  const handleImageChange = (direction) => {
    let newIndex = imageIndex + direction;
    if (!product.extraImages || product.extraImages.length === 0) return;
    if (newIndex < 0) newIndex = product.extraImages.length - 1;
    if (newIndex >= product.extraImages.length) newIndex = 0;
    setImageIndex(newIndex);
  };

  return (
    <div className="product-detail-container">
      {/* PHẦN 1: Hình ảnh & thông tin */}
      <div className="product-main-wrapper">
        <div className="product-main">
          {/* Hình ảnh */}
          <div className="product-images">
            <div className="image-wrapper">
              {product.extraImages?.length > 1 && (
                <>
                  <button className="nav-button prev" onClick={() => handleImageChange(-1)}>
                    ❮
                  </button>
                  <img src={selectedImage} alt={product.name} className="main-image" />
                  <button className="nav-button next" onClick={() => handleImageChange(1)}>
                    ❯
                  </button>
                </>
              )}
              {(!product.extraImages || product.extraImages.length <= 1) && (
                <img src={selectedImage} alt={product.name} className="main-image" />
              )}
            </div>
            <div className="thumbnails">
              {product.extraImages?.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`thumb-${index}`}
                  className={imageIndex === index ? "active" : ""}
                  onClick={() => setImageIndex(index)}
                />
              ))}
            </div>
          </div>

          {/* Thông tin sản phẩm */}
          <div className="product-info">
            <h1 className="product-title">{product.name}</h1>
            <p className="product-sub">Thương hiệu: DoleSeason | Tình trạng: Còn hàng</p>
            <p className="product-price">
              {product.price.toLocaleString()}đ
              {product.originalPrice && (
                <span className="original-price">
                  {product.originalPrice.toLocaleString()}đ
                </span>
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
              <button className="buy-now">Mua ngay</button>
              <button className="add-to-cart">Thêm vào giỏ</button>
            </div>

            <div className="product-icons">
              <span>❤ Thích</span>
            </div>
          </div>
        </div>
      </div>

      {/* PHẦN 2: Mô tả */}
      <div className="product-description-wrapper">
        <h2>Mô Tả Sản Phẩm</h2>
        <p>{product.description}</p>
      </div>

      {/* PHẦN 3: Sản phẩm liên quan */}
      <div className="related-products-wrapper">
        <h2>Sản Phẩm Liên Quan</h2>
        <div className="related-products">
          {relatedProducts.map((rel) => (
            <Link to={`/product/${rel.id}`} className="related-item" key={rel.id}>
              <img src={rel.image} alt={rel.name} />
              <p>{rel.name}</p>
              <span className="related-price">{rel.price.toLocaleString()}đ</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Description;
