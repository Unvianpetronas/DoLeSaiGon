// Lấy JSESSIONID từ cookie trình duyệt
const getSessionId = () => {
  const match = document.cookie.match(/JSESSIONID=([^;]+)/);
  return match ? match[1] : 'guest'; // fallback nếu chưa có session
};

// Lấy danh sách sản phẩm yêu thích từ localStorage
export const getFavorites = () => {
  const sessionId = getSessionId();
  return JSON.parse(localStorage.getItem(`favorites_${sessionId}`) || '[]');
};

// Lưu danh sách yêu thích vào localStorage
export const saveFavorites = (favorites) => {
  const sessionId = getSessionId();
  localStorage.setItem(`favorites_${sessionId}`, JSON.stringify(favorites));
};

// Thêm hoặc xóa sản phẩm khỏi danh sách yêu thích
export const toggleFavoriteItem = (item) => {
  const favorites = getFavorites();
  const exists = favorites.find(f => f.id === item.id);

  const updatedFavorites = exists
    ? favorites.filter(f => f.id !== item.id)
    : [...favorites, item];

  saveFavorites(updatedFavorites);
  return updatedFavorites;
};

// Kiểm tra sản phẩm có đang được yêu thích hay không
export const isItemFavorite = (id) => {
  const favorites = getFavorites();
  return favorites.some(item => item.id === id);
};

// (Tùy chọn) Xóa toàn bộ danh sách yêu thích cho session hiện tại
export const clearFavorites = () => {
  const sessionId = getSessionId();
  localStorage.removeItem(`favorites_${sessionId}`);
};
