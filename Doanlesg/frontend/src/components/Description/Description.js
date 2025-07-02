import React, { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import "./Description.css";

const Description = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [imageIndex, setImageIndex] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const scrollRef = useRef(null);

  // Gọi API lấy thông tin sản phẩm theo ID
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`http://localhost:8080/api/ver0.0.1/product/productID?id=${productId}`);
        const data = await res.json();
        setProduct(data);
        console.log("Kết quả từ API:", data);

        // Nếu API trả về các sản phẩm liên quan
        if (data?.category?.id) {
                const relRes = await fetch(
                  `http://localhost:8080/api/ver0.0.1/product/categoryID?categoryID=${data.category.id}&page=0&size=50&sort=productName`
                );
                const relData = await relRes.json();

                //  Lọc ra chính sản phẩm đang xem
                const related = (relData.content || []).filter(p => p.id !== data.id);
                setRelatedProducts(related);
              }

      } catch (err) {
        console.error("Lỗi khi tải sản phẩm:", err);
      }
    };

    fetchProduct();
  }, [productId]);

  if (!product) return <div className="not-found">Đang tải sản phẩm...</div>;

  const selectedImage =
    product.extraImages?.[imageIndex] || `/products/${product.id}.png`;

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
  const scrollLeft = () => { scrollRef.current.scrollBy({ left: -200, behavior: "smooth" }); };
  const scrollRight = () => { scrollRef.current.scrollBy({ left: 200, behavior: "smooth" }); };

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
                  <img src={selectedImage} alt={product.productName} className="main-image" />
                  <button className="nav-button next" onClick={() => handleImageChange(1)}>
                    ❯
                  </button>
                </>
              )}
              {(!product.extraImages || product.extraImages.length <= 1) && (
                <img src={selectedImage} alt={product.productName} className="main-image" />
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
            <h1 className="product-title">{product.productName}</h1>
            <p className="product-sub">Thương hiệu: DoleSaigon | Tình trạng: Còn hàng</p>
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
        <p>{product.detailDescription || product.shortDescription || "Chưa có mô tả."}</p>
      </div>

      {/* PHẦN 3: Sản phẩm liên quan */}
      {relatedProducts.length > 0 && (
        <div className="related-products-wrapper">
          <h2>Sản Phẩm Liên Quan</h2>
          <div className="slider-wrapper">
            <button onClick={scrollLeft} className="slider-btn left">◀</button>
            <div className="related-products" ref={scrollRef}>
              {relatedProducts.map((rel) => (
                <div className="related-item" key={rel.id}>
                  <Link to={`/product/${rel.id}`}>
                    <img src={`/products/${rel.id}.png`} alt={rel.productName} />
                    <p>{rel.productName}</p>
                    <span className="related-price">{rel.price.toLocaleString()}đ</span>
                  </Link>
                </div>
              ))}
            </div>
            <button onClick={scrollRight} className="slider-btn right">▶</button>
          </div>
        </div>

      )}
    </div>
  );
};

export default Description;
