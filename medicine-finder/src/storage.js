const STORAGE_KEY = "favoriteMedicines";

export function getFavorites() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}

export function saveFavorite(medicine) {
  const favorites = getFavorites();

  const exists = favorites.some((item) => item.id === medicine.id);

  if (!exists) {
    favorites.push(medicine);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  }
}

export function removeFavorite(id) {
  const favorites = getFavorites();

  const updatedFavorites = favorites.filter(
    (item) => item.id !== id
  );

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(updatedFavorites)
  );
}