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

    const items = document.querySelectorAll(".promo-item");
    items.forEach((item) => {
      const tag = document.createElement("div");
      tag.className = "discount-tag";
      const oldPrice = item.querySelector(".old-price")?.innerText.replace(/\D/g, "") || "0";
      const newPrice = item.querySelector(".new-price")?.innerText.replace(/\D/g, "") || "0";
      const discount = Math.round((1 - parseInt(newPrice) / parseInt(oldPrice)) * 100);
      tag.innerText = `-${discount}%`;
      item.appendChild(tag);
    });

    return () => clearInterval(countdownInterval);
  }, []);

  const productData = {
    'Xôi đậu': [
      {
        name: 'Xôi đậu xanh',
        price: '2.900.000đ',
        originalPrice: '3.100.000đ',
        discount: '-6%',
        image: './LongQuyTuPhuc.png'
      },
      {
        name: 'Xôi đậu phộng',
        price: '3.200.000đ',
        originalPrice: '3.500.000đ',
        discount: '-9%',
        image: './product2.jpg'
      },
      {
      name: 'Xôi đậu đen',
      price: '3.200.000đ',
      originalPrice: '3.500.000đ',
      discount: '-10%',
      image: './product2.jpg'
      },
      {
      name: 'Xôi đậu đỏ',
      price: '3.200.000đ',
      originalPrice: '3.500.000đ',
      discount: '-9%',
      image: './product2.jpg'
      },
      {
      name: 'Xôi đậu trắng',
      price: '3.200.000đ',
      originalPrice: '3.500.000đ',
      discount: '-9%',
      image: './product2.jpg'
      },
      {
            name: 'Xôi đậu đen',
            price: '3.200.000đ',
            originalPrice: '3.500.000đ',
            discount: '-10%',
            image: './product2.jpg'
            },
            {
            name: 'Xôi đậu đỏ',
            price: '3.200.000đ',
            originalPrice: '3.500.000đ',
            discount: '-9%',
            image: './product2.jpg'
            },
            {
            name: 'Xôi đậu trắng',
            price: '3.200.000đ',
            originalPrice: '3.500.000đ',
            discount: '-9%',
            image: './product2.jpg'
            }
    ],
    'Xôi gấc': [
    {
            name: 'Xôi đậu xanh',
            price: '2.900.000đ',
            originalPrice: '3.100.000đ',
            discount: '-6%',
            image: './LongQuyTuPhuc.png'
          },
          {
            name: 'Xôi đậu phộng',
            price: '3.200.000đ',
            originalPrice: '3.500.000đ',
            discount: '-9%',
            image: './product2.jpg'
          },
          {
          name: 'Xôi đậu đen',
          price: '3.200.000đ',
          originalPrice: '3.500.000đ',
          discount: '-10%',
          image: './product2.jpg'
          },
          {
          name: 'Xôi đậu đỏ',
          price: '3.200.000đ',
          originalPrice: '3.500.000đ',
          discount: '-9%',
          image: './product2.jpg'
          }
    ],
    'Chè trôi nước': [
    {
                name: 'Xôi đậu xanh',
                price: '2.900.000đ',
                originalPrice: '3.100.000đ',
                discount: '-6%',
                image: './LongQuyTuPhuc.png'
              },
              {
                name: 'Xôi đậu phộng',
                price: '3.200.000đ',
                originalPrice: '3.500.000đ',
                discount: '-9%',
                image: './product2.jpg'
              },
              {
              name: 'Xôi đậu đen',
              price: '3.200.000đ',
              originalPrice: '3.500.000đ',
              discount: '-10%',
              image: './product2.jpg'
              }
    ],
    'Chè đậu': [
    {
                  name: 'Xôi đậu đen',
                  price: '3.200.000đ',
                  originalPrice: '3.500.000đ',
                  discount: '-10%',
                  image: './product2.jpg'
                  }
    ]
  };

  const [selectedCategory, setSelectedCategory] = useState('Xôi đậu');
  const categories = Object.keys(productData);
  const products = productData[selectedCategory];

const productData2 = {
    'Mâm cúng Gia Tiên': [
      {
        name: 'Mâm cúng Tổ tiên ngày Tết',
        price: '2.900.000đ',
        originalPrice: '3.100.000đ',
        discount: '-6%',
        image: './LongQuyTuPhuc.png'
      },
      {
        name: 'Mâm cúng giỗ',
        price: '3.200.000đ',
        originalPrice: '3.500.000đ',
        discount: '-9%',
        image: './product2.jpg'
      },
      {
      name: 'Mâm cúng rằm',
      price: '3.200.000đ',
      originalPrice: '3.500.000đ',
      discount: '-10%',
      image: './product2.jpg'
      },
      {
      name: 'Mâm cúng ông Công ông Táo',
      price: '3.200.000đ',
      originalPrice: '3.500.000đ',
      discount: '-9%',
      image: './product2.jpg'
      },
      {
      name: 'Mâm cúng tất niên',
      price: '3.200.000đ',
      originalPrice: '3.500.000đ',
      discount: '-9%',
      image: './product2.jpg'
      },
      {
            name: 'Mâm cúng Giao thừa',
            price: '3.200.000đ',
            originalPrice: '3.500.000đ',
            discount: '-10%',
            image: './product2.jpg'
            },
            {
            name: 'Mâm cúng Ngày cưới – Hỏi',
            price: '3.200.000đ',
            originalPrice: '3.500.000đ',
            discount: '-9%',
            image: './product2.jpg'
            },
            {
            name: 'Mâm cúng Tạ ơn tổ tiên',
            price: '3.200.000đ',
            originalPrice: '3.500.000đ',
            discount: '-9%',
            image: './product2.jpg'
            }
    ],
    'Mâm cúng Phong tục': [
    {
            name: 'Mâm cúng Thần Tài – Thổ Địa',
            price: '2.900.000đ',
            originalPrice: '3.100.000đ',
            discount: '-6%',
            image: './LongQuyTuPhuc.png'
          },
          {
            name: 'Mâm cúng động thổ / khai trương',
            price: '3.200.000đ',
            originalPrice: '3.500.000đ',
            discount: '-9%',
            image: './product2.jpg'
          },
          {
          name: 'Mâm cúng nhập trạch',
          price: '3.200.000đ',
          originalPrice: '3.500.000đ',
          discount: '-10%',
          image: './product2.jpg'
          },
          {
          name: 'Mâm cúng cầu an – giải hạn',
          price: '3.200.000đ',
          originalPrice: '3.500.000đ',
          discount: '-9%',
          image: './product2.jpg'
          }
    ],
    'Mâm cúng Phật – Chay tịnh': [
    {
                name: 'Mâm cúng Phật tại gia',
                price: '2.900.000đ',
                originalPrice: '3.100.000đ',
                discount: '-6%',
                image: './LongQuyTuPhuc.png'
              },
              {
                name: 'Mâm cúng Vu Lan báo hiếu',
                price: '3.200.000đ',
                originalPrice: '3.500.000đ',
                discount: '-9%',
                image: './product2.jpg'
              },
              {
              name: 'Mâm cúng chay ngày lễ, ngày ăn chay',
              price: '3.200.000đ',
              originalPrice: '3.500.000đ',
              discount: '-10%',
              image: './product2.jpg'
              }
    ],
    'Mâm cúng Trẻ nhỏ – Sinh nở': [
    {
                  name: 'Mâm cúng thôi nôi',
                  price: '3.200.000đ',
                  originalPrice: '3.500.000đ',
                  discount: '-10%',
                  image: './product2.jpg'
                  }
    ]
  };

  const [selectedCategory2, setSelectedCategory2] = useState('Mâm cúng Gia Tiên');
  const categories2 = Object.keys(productData2);
  const products2 = productData2[selectedCategory2];


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
          {["BoQuaBonMua.png", "BoQuaLocPhat.png", "BoQuaThinhVuong.png", "BoQuaTaiLoc.png"].map((src, index) => (
            <Link to="/products" key={index} className="gift-item">
              <div className="gift-image">
                <img src={`./${src}`} alt={src} />
                <div className="gift-info">
                  <p>{src.replace(".png", "").replace("BoQua", "Bộ quà ").replace("BonMua", "Bốn Mùa ").replace("LocPhat", "Lộc Phát ").replace("ThinhVuong", "Thịnh Vượng ").replace("TaiLoc", "Tài Lộc ")}</p>
                  <span>Giá chỉ từ {index === 0 ? "679k" : index === 1 ? "589k" : index === 2 ? "779k" : "999k"}</span>
                </div>
              </div>
            </Link>
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

        <div className="promo-grid">
          {["ChieuTaiDonLoc.png", "LongQuyTuPhuc.png", "HungThinhPhatTai.png", "AnNhienPhuQuy.png"].map((src, index) => (
            <Link to="/products" key={index} className="promo-item">
              <img src={`./${src}`} alt={src} />
              <div className="price-box">
                <p>{["Chiêu Tài Đón Lộc", "Long Quý Tụ Phúc", "Ngũ Sắc Tài Lộc", "An Nhiên Phú Quý"][index]}</p>
                <span className="old-price">{[800000, 2200000, 3500000, 3500000][index].toLocaleString()}đ</span>
                <span className="new-price">{[500000, 1656000, 3100000, 3200000][index].toLocaleString()}đ</span>
              </div>
            </Link>
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

      <div className="product-section">
        <p>DOLESAIGON</p>
        <h2>XÔI CHÈ</h2>
        <div className="tabs">
          {categories.map((cat) => (
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
          {products.map((item, idx) => (
            <div className="product-card" key={idx}>
              <div className="product-img">
                <img src={item.image} alt={item.name} />
                <span className="discount">{item.discount}</span>
              </div>

              <div className="price">
                <h4>{item.name}</h4>
                <span className="original">{item.originalPrice}</span>
                <span className="sale">{item.price}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="product-section">
        <p>DOLESAIGON</p>
        <h2>CÁC LOẠI MÂM CÚNG LỄ</h2>

        <div className="tabs">
          {categories2.map((cat) => (
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
          {products2.map((item, idx) => (
            <div className="product-card" key={idx}>
              <div className="product-img">
                <img src={item.image} alt={item.name} />
                <span className="discount">{item.discount}</span>
              </div>

              <div className="price">
                <h4>{item.name}</h4>
                <span className="original">{item.originalPrice}</span>
                <span className="sale">{item.price}</span>
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
