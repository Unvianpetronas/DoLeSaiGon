import Cookies from 'js-cookie';

export const getFavorites = () => {
  return JSON.parse(Cookies.get('favorites') || '[]');
};

export const saveFavorites = (favorites) => {
  Cookies.set('favorites', JSON.stringify(favorites), { expires: 7 });
};

export const toggleFavoriteItem = (item) => {
  let favorites = getFavorites();
  const exists = favorites.find(f => f.id === item.id);

  if (exists) {
    favorites = favorites.filter(f => f.id !== item.id);
  } else {
    favorites.push(item);
  }

  saveFavorites(favorites);
  return favorites;
};

export const isItemFavorite = (id) => {
  const favorites = getFavorites();
  return favorites.some(item => item.id === id);
};
