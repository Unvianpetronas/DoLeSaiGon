import React, { useState, useEffect } from 'react';
import './Homepage.css';
import { Link } from "react-router-dom";
import { FaTruck, FaHeadset, FaCreditCard, FaGift } from 'react-icons/fa';
import AddToCartButton from "../AddToCart/AddToCartButton";
import { FaHeart } from 'react-icons/fa';
import { toggleFavoriteItem, isItemFavorite } from '../LikeButton/LikeButton';
import ProductImage from '../common/ProductImage'; // Import the ProductImage component

// ✅ ADD: A helper function to add a cache key to each product
const addCacheKey = (products) =>
    (products || []).map(p => ({ ...p, lastUpdated: Date.now() }));

export default function Homepage() {
  const bannerImages = [
    require('../../assets/img.png'),
    require('../../assets/img2.png')
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [promoProducts, setPromoProducts] = useState([]);
  const [xoiProducts, setXoiProducts] = useState([]);
  const [cheProducts, setCheProducts] = useState([]);
  const [mamProducts, setMamProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState('');
  const [selectedMamSubCategory, setSelectedMamSubCategory] = useState('');
  const [giftSets, setGiftSets] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % bannerImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [bannerImages.length]);

  useEffect(() => {
    const countdownDate = new Date().getTime() + 5 * 24 * 60 * 60 * 1000;
    const updateCountdown = () => {
      const now = new Date().getTime();
      const distance = countdownDate - now;

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((distance / (1000 * 60)) % 60);
      const seconds = Math.floor((distance / 1000) % 60);

      const d = document.getElementById("days");
      const h = document.getElementById("hours");
      const m = document.getElementById("minutes");
      const s = document.getElementById("seconds");

      if (d) d.innerText = days;
      if (h) h.innerText = hours;
      if (m) m.innerText = minutes;
      if (s) s.innerText = seconds;
    };

    updateCountdown();
    const countdownInterval = setInterval(updateCountdown, 1000);
    return () => clearInterval(countdownInterval);
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const [allRes, xoiRes, cheRes, mamRes, giftRes] = await Promise.all([
          fetch('http://localhost:8080/api/ver0.0.1/product?page=0&size=50&sort=price'),
          fetch('http://localhost:8080/api/ver0.0.1/product/categoryID?categoryID=2&page=0&size=50&sort=productName'),
          fetch('http://localhost:8080/api/ver0.0.1/product/categoryID?categoryID=3&page=0&size=50&sort=productName'),
          fetch('http://localhost:8080/api/ver0.0.1/product/categoryID?categoryID=4&page=0&size=50&sort=productName'),
          fetch('http://localhost:8080/api/ver0.0.1/product/categoryID?categoryID=5&page=0&size=4&sort=productName')
        ]);

        const allData = await allRes.json();
        const xoiData = await xoiRes.json();
        const cheData = await cheRes.json();
        const mamData = await mamRes.json();
        const giftData = await giftRes.json();

        // ✅ UPDATE: Use the helper to add cache keys to all product lists
        setPromoProducts(addCacheKey(allData.content.slice(0, 4)));
        setXoiProducts(addCacheKey(xoiData.content));
        setCheProducts(addCacheKey(cheData.content));
        setMamProducts(addCacheKey(mamData.content));
        setGiftSets(addCacheKey(giftData.content));
        setProducts(addCacheKey(allData.content));
      } catch (err) {
        console.error('Lỗi khi gọi API:', err);
        setError('Không thể tải dữ liệu sản phẩm.');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const allXoiChe = xoiProducts.concat(cheProducts);
  const getSubCategoryName = (product) => {
    const name = product.productName?.toLowerCase() || '';
    if (name.includes('gấc')) return 'Xôi gấc';
    if (name.includes('đậu') && name.includes('xôi')) return 'Xôi đậu';
    if (name.includes('trôi')) return 'Chè trôi nước';
    if (name.includes('chè') && name.includes('đậu')) return 'Chè đậu';
    return 'Khác';
  };

  const subCategories = [...new Set(allXoiChe.map(getSubCategoryName))];

  useEffect(() => {
    if (subCategories.length > 0 && !selectedSubCategory) {
      setSelectedSubCategory(subCategories[0]);
    }
  }, [subCategories, selectedSubCategory]);

  const getMamSubCategoryName = (product) => {
    const name = product.productName?.toLowerCase() || '';
    if (name.includes('truyền thống')) return 'Mâm cúng truyền thống';
    if (name.includes('tết')) return 'Mâm lễ tết';
    if (name.includes('đầy tháng')) return 'Mâm cúng đầy tháng';
    if (name.includes('khai trương')) return 'Mâm cúng khai trương';
    return 'Khác';
  };

  const mamSubCategories = [...new Set(mamProducts.map(getMamSubCategoryName))];

  useEffect(() => {
    if (mamSubCategories.length > 0 && !selectedMamSubCategory) {
      setSelectedMamSubCategory(mamSubCategories[0]);
    }
  }, [mamSubCategories, selectedMamSubCategory]);

  if (loading) return <p>Đang tải sản phẩm...</p>;
  if (error) return <p className="error">{error}</p>;

  const toggleFavorite = (item) => {
    toggleFavoriteItem(item);
    setProducts(prev =>
        prev.map(p =>
            p.id === item.id ? { ...p, isFavorite: !p.isFavorite } : p
        )
    );
  };

  return (
      <div className="homepage">
        <div className="header-banner" style={{ backgroundImage: `url(${bannerImages[currentIndex]})` }}></div>

        <div className="feature-bar">
          <div className="feature-item"><div className="line"></div><div className="icon"><FaTruck /></div><div className="text"><strong>Giao hàng siêu tốc</strong><p>Giao hàng trong 24h</p></div></div>
          <div className="feature-item"><div className="icon"><FaHeadset /></div><div className="text"><strong>Tư vấn miễn phí</strong><p>Đội ngũ tư vấn tận tình</p></div></div>
          <div className="feature-item"><div className="icon"><FaCreditCard /></div><div className="text"><strong>Thanh toán</strong><p>Thanh toán an toàn</p></div></div>
          <div className="feature-item"><div className="line"></div><div className="icon"><FaGift /></div><div className="text"><strong>Giải pháp quà tặng</strong><p>Dành cho doanh nghiệp</p></div></div>
        </div>

        <div className="section">
          <h2>BỘ SƯU TẬP QUÀ TẶNG CAO CẤP</h2>
          <p className="section-subtitle">DOLESAIGON là giải pháp quà Tết, Trung Thu, quà doanh nghiệp</p>
          <div className="gift-collection">
            {giftSets.map(gift => (
                <div key={gift.id} className="gift-item">
                  <div className="gift-image">
                    <Link to={`/product/${gift.id}`}>
                      {/* ✅ PASS: Pass the cacheKey prop */}
                      <ProductImage
                          productId={gift.id}
                          alt={gift.productName}
                          cacheKey={gift.lastUpdated}
                      />
                      <div className="gift-info">
                        <p>{gift.productName}</p>
                        <span>Giá chỉ từ {gift.price.toLocaleString()}đ</span>
                      </div>
                    </Link>
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
          <div className="promo-grid-homepage">
            {promoProducts.map((item) => {
              const isFavorite = isItemFavorite(item.id);
              return (
                  <div className="promo-item-homepage" key={item.id}>
                    <Link to={`/product/${item.id}`} className="related-item">
                      {/* ✅ PASS: Pass the cacheKey prop */}
                      <ProductImage
                          productId={item.id}
                          alt={item.productName}
                          cacheKey={item.lastUpdated}
                      />
                      <span className="discount-tag">-10%</span>
                    </Link>
                    <div className="price-box">
                      <Link to={`/product/${item.id}`}>
                        <h4>{item.productName}</h4>
                        <span className="old-price">{(item.price * 1.1).toLocaleString()}đ</span>
                        <span className="new-price">{item.price.toLocaleString()}đ</span>
                      </Link>
                      <div className="action-buttons-homepage">
                        <AddToCartButton product={item} quantity={1} />
                        <button
                            className="heart-btn"
                            onClick={() => toggleFavorite(item)}
                            title="Yêu thích"
                        >
                          <FaHeart className={`heart-icon ${isFavorite ? 'red' : ''}`} />
                        </button>
                      </div>
                    </div>
                  </div>
              );
            })}
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
            <Link to="/introduction" className="story-button">Xem chi tiết</Link>
          </div>
          <div className="story-image">
            <img src="./img3.png" alt="Món ăn" />
          </div>
        </div>

        <div className="product-section">
          <p>DOLESAIGON</p>
          <h2>XÔI CHÈ</h2>
          <div className="tabs">
            {subCategories.map((cat) => (
                <button
                    key={cat}
                    className={cat === selectedSubCategory ? 'active' : ''}
                    onClick={() => setSelectedSubCategory(cat)}
                >
                  <span className="inner-border">{cat}</span>
                </button>
            ))}
          </div>

          <div className="product-subsection">
            <h3 className="category-heading">{selectedSubCategory}</h3>
            <div className="product-grid">
              {allXoiChe
                  .filter(p => getSubCategoryName(p) === selectedSubCategory)
                  .map((item) => {
                    const isFavorite = isItemFavorite(item.id);
                    return (
                        <div className="promo-item-homepage" key={item.id}>
                          <Link to={`/product/${item.id}`}>
                            {/* ✅ PASS: Pass the cacheKey prop */}
                            <ProductImage
                                productId={item.id}
                                alt={item.productName}
                                cacheKey={item.lastUpdated}
                            />
                            <span className="discount-tag">-10%</span>
                          </Link>
                          <div className="price-box">
                            <Link to={`/product/${item.id}`}>
                              <h4>{item.productName}</h4>
                              <span className="old-price">{(item.price * 1.1).toLocaleString()}đ</span>
                              <span className="new-price">{item.price.toLocaleString()}đ</span>
                            </Link>
                            <div className="action-buttons-homepage">
                              <AddToCartButton product={item} quantity={1} />
                              <button
                                  className="heart-btn"
                                  onClick={() => toggleFavorite(item)}
                                  title="Yêu thích"
                              >
                                <FaHeart className={`heart-icon ${isFavorite ? 'red' : ''}`} />
                              </button>
                            </div>
                          </div>
                        </div>
                    );
                  })}
            </div>
          </div>
        </div>

        <div className="product-section">
          <p>DOLESAIGON</p>
          <h2>CÁC LOẠI MÂM CÚNG LỄ</h2>
          <div className="tabs">
            {mamSubCategories.map((cat) => (
                <button
                    key={cat}
                    className={cat === selectedMamSubCategory ? 'active' : ''}
                    onClick={() => setSelectedMamSubCategory(cat)}
                >
                  <span className="inner-border">{cat}</span>
                </button>
            ))}
          </div>

          <div className="product-subsection">
            <h3 className="category-heading">{selectedMamSubCategory}</h3>
            <div className="product-grid">
              {mamProducts
                  .filter(p => getMamSubCategoryName(p) === selectedMamSubCategory)
                  .map((item) => {
                    const isFavorite = isItemFavorite(item.id);
                    return(
                        <div className="promo-item-homepage" key={item.id}>
                          <Link to={`/product/${item.id}`}>
                            {/* ✅ PASS: Pass the cacheKey prop */}
                            <ProductImage
                                productId={item.id}
                                alt={item.productName}
                                cacheKey={item.lastUpdated}
                            />
                            <span className="discount-tag">-10%</span>
                          </Link>
                          <div className="price-box">
                            <Link to={`/product/${item.id}`}>
                              <h4>{item.productName}</h4>
                              <span className="old-price">{(item.price * 1.1).toLocaleString()}đ</span>
                              <span className="new-price">{item.price.toLocaleString()}đ</span>
                            </Link>
                            <div className="action-buttons-homepage">
                              <AddToCartButton product={item} quantity={1} />
                              <button
                                  className="heart-btn"
                                  onClick={() => toggleFavorite(item)}
                                  title="Yêu thích"
                              >
                                <FaHeart className={`heart-icon ${isFavorite ? 'red' : ''}`} />
                              </button>
                            </div>
                          </div>
                        </div>
                    );
                  })}
            </div>
          </div>
        </div>

        <section className="why-choose-us">
          <div className="flip-card">
            <div className="flip-card-inner">
              <div className="flip-card-front">
                <img src="./Mattruoc.png" alt="Quà biếu mặt trước" />
              </div>
              <div className="flip-card-back">
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
              <img className="avatar" src="./img_2.png" alt="Ngọc Vỹ" />
              <div className="quote-icon">❝</div>
              <h4>Ngọc Vy</h4>
              <p className="job">Kế toán</p>
              <p>"Tôi đã lựa chọn DOLESAIGON để dành tặng cho người yêu của mình... sẽ quay lại nhiều lần nữa."</p>
            </div>
            <div className="testimonial-card">
              <img className="avatar" src="./img_2.png" alt="Minh Trần" />
              <div className="quote-icon">❝</div>
              <h4>Minh Trần</h4>
              <p className="job">Lập trình viên</p>
              <p>"Rất thích sản phẩm của DOLESAIGON... Tôi sẽ quay lại mua nữa."</p>
            </div>
            <div className="testimonial-card">
              <img className="avatar" src="./img_2.png" alt="Thùy Trang" />
              <div className="quote-icon">❝</div>
              <h4>Thùy Trang</h4>
              <p className="job">Đầu bếp</p>
              <p>"Biết đến DOLESAIGON khi định mua quà biếu Tết... online hay offline cũng được."</p>
            </div>
          </div>
        </section>

        <section className="partners">
          <p>DOLESAIGON</p>
          <h2>ĐỐI TÁC CỦA CHÚNG TÔI</h2>
          <div className="partner-logos">
            <img src="./vietcombank.png" alt="Vietcombank" />
            <img src="winmart.png" alt="WinMart" />
            <img src="lotte.png" alt="Lotte" />
          </div>
        </section>
      </div>
  );
}