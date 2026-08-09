/**
 * Initializes the Google Map and PlacesService
 * @param {Object} position - Geolocation position object containing coords
 * @returns {Object} { service, userLocation, map }
 */
export function initializeMap(position) {
  const userLocation = {
    lat: position.coords.latitude,
    lng: position.coords.longitude
  };

  const mapElement = document.querySelector("#map");

  const map = new google.maps.Map(mapElement, {
    center: userLocation,
    zoom: 14,
    disableDefaultUI: false
  });

  // User location marker
  new google.maps.Marker({
    position: userLocation,
    map: map,
    title: "Your Location",
    icon: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png"
  });

  const service = new google.maps.places.PlacesService(map);

  return { service, userLocation, map };
}