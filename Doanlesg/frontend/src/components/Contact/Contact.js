import React from "react";
import "./Contact.css";

function Contact() {
  return (
    <div className="contact-page">
       <div className="contact-info-container">
        <div className="contact-info">
          <h2>CỬA HÀNG DOLESAIGON</h2>
          <p><strong>Địa chỉ:</strong> DH FPT,Đường D1, Khu Công Nghệ Cao, TP.Thủ Đức, Tp.HCM</p>
          <p><strong>Hotline:</strong> 1900 000</p>
          <p><strong>Email:</strong> dolesaigon@fpt.vn</p>

          <div className="contact-form">
            <h3>LIÊN HỆ VỚI CHÚNG TÔI</h3>
            <form>
              <div className="form-group">
                <input type="text" placeholder="Họ và tên" />
                <input type="email" placeholder="Email" />
              </div>
              <input type="text" placeholder="Điện thoại" />
              <textarea placeholder="Nội dung"></textarea>
              <button type="submit">Gửi tin nhắn</button>
            </form>
          </div>
        </div>

        <div className="map-container">
          <iframe
            title="Google Map"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.610010537615!2d106.80730271070227!3d10.841127589267057!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752731176b07b1%3A0xb752b24b379bae5e!2zVHLGsOG7nW5nIMSQ4bqhaSBo4buNYyBGUFQgVFAuIEhDTQ!5e0!3m2!1svi!2s!4v1749783263865!5m2!1svi!2s"
            width="100%"
            height="600"
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />

        </div>
      </div>
    </div>
  );
}

export default Contact;
