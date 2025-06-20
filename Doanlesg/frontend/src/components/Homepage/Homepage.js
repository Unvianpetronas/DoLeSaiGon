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
          Bộ sưu tập quà tặng DOLESAIGON là giải pháp quà Tết, quà tặng Trung Thu, quà tặng doanh nghiệp...
        </p>
        <div className="gift-collection">
          {["BoQuaBonMua.png", "BoQuaLocPhat.png", "BoQuaThinhVuong.png", "BoQuaTaiLoc.png"].map((src, index) => (
            <Link to="/contact" key={index} className="gift-item">
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
            <div className="promo-item" key={index}>
              <img src={`./${src}`} alt={src} />
              <div class="price-box">
              <p>{["Chiêu Tài Đón Lộc", "Long Quý Tụ Phúc", "Ngũ Sắc Tài Lộc", "An Nhiên Phú Quý"][index]}</p>
              <span className="old-price">{[800000, 2200000, 3500000, 3500000][index].toLocaleString()}đ</span>
              <span className="new-price">{[500000, 1656000, 3100000, 3200000][index].toLocaleString()}đ</span>
            </div>
            </div>
          ))}
        </div>
        <button className="view-all-btn">Xem tất cả</button>
      </div>
    </div>
  );
}
