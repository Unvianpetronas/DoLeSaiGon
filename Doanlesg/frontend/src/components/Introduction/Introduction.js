import React, { useRef } from 'react';
import './Introduction.css';
import { Helmet } from 'react-helmet-async';

function Introduction() {
const relatedArticles = [
  {
    id: 1,
    title: "Đồ Cúng Việt đồng hành trong dịp lễ",
    url: "https://baophutho.vn/do-cung-viet-dong-hanh-trong-dip-le-va-cac-su-kien-van-hoa-truyen-thong-214971.htm",
    imageUrl: "./bao_1.png"
  },
  {
    id: 2,
    title: "Đồ Cúng Việt lưu giữ nét văn hóa truyền thống",
    url: "https://baotuyenquang.com.vn/rao-vat/202407/do-cung-viet-luu-giu-net-van-hoa-truyen-thong-trong-moi-mam-cung-e635eaf/",
    imageUrl: "./bao_2.png"
  },
  {
    id: 3,
    title: "Gợi ý mâm cúng ông Công ông Táo đầy đủ",
    url: "https://laodong.vn/gia-dinh-hon-nhan/goi-y-mam-cung-ong-cong-ong-tao-day-du-1453035.ldo",
    imageUrl: "./bao_3.png"
  },
  {
      id: 4,
      title: "6 nghi lễ thờ cúng ngày Tết có ý nghĩa ra sao?",
      url: "https://tuoitre.vn/6-nghi-le-tho-cung-ngay-tet-co-y-nghia-ra-sao-20250125145703848.htm",
      imageUrl: "./bao_4.png"
    },
  {
      id: 5,
      title: "Đồ cúng tất niên gồm những gì để đầy đủ và ý nghĩa nhất",
      url: "https://miccreative.vn/do-cung-tat-nien-gom-nhung-gi/",
      imageUrl: "./bao_5.png"
    }
];
const scrollRef = useRef();
const scroll = (direction) => {
  if (!scrollRef.current) return;
  scrollRef.current.scrollBy({
    left: direction * 300,
    behavior: "smooth"
  });
};

  return (
   <>
      <div className="introduction-content">
          <Helmet>
              <title>Giới thiệu</title>
          </Helmet>
        <h1>GIỚI THIỆU</h1>

        <p>
          “Giữ gìn phong tục tổ tiên là gìn giữ hồn cốt dân tộc.” Trong mỗi mâm lễ dâng hương không chỉ là lễ vật, mà còn là tấm lòng thành kính, là sợi dây gắn kết hiện tại với cội nguồn. Với tinh thần ấy,
          <span className="brand-namze"> Dole Saigon</span> ra đời như một người bạn đồng hành tin cậy của mỗi gia đình Việt trong những dịp lễ trọng đại.
        </p>

        <p>
          Chúng tôi tâm huyết chuẩn bị đồ lễ một cách chỉn chu, trang trọng, giữ trọn vẹn bản sắc dân tộc và gửi gắm trong đó tinh thần “thành tâm – chuẩn mực – ý nghĩa”.
        </p>

        <p>
          <span className="brand-name">Dole Saigon</span> tự hào được góp phần gìn giữ nếp xưa, tiếp nối đạo hiếu, và cùng quý khách bày tỏ lòng biết ơn thiêng liêng với tổ tiên – những giá trị văn hóa không thể thay thế trong tâm hồn người Việt.
        </p>
        <div className="introduction-image">
           <img src="./img_3.png" alt="Món ăn" />
        </div>
      </div>
      {relatedArticles.length > 0 && (
            <div className="related-articles-wrapper">
              <h2>Bài Viết Liên Quan</h2>
              <div className="slider-wrapper">
                <button onClick={() => scroll(-1)} className="slider-btn left">◀</button>
                <div className="related-articles" ref={scrollRef}>
                  {relatedArticles.map((article) => (
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="related-item"
                      key={article.id}
                    >
                      {article.imageUrl && (
                        <img src={article.imageUrl} alt={article.title} />
                      )}
                      <p>{article.title}</p>
                    </a>
                  ))}
                </div>
                <button onClick={() => scroll(1)} className="slider-btn right">▶</button>
              </div>
            </div>
          )}

   </>
  );
}

export default Introduction;
