import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FaHeart } from 'react-icons/fa';
import './Products.css';
import AddToCartButton from "../AddToCart/AddToCartButton";


const ProductsPage = () => {
  const { categorySlug } = useParams();
  const [products, setProducts] = useState([]);
  const [sortOption, setSortOption] = useState('default');
  const [selectedSubCategory, setSelectedSubCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;



  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("http://localhost:8080/api/ver0.0.1/product?page=0&size=100&sort=productName");
        const data = await res.json();
        setProducts(data.content || []);
      } catch (err) {
        console.error('Lỗi khi tải sản phẩm:', err);
      }
    };
    fetchProducts();
  }, []);

  const toggleFavorite = (id) => {
    setProducts(prev =>
      prev.map(item =>
        item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
      )
    );
  };

  const addToCart = (item) => {
    alert(`Đã thêm "${item.productName}" vào giỏ hàng!`);
  };

  // Lấy tên danh mục con từ productName
  const getSubCategoryName = (product) => {
    const name = product.productName?.toLowerCase() || '';
    if (name.includes('quả') || name.includes('trái cây')) return 'Mâm Hoa Quả';
    if (name.includes('cúng') || name.includes('tổ tiên') || name.includes('thần tài')) return 'Mâm Cúng Lễ';
    if (name.includes('quà') || name.includes('vip') || name.includes('tặng')) return 'Quà Tặng Cao Cấp';
    if (name.includes('bánh') || name.includes('ngọt') || name.includes('oản')) return 'Mâm Bánh';
    if (name.includes('chay') || name.includes('mặn')) return 'Mâm Chay, Mặn';
    return 'Khác';
  };

  const subCategories = [...new Set(products.map(getSubCategoryName))];

  const filtered = selectedSubCategory
    ? products.filter((p) => getSubCategoryName(p) === selectedSubCategory)
    : products;

  const sorted = [...filtered].sort((a, b) => {
    switch (sortOption) {
      case 'price-asc':
        return a.price - b.price;
      case 'price-desc':
        return b.price - a.price;
      case 'name-asc':
        return a.productName.localeCompare(b.productName);
      case 'name-desc':
        return b.productName.localeCompare(a.productName);
      default:
        return 0;
    }
  });
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sorted.slice(indexOfFirstItem, indexOfLastItem);
  return (
    <div className="products-wrapper">
      {/* Banner khi không có danh mục */}
      {!categorySlug && (
        <>
          <div className="products-banner">
            <h2 className="brand-name">DoleSaigon</h2>
            <p className="products-description">
              <strong>🌸 Gửi trọn tình thân, trao chọn nghĩa lễ 🌸</strong><br />
              Tại DoleSaigon, mỗi món quà không chỉ là sản phẩm, mà là lời chúc lành – sự gắn kết thiêng liêng giữa các thế hệ.<br />
              Chúng tôi mang đến những <em>mâm lễ tươm tất</em>, <em>quà biếu tinh tế</em> – kết hợp hài hòa giữa giá trị truyền thống và chuẩn mực hiện đại.<br />
              Hơn cả một thương hiệu, DoleSaigon là người bạn đồng hành trong mọi khoảnh khắc sum vầy.
            </p>
          </div>
          <h2 className="products-title">Tất cả sản phẩm</h2>
        </>
      )}

      {/* Tabs danh mục con */}
      <div className="tabs">
        {subCategories.map(cat => (
          <button
            key={cat}
            className={cat === selectedSubCategory ? 'active' : ''}
            onClick={() => setSelectedSubCategory(cat)}
          >
            <span className="inner-border">{cat}</span>
          </button>
        ))}
      </div>

      {/* Sắp xếp */}
<div className="sort-options">
  <span className="sort-label">Xếp theo</span>
  {[
    { value: "default", label: "Mặc định" },
    { value: "name-asc", label: "Tên A-Z" },
    { value: "name-desc", label: "Tên Z-A" },
    { value: "newest", label: "Hàng mới" },
    { value: "price-asc", label: "Giá thấp đến cao" },
    { value: "price-desc", label: "Giá cao xuống thấp" },
  ].map((option) => (
    <button
      key={option.value}
      onClick={() => setSortOption(option.value)}
      className={`sort-button ${sortOption === option.value ? 'active' : ''}`}
    >
      <span className="diamond">◆</span>
      {option.label}
    </button>
  ))}
</div>

               {/* Danh sách sản phẩm */}
             {sorted.length === 0 ? (
               <p className="no-products">Không có sản phẩm nào.</p>
             ) : (
               <div className="product-grid">
                 {currentItems.map(item => (
                   <div key={item.id} className="promo-item-products">
                     <Link to={`/product/${item.id}`}>
                       <img src={`/products/${item.id}.png`} alt={item.productName} />
                       <span className="discount-tag">-{Math.round(10)}%</span>

                     </Link>

                     {/* Nằm ngoài Link nhưng vẫn nằm trong promo-item */}
                     <div className="price-box-products">
                          <h4>{item.productName}</h4>
                          <span className="old-price-products">{(item.price * 1.1).toLocaleString()}đ</span>
                          <span className="new-price-products">{item.price.toLocaleString()}đ</span>
                          <div className="action-buttons">
                               <AddToCartButton product={item} quantity={1} />
                               <button
                                 className="heart-btn"
                                 onClick={() => toggleFavorite(item.id)}
                                 title="Yêu thích"
                               >
                                 <FaHeart className={`heart-icon ${item.isFavorite ? 'red' : ''}`} />
                               </button>
                             </div>
                        </div>


                   </div>

                 ))}
               </div>
             )}
             <div className="pagination">
               {Array.from({ length: Math.ceil(sorted.length / itemsPerPage) }, (_, i) => (
                 <button
                   key={i + 1}
                   onClick={() => setCurrentPage(i + 1)}
                   className={currentPage === i + 1 ? 'active' : ''}
                 >
                   {i + 1}
                 </button>
               ))}
             </div>

    </div>
  );
};

export default ProductsPage;
