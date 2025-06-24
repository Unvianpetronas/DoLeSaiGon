import React, { useState, useEffect } from 'react';
import './Homepage.css';
import { Link } from 'react-router-dom';
import { FaTruck, FaHeadset, FaCreditCard, FaGift } from 'react-icons/fa';

export default function Homepage() {
  const bannerImages = [
    require('../../assets/img.png'),
    require('../../assets/img2.png')
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [allProducts, setAllProducts] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % bannerImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const countdownDate = new Date().getTime() + 5 * 24 * 60 * 60 * 1000;

    const updateCountdown = () => {
      const now = new Date().getTime();
      const distance = countdownDate - now;

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((distance / (1000 * 60)) % 60);
      const seconds = Math.floor((distance / 1000) % 60);

      document.getElementById("days").innerText = days;
      document.getElementById("hours").innerText = hours;
      document.getElementById("minutes").innerText = minutes;
      document.getElementById("seconds").innerText = seconds;
    };

    updateCountdown();
    const countdownInterval = setInterval(updateCountdown, 1000);
    return () => clearInterval(countdownInterval);
  }, []);

useEffect(() => {
    fetch('http://localhost:8080/api/ver0.0.1/product')
      .then((res) => res.json())
      .then((data) => {
        if (data.content) {
          setAllProducts(data.content);
        }
      })
      .catch((err) => console.error('Lỗi khi gọi API:', err));
  }, []);

 // Tách dữ liệu theo nhóm
  const giftSets = allProducts.filter(p => p.category === 'Bộ quà tặng');
  const promoProducts = allProducts.slice(0, 4);
  const xoiCheProducts = allProducts.filter(p => p.category?.includes('Xôi') || p.category?.includes('Chè'));
  const mamCungProducts = allProducts.filter(p => p.category?.includes('Mâm'));

  const xoiCheCategories = [...new Set(xoiCheProducts.map(p => p.category))];
  const mamCungCategories = [...new Set(mamCungProducts.map(p => p.category))];

  const [selectedCategory, setSelectedCategory] = useState(xoiCheCategories[0] || '');
  const [selectedCategory2, setSelectedCategory2] = useState(mamCungCategories[0] || '');

  const displayedXoiChe = xoiCheProducts.filter(p => p.category === selectedCategory);
  const displayedMamCung = mamCungProducts.filter(p => p.category === selectedCategory2);

  return (
    <div className="homepage">
      <div
        className="header-banner"
        style={{ backgroundImage: `url(${bannerImages[currentIndex]})` }}
      ></div>

      <div className="feature-bar">
        <div className="feature-item">
          <div className="line"></div>
          <div className="icon"><FaTruck /></div>
          <div className="text">
            <strong>Giao hàng siêu tốc</strong>
            <p>Giao hàng trong 24h</p>
          </div>
        </div>
        <div className="feature-item">
          <div className="icon"><FaHeadset /></div>
          <div className="text">
            <strong>Tư vấn miễn phí</strong>
            <p>Đội ngũ tư vấn tận tình</p>
          </div>
        </div>
        <div className="feature-item">
          <div className="icon"><FaCreditCard /></div>
          <div className="text">
            <strong>Thanh toán</strong>
            <p>Thanh toán an toàn</p>
          </div>
        </div>
        <div className="feature-item">
          <div className="line"></div>
          <div className="icon"><FaGift /></div>
          <div className="text">
            <strong>Giải pháp quà tặng</strong>
            <p>Dành cho doanh nghiệp</p>
          </div>
        </div>
      </div>

      <div className="section">
        <h2>BỘ SƯU TẬP QUÀ TẶNG CAO CẤP</h2>
        <p className="section-subtitle">
          Bộ sưu tập quà tặng DOLESAIGON là giải pháp quà Tết, quà tặng Trung Thu, quà tặng doanh nghiệp
        </p>
        <div className="gift-collection">
          {giftSets.map((gift) => (
            <div key={gift.id} className="gift-item">
              <div className="gift-image">
                <img src="./default-gift.png" alt={gift.productName} />
                <div className="gift-info">
                  <p>{gift.productName}</p>
                  <span>Giá chỉ từ {gift.price.toLocaleString()}đ</span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

      <div className="section promo-section">
        <p>DOLESAIGON</p>
        <h2>KHUYẾN MÃI ĐẶC BIỆT</h2>

        <div className="countdown">
          <div><span id="days">0</span><br />Ngày</div>
          <div><span id="hours">0</span><br />Giờ</div>
          <div><span id="minutes">0</span><br />Phút</div>
          <div><span id="seconds">0</span><br />Giây</div>
        </div>

         <div className="product-grid">
                  {promoProducts.map((item, idx) => (
                    <div className="product-card" key={idx}>
                      <div className="product-img">
                        <img
                          src={item.image || './product2.jpg'}
                          alt={item.productName || 'Sản phẩm'}
                        />
                        <span className="discount">
                          -{Math.round(((item.originalPrice ?? item.price * 1.1) - item.price) / (item.originalPrice ?? item.price * 1.1) * 100)}%
                        </span>
                      </div>
                      <div className="price">
                        <h4>{item.productName}</h4>
                        <span className="original">{(item.originalPrice ?? item.price * 1.1).toLocaleString()}đ</span>
                        <span className="sale">{item.price.toLocaleString()}đ</span>
                      </div>
                    </div>
                  ))}
         </div>
      </div>

      <div className="story-section">
        <div className="story-content">
          <h4>ĐỒ LỄ SÀI GÒN</h4>
          <h2>CÂU CHUYỆN VỀ DOLESAIGON</h2>
          <p>
            Như quý vị đã biết: "Tài sản lớn nhất của đời người là sức khỏe và trí tuệ", có sức khỏe và trí tuệ thì sẽ có tất cả. Sản phẩm đồ lễ phẩm cao cấp là những lễ vật tinh túy, mang lại cho Quý vị sự an tâm, may mắn và khởi đầu thuận lợi trong cuộc sống. Đồ lễ được thị trường đón nhận với phương châm: "Chất lượng uy tín là thương hiệu".<br /><br />
            Sản phẩm đồ lễ phẩm cao cấp của <strong>DOLESAIGON</strong> được tuyển chọn kỹ lưỡng và đóng gói trang trọng, đảm bảo chất lượng tuyệt đối, phù hợp cho các nghi lễ truyền thống và tâm linh.
          </p>
          <button className="story-button">Xem chi tiết</button>
        </div>
        <div className="story-image">
          <img src="./img3.png" alt="Món ăn" />
        </div>
      </div>

      {/* XÔI CHÈ */}
            <div className="product-section">
              <p>DOLESAIGON</p>
              <h2>XÔI CHÈ</h2>
              <div className="tabs">
                {xoiCheCategories.map(cat => (
                  <button
                    key={cat}
                    className={cat === selectedCategory ? 'active' : ''}
                    onClick={() => setSelectedCategory(cat)}
                  >
                    <span className="inner-border">{cat}</span>
                  </button>
                ))}
              </div>

              <div className="product-grid">
                {displayedXoiChe.map((item, idx) => (
                  <div className="product-card" key={idx}>
                    <div className="product-img">
                      <img src="./default-product.jpg" alt={item.productName} />
                      <span className="discount">-10%</span>
                    </div>
                    <div className="price">
                      <h4>{item.productName}</h4>
                      <span className="original">{(item.price * 1.1).toLocaleString()}đ</span>
                      <span className="sale">{item.price.toLocaleString()}đ</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

      {/* MÂM CÚNG */}
            <div className="product-section">
              <p>DOLESAIGON</p>
              <h2>CÁC LOẠI MÂM CÚNG LỄ</h2>
              <div className="tabs">
                {mamCungCategories.map(cat => (
                  <button
                    key={cat}
                    className={cat === selectedCategory2 ? 'active' : ''}
                    onClick={() => setSelectedCategory2(cat)}
                  >
                    <span className="inner-border">{cat}</span>
                  </button>
                ))}
              </div>

              <div className="product-grid">
                {displayedMamCung.map((item, idx) => (
                  <div className="product-card" key={idx}>
                    <div className="product-img">
                      <img src="./default-product.jpg" alt={item.productName} />
                      <span className="discount">-10%</span>
                    </div>
                    <div className="price">
                      <h4>{item.productName}</h4>
                      <span className="original">{(item.price * 1.1).toLocaleString()}đ</span>
                      <span className="sale">{item.price.toLocaleString()}đ</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

<section class="why-choose-us">
  <p>DOLESAIGON</p>
  <h2>--VÌ SAO CHỌN CHÚNG TÔI--</h2>
  <div class="flip-card">
    <div class="flip-card-inner">
      <div class="flip-card-front">
        <img src="./Mattruoc.png" alt="Quà biếu mặt trước" />
      </div>
      <div class="flip-card-back">
        <img src="./Matsau.png" alt="Quà biếu mặt sau" />
      </div>
    </div>
  </div>
</section>

<section className="testimonials-section">
  <div className="testimonials green-background">
    <h2>KHÁCH HÀNG NÓI VỀ CHÚNG TÔI</h2>
    <p>Hơn +1000 khách hàng đã sử dụng cảm nhận như thế nào về DOLESAIGON</p>
    <div className="divider-icon">⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯</div>
  </div>

  <div className="testimonial-list">
    <div className="testimonial-card">
      <img className="avatar" src="./img_2.png" alt="Ngọc Vy" />
      <div className="quote-icon">❝</div>
      <h4>Ngọc Vy</h4>
      <p className="job">Kế toán</p>
      <p>
        “Tôi đã lựa chọn DOLESAIGON để dành tặng cho người yêu của mình... sẽ quay lại nhiều lần nữa.”
      </p>
    </div>
    <div className="testimonial-card">
      <img className="avatar" src="./img_2.png" alt="Minh Trần" />
      <div className="quote-icon">❝</div>
      <h4>Minh Trần</h4>
      <p className="job">Lập trình viên</p>
      <p>“Rất thích sản phẩm của DOLESAIGON... Tôi sẽ quay lại mua nữa.”</p>
    </div>
    <div className="testimonial-card">
      <img className="avatar" src="./img_2.png" alt="Thùy Trang" />
      <div className="quote-icon">❝</div>
      <h4>Thùy Trang</h4>
      <p className="job">Đầu bếp</p>
      <p>
        “Biết đến DOLESAIGON khi định mua quà biếu Tết... online hay offline cũng được.”
      </p>
    </div>
  </div>
</section>


<section class="partners">
  <p>DOLESAIGON</p>
  <h2>ĐỐI TÁC CỦA CHÚNG TÔI</h2>
  <div class="partner-logos">
    <img src="./vietcombank.png" alt="Vietcombank"/>
    <img src="winmart.png" alt="WinMart"/>
    <img src="lotte.png" alt="Lotte"/>
  </div>
</section>

    </div>
  );
}
