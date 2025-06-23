import React from "react";
import "./Description.css";

const Description = () => {
  return (
    <div className="product-detail-container">
      <div className="product-main">
        <div className="product-images">
          <img src="/product-main.jpg" alt="Product" className="main-image" />
          <div className="thumbnails">
            <img src="/product-main.jpg" alt="thumb" />
            <img src="/product-main.jpg" alt="thumb" />
            <img src="/product-main.jpg" alt="thumb" />
          </div>
        </div>
        <div className="product-info">
          <h1 className="product-title">Set 12 Thưởng Vị Yến Đảo</h1>
          <p className="product-sub">Thương hiệu: DoleSeason | Tình trạng: Còn hàng</p>
          <p className="product-price">1.656.000đ <span className="original-price">2.200.000đ</span></p>

          <div className="product-options">
            <label>Số lượng:</label>
            <div className="quantity-control">
              <button>-</button>
              <span>1</span>
              <button>+</button>
            </div>
          </div>

          <div className="action-buttons">
            <button className="buy-now">Mua ngay</button>
            <button className="add-to-cart">Thêm vào giỏ</button>
          </div>

          <div className="product-icons">
            <span>❤ Thích</span>
            <span>📤 Chia sẻ</span>
          </div>
        </div>
      </div>

      <div className="product-tabs">
        <h2>Mô Tả Sản Phẩm</h2>
        <p>
          Thưởng vị Yến Đảo – set quà cao quý bậc nhất. Hộp quà Thưởng vị Yến Đảo với hình ảnh vàng hoàng gia sang trọng, bắt mắt...
        </p>

        <h2>Sản Phẩm Liên Quan</h2>
        <div className="related-products">
          {Array(4).fill().map((_, index) => (
            <div className="related-item" key={index}>
              <img src="/product-main.jpg" alt="related" />
              <p>Set X Thưởng Vị Yến Đảo</p>
              <span className="related-price">999.000đ</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Description;
