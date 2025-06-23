import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import "./Description.css";

// Dữ liệu sản phẩm mẫu
const allProducts = [
  {
    id: 1,
    name: "Set 12 Thưởng Vị Yến Đảo",
    image: "/images/to_yen.png",
    extraImages: ["/images/to_yen.png", "/images/Comhoasen.png", "/images/Xoingusac.png"],
    price: 1656000,
    originalPrice: 2200000,
    description:
      "Set quà 'Thưởng Vị Yến Đảo' là biểu tượng của sự sang trọng và tinh tế trong từng món quà sức khỏe. Với thiết kế hộp quà hoàng kim quý phái, sản phẩm mang đậm hơi thở hoàng tộc, thể hiện đẳng cấp của người tặng và sự trân trọng dành cho người nhận. Bên trong là 12 hũ yến chưng sẵn được chế biến từ tổ yến nguyên chất – giàu acid amin, protein và các vi chất quý – hỗ trợ bồi bổ cơ thể, tăng cường miễn dịch và làm đẹp da. Đây là lựa chọn hoàn hảo cho quà tặng doanh nghiệp, quà biếu cha mẹ hoặc chăm sóc sức khỏe bản thân trong những dịp đặc biệt.",
    related: [2, 3],
  },
  {
    id: 2,
    name: "Yến Sào Tinh Chế",
    image: "/images/to_yen.png",
    extraImages: ["/images/to_yen.png", "/images/extra3.jpg"],
    price: 250000,
    originalPrice: 300000,
    description:
      "Yến Sào Tinh Chế DoleSaigon được tuyển chọn từ những tổ yến nguyên chất, khai thác tại các vùng yến thiên nhiên trong nước...",
    related: [1, 3],
  },
  {
    id: 3,
    name: "Cơm Hoa Sen",
    image: "/images/comhoasen.png",
    extraImages: ["/images/comhoasen.png"],
    price: 180000,
    originalPrice: 220000,
    description:
      "Lấy cảm hứng từ tinh hoa ẩm thực cung đình Huế, Cơm Hoa Sen là món quà mang đậm tính nghệ thuật và hương vị truyền thống...",
    related: [1, 2],
  },
];

const Description = () => {
  const { productId } = useParams();
  const id = parseInt(productId);
  const product = allProducts.find((item) => item.id === id);

  const [quantity, setQuantity] = useState(1);
  const [imageIndex, setImageIndex] = useState(0);
  const selectedImage = product?.extraImages[imageIndex] || "";

  if (!product) return <div className="not-found">Sản phẩm không tồn tại.</div>;

  const relatedProducts = product.related
    .map((rid) => allProducts.find((p) => p.id === rid))
    .filter(Boolean);

  const handleQuantity = (type) => {
    if (type === "decrease" && quantity > 1) setQuantity(quantity - 1);
    else if (type === "increase") setQuantity(quantity + 1);
  };

  const handleImageChange = (direction) => {
    let newIndex = imageIndex + direction;
    if (newIndex < 0) newIndex = product.extraImages.length - 1;
    if (newIndex >= product.extraImages.length) newIndex = 0;
    setImageIndex(newIndex);
  };

  return (
    <div className="product-detail-container">
      {/* PHẦN 1: Hình ảnh & thông tin */}
      <div className="product-main-wrapper">
        <div className="product-main">
          {/* Ảnh */}
          <div className="product-images">
            <div className="image-wrapper">
              <button className="nav-button prev" onClick={() => handleImageChange(-1)}>
                ❮
              </button>
              <img src={selectedImage} alt={product.name} className="main-image" />
              <button className="nav-button next" onClick={() => handleImageChange(1)}>
                ❯
              </button>
            </div>
            <div className="thumbnails">
              {product.extraImages.map((img, index) => (
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

          {/* Thông tin */}
          <div className="product-info">
            <h1 className="product-title">{product.name}</h1>
            <p className="product-sub">Thương hiệu: DoleSeason | Tình trạng: Còn hàng</p>
            <p className="product-price">
              {product.price.toLocaleString()}đ
              <span className="original-price">
                {product.originalPrice.toLocaleString()}đ
              </span>
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

      {/* PHẦN 2: Mô tả sản phẩm */}
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
