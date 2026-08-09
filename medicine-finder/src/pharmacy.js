import { initializeMap } from "./services/googleMaps.js";

const pharmacyList = document.querySelector("#pharmacyList");

let createPharmacyMarkers;
let focusMarkerOnMap;

// Fallback location: Juba, South Sudan
const DEFAULT_LOCATION = {
  lat: 4.8594,
  lng: 31.5713
};

// Google Maps callback
window.initMap = function () {
  if (!navigator.geolocation) {
    console.warn("Geolocation is not supported.");
    loadMapWithFallback(DEFAULT_LOCATION);
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      loadMap(position);
    },
    (error) => {
      console.warn(
        "Geolocation failed or was denied:",
        error.message
      );

      loadMapWithFallback(DEFAULT_LOCATION);
    }
  );
};

function loadMap(position) {
  const {
    service,
    userLocation,
    createPharmacyMarkers: addMarkers,
    focusMarker
  } = initializeMap(position);

  createPharmacyMarkers = addMarkers;
  focusMarkerOnMap = focusMarker;

  service.nearbySearch(
    {
      location: userLocation,
      radius: 5000,
      type: ["pharmacy"]
    },
    displayResults
  );
}

function loadMapWithFallback(coords) {
  loadMap({
    coords: {
      latitude: coords.lat,
      longitude: coords.lng
    }
  });
}

function displayResults(results, status) {
  pharmacyList.innerHTML = "";

  if (
    status !== google.maps.places.PlacesServiceStatus.OK ||
    !results ||
    results.length === 0
  ) {
    pharmacyList.innerHTML =
      "<p>No nearby pharmacies found within 5 km.</p>";

    return;
  }

  // Add pharmacy markers to Google Map
  if (typeof createPharmacyMarkers === "function") {
    createPharmacyMarkers(results);
  }

  // Create pharmacy cards
  results.forEach(createCard);
}

function createCard(place) {
  const card = document.createElement("article");

  card.className = "pharmacy-card medicine-card fade-in";

  const safeName = escapeHTML(
    place.name || "Pharmacy"
  );

  const safeVicinity = escapeHTML(
    place.vicinity || "Address unavailable"
  );

  card.innerHTML = `
    <h3>${safeName}</h3>

    <p>📍 ${safeVicinity}</p>

    <div class="pharmacy-actions">

      ${
        place.place_id
          ? `
            <button
              type="button"
              class="view-map-btn"
            >
              📍 View on Map
            </button>
          `
          : ""
      }

      <button
        type="button"
        class="directions-btn"
      >
        🗺️ Directions
      </button>

    </div>
  `;

  // View on map
  const viewMapBtn =
    card.querySelector(".view-map-btn");

  if (viewMapBtn) {
    viewMapBtn.addEventListener("click", () => {
      if (
        typeof focusMarkerOnMap === "function" &&
        place.place_id
      ) {
        focusMarkerOnMap(place.place_id);
      }
    });
  }

  // Google Maps directions
  const directionsBtn =
    card.querySelector(".directions-btn");

  directionsBtn.addEventListener("click", () => {
    const query = encodeURIComponent(
      `${place.name || "Pharmacy"} ${
        place.vicinity || ""
      }`
    );

    window.open(
      `https://www.google.com/maps/search/?api=1&query=${query}`,
      "_blank",
      "noopener,noreferrer"
    );
  });

  pharmacyList.appendChild(card);
}

function escapeHTML(str) {
  if (!str) {
    return "";
  }

  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}