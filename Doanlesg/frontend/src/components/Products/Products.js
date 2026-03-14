import React, { useEffect, useState } from 'react';
import { Link, useParams, useLocation, useNavigate } from 'react-router-dom';
import { FaHeart } from 'react-icons/fa';
import './Products.css';
import AddToCartButton from "../AddToCart/AddToCartButton";
import { toggleFavoriteItem, isItemFavorite } from '../LikeButton/LikeButton';
import ProductImage from '../common/ProductImage';
import {
  CategoryData,
  subCategoryMap,
  getSubCategoryName,
} from "../../data/CategoryData";
import { Helmet } from 'react-helmet-async';

const ProductsPage = () => {

  const { categorySlug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const searchParams = new URLSearchParams(location.search);
  const keyword = searchParams.get("keyword") || "";
  const selectedSub = searchParams.get("sub") || "";

  const [products, setProducts] = useState([]);
  const [sortOption, setSortOption] = useState('default');
  const [selectedCategory, setSelectedCategory] = useState(''); // only used for /products
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 20;
  const isAllPage = !categorySlug;
  const currentSlug = isAllPage
      ? CategoryData?.find((c) => c.name === selectedCategory)?.slug
      : categorySlug;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        let url = "";
        if (keyword.trim()) {
          url = `/api/ver0.0.1/product/productname?keyword=${encodeURIComponent(keyword)}&page=0&size=100&sort=productName`;
        } else {
          url = `/api/ver0.0.1/product?page=0&size=100&sort=productName`;
        }
        const res = await fetch(url);
        const data = await res.json();
        const productsWithCacheKey = (data.content || []).map(p => ({
          ...p,
          lastUpdated: Date.now()
        }));
        setProducts(productsWithCacheKey);
      } catch (err) {
        console.error('Lỗi khi tải sản phẩm:', err);
      }
    };
    fetchProducts().then();
  }, [keyword]);

  // Reset page when slug changes
  useEffect(() => {
    setCurrentPage(1);
  }, [categorySlug, selectedSub]);

  // Fallback subcategory function if CategoryData is not available
  const getSubCategoryNameFallback = (product) => {
    const name = product.productName?.toLowerCase() || '';
    if (name.includes('quả') || name.includes('trái cây')) return 'Mâm Hoa Quả';
    if (name.includes('cúng') || name.includes('tổ tiên') || name.includes('thần tài')) return 'Mâm Cúng Lễ';
    if (name.includes('quà') || name.includes('vip') || name.includes('tặng')) return 'Quà Tặng Cao Cấp';
    if (name.includes('bánh') || name.includes('ngọt') || name.includes('oản')) return 'Mâm Bánh';
    if (name.includes('chay') || name.includes('mặn')) return 'Mâm Chay, Mặn';
    return 'Khác';
  };

  const mainCategories = CategoryData ? CategoryData.map((c) => c.name) : [];

  let filtered = products;

  if (currentSlug && CategoryData) {
    filtered = products.filter((p) => {
      const sub = getSubCategoryName(p, currentSlug);
      if (!subCategoryMap[currentSlug]?.includes(sub)) return false;

      if (selectedSub) return sub === selectedSub;

      return true;
    });
  } else if (selectedCategory && !CategoryData) {
    // Fallback filtering for when CategoryData is not available
    filtered = products.filter((p) => {
      const sub = getSubCategoryNameFallback(p);
      return sub !== 'Khác'; // Filter out 'Khác' category
    });
  }

  // Get subcategories for tabs
  const subCategories = CategoryData && currentSlug && subCategoryMap[currentSlug]
      ? subCategoryMap[currentSlug]
      : [...new Set(products.map(getSubCategoryNameFallback))];

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
  const currentItems = sorted
      .slice(indexOfFirstItem, indexOfLastItem)
      .map(item => ({
        ...item,
        isFavorite: isItemFavorite(item.id),
      }));

  const toggleFavorite = (item) => {
    toggleFavoriteItem(item);
    setProducts(prev =>
        prev.map(p =>
            p.id === item.id ? { ...p, isFavorite: !p.isFavorite } : p
        )
    );
  };

  return (
      <div className="products-wrapper">
        <Helmet>
          <title>Sản phẩm</title>
        </Helmet>
        {/* Banner when no category is selected */}
        {isAllPage && (
            <>
              <div className="products-banner">
                <h2 className="brand-name">DoleSaigon</h2>
                <p className="products-description">
                  <strong>🌸 Gửi trọn tình thân, trao chọn nghĩa lễ 🌸</strong><br />
                  Tại DoleSaigon, mỗi món quà không chỉ là sản phẩm, mà là lời chúc lành – sự gắn kết thiêng liêng giữa các thế hệ.<br />
                  Chúng tôi mang đến những <em>mâm lễ tươm tất</em>, <em>quà biếu tinh tế</em> – kết hợp hài hòa giữa giá trị truyền thống và chuẩn mực hiện đại.<br />
                  Hơn cả một thương hiệu, DoleSaigon sẽ là người bạn đồng hành trong mọi khoảnh khắc sum vầy.
                </p>
              </div>
              <h2 className="products-title">Tất cả sản phẩm</h2>
            </>
        )}

        {/* Main category tabs (only at /products) */}
        {isAllPage && CategoryData && (
            <div className="tabs main-tabs">
              <button
                  className={!selectedCategory ? "active" : ""}
                  onClick={() => setSelectedCategory("")}
              >
                <span className="inner-border">Tất cả</span>
              </button>
              {mainCategories.map((cat) => (
                  <button
                      key={cat}
                      className={cat === selectedCategory ? "active" : ""}
                      onClick={() => setSelectedCategory(cat)}
                  >
                    <span className="inner-border">{cat}</span>
                  </button>
              ))}
            </div>
        )}

        {/* Sub-category tabs */}
        {!isAllPage && CategoryData && subCategoryMap[categorySlug] ? (
            <div className="tabs sub-tabs">
              {subCategoryMap[categorySlug].map((sub) => (
                  <button
                      key={sub}
                      className={`subcategory-tab ${sub === selectedSub ? "active" : ""}`}
                      onClick={() =>
                          navigate(`/category/${categorySlug}?sub=${encodeURIComponent(sub)}`)
                      }
                  >
                    <span className="inner-border">{sub}</span>
                  </button>
              ))}
            </div>
        ) : (
            // Deprecated
            <div className="tabs">
              {/*{subCategories.map(cat => (*/}
              {/*    <button*/}
              {/*        key={cat}*/}
              {/*        className={cat === selectedSub ? 'active' : ''}*/}
              {/*        onClick={() => {*/}
              {/*          if (isAllPage) {*/}
              {/*            // For /products page, use state*/}
              {/*            setSelectedCategory(cat);*/}
              {/*          } else {*/}
              {/*            // For category pages, use URL query*/}
              {/*            navigate(`/category/${categorySlug}?sub=${encodeURIComponent(cat)}`);*/}
              {/*          }*/}
              {/*        }}*/}
              {/*    >*/}
              {/*      <span className="inner-border">{cat}</span>*/}
              {/*    </button>*/}
              {/*))}*/}
            </div>
        )}

        {/* Sorting Options */}
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

        {/* Product List */}
        {sorted.length === 0 ? (
            <p className="no-products">Không có sản phẩm nào.</p>
        ) : (
            <div className="product-grid">
              {currentItems.map(item => (
                  <div key={item.id} className="promo-item-products">
                    <Link to={`/product/${item.id}`}>
                      <ProductImage
                          productId={item.id}
                          alt={item.productName}
                          cacheKey={item.lastUpdated}
                      />
                      <span className="discount-tag">-{Math.round(10)}%</span>
                    </Link>

                    <div className="price-box-products">
                      <Link to={`/product/${item.id}`}>
                        <h4>{item.productName}</h4>
                        <span className="old-price-products">{(item.price * 1.1).toLocaleString()}đ</span>
                        <span className="new-price-products">{item.price.toLocaleString()}đ</span>
                      </Link>
                      <div className="action-buttons-homepage">
                        <AddToCartButton product={item} quantity={1} />
                        <button
                            className="heart-btn"
                            onClick={() => toggleFavorite(item)}
                            title={item.isFavorite ? "Bỏ khỏi yêu thích" : "Thêm vào yêu thích"}
                        >
                          <FaHeart className={`heart-icon ${item.isFavorite ? 'red' : ''}`} />
                        </button>
                      </div>
                    </div>
                  </div>
              ))}
            </div>
        )}

        {/* Pagination */}
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