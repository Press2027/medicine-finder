import { getFavorites, removeFavorite } from "./storage.js";

const favoritesList = document.getElementById("favoritesList");


/* =========================
   Escape HTML
========================= */

function escapeHTML(str) {
  if (!str) return "";

  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


/* =========================
   Render Favorites
========================= */

function renderFavorites() {
  const favorites = getFavorites();

  /* Check that the favorites container exists */
  if (!favoritesList) {
    console.error("favoritesList element was not found.");
    return;
  }


  /* No favorites */
  if (!favorites || favorites.length === 0) {

    favoritesList.innerHTML = `
      <div class="empty">

        <h2>No Favorite Medicines</h2>

        <p>
          You haven't saved any favorite medicines yet.
        </p>

        <p>
          <a href="index.html" class="home-btn">
            ← Go back to search medicines
          </a>
        </p>

      </div>
    `;

    updateFavoriteCount(0);

    return;
  }


  /* Update count */
  updateFavoriteCount(favorites.length);


  /* Display favorites */
  favoritesList.innerHTML = favorites
    .map((med) => {

      const savedDate = med.savedAt
        ? new Date(med.savedAt).toLocaleDateString()
        : null;


      return `
        <article
          class="favorite-card fade-in"
          id="fav-${escapeHTML(med.id)}"
        >

          <div class="medicine-header">

            <div>

              <h3>
                ${escapeHTML(
                  med.brand || "Unknown Medicine"
                )}
              </h3>

              <p>
                <strong>Generic Name:</strong>
                ${escapeHTML(
                  med.generic || "Not available"
                )}
              </p>

              ${
                savedDate
                  ? `
                    <p class="saved-date">
                      Saved on ${savedDate}
                    </p>
                  `
                  : ""
              }

            </div>


            <button
              type="button"
              class="remove-favorite-btn"
              data-id="${escapeHTML(med.id)}"
              title="Remove from favorites"
            >
              🗑️ Remove
            </button>

          </div>

        </article>
      `;
    })
    .join("");


  /* Connect remove buttons */
  bindRemoveButtons();
}


/* =========================
   Remove Favorite Buttons
========================= */

function bindRemoveButtons() {

  document
    .querySelectorAll(".remove-favorite-btn")
    .forEach((button) => {

      button.addEventListener("click", (event) => {

        const id =
          event.currentTarget.dataset.id;


        if (!id) {
          console.error("Favorite ID not found.");
          return;
        }


        const removed = removeFavorite(id);


        if (removed) {

          const card =
            document.getElementById(`fav-${id}`);


          if (card) {

            card.style.opacity = "0";

            card.style.transform =
              "translateY(-10px)";

            card.style.transition =
              "all 0.2s ease";


            setTimeout(() => {
              renderFavorites();
            }, 200);

          } else {

            renderFavorites();

          }

        }

      });

    });
}


/* =========================
   Update Favorite Count
========================= */

function updateFavoriteCount(count) {

  const countElement =
    document.getElementById("favoritesCount");


  if (countElement) {

    countElement.textContent = count;

  }
}


/* =========================
   Clear All Favorites
========================= */

function setupClearButton() {

  const clearButton =
    document.getElementById("clearFavorites");


  if (!clearButton) {
    return;
  }


  clearButton.addEventListener("click", () => {

    const favorites = getFavorites();


    if (!favorites || favorites.length === 0) {
      return;
    }


    const confirmed =
      confirm(
        "Are you sure you want to remove all favorite medicines?"
      );


    if (!confirmed) {
      return;
    }


    /*
      Remove every favorite
      using the existing removeFavorite function.
    */
    favorites.forEach((med) => {
      removeFavorite(med.id);
    });


    renderFavorites();

  });
}


/* =========================
   Page Initialization
========================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    renderFavorites();

    setupClearButton();

  }
);