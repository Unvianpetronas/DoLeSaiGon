import React from 'react';
import { useParams } from 'react-router-dom';
import './Category.css';

const categoryData = {
  'mam-hoa-qua': {
    title: 'Mâm hoa quả',
    products: [
      {
        id: 1,
        name: 'Mâm trái cây Tết',
        image: '/images/fruit1.jpg',
        price: '500.000đ',
      },
      {
        id: 2,
        name: 'Mâm trái cây lễ cưới',
        image: '/images/fruit2.jpg',
        price: '650.000đ',
      },
      {
        id: 3,
        name: 'Mâm trái cây phong thủy',
        image: '/images/fruit3.jpg',
        price: '720.000đ',
      },
    ],
  },
  // Bạn có thể thêm các danh mục khác tương tự ở đây
};

function Category() {
  const { categorySlug } = useParams();
  const category = categoryData[categorySlug];

  if (!category || category.products.length === 0) {
    return (
      <div className="category">
        <h2 className="category-title">{category?.title || 'Danh mục'}</h2>
        <p>Không có sản phẩm nào.</p>
      </div>
    );
  }

  return (
    <div className="category">
      <h2 className="category-title">{category.title}</h2>
      <div className="product-list">
        {category.products.map((product) => (
          <div key={product.id} className="product-card">
            <img src={product.image} alt={product.name} />
            <h3>{product.name}</h3>
            <p className="price">{product.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Category;
