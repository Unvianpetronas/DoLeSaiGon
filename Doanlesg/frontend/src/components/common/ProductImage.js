import React, { useState, useEffect } from 'react';

const CLOUD_NAME = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;

const ProductImage = ({ productId, alt, className }) => {
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [productId]);

  if (!productId || !CLOUD_NAME || imageError) {
    return <span className={`no-image ${className || ''}`}>🚫</span>;
  }

  // ✅ FIX: Use the simplified URL that doesn't require special permissions
  const imageUrl = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/v1/${productId}.jpg`;

  return (
      <img
          src={imageUrl}
          alt={alt || `Sản phẩm ${productId}`}
          className={className || ''}
          onError={() => setImageError(true)}
      />
  );
};

export default ProductImage;