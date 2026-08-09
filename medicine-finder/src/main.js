import './style.css'
import { saveFavorite } from './storage.js'

const OPENFDA_URL = 'https://api.fda.gov/drug/label.json'

document.querySelector('#app').innerHTML = `
  <input
    id="search"
    type="text"
    placeholder="Search medicine (e.g. paracetamol, ibuprofen)"
  />

  <p>
    <a href="/favorites.html">❤️ View Favorite Medicines</a>
  </p>

  <div id="results"></div>
`

const searchInput = document.getElementById('search')
const resultsDiv = document.getElementById('results')

// Helper function to prevent XSS attacks when inserting string into innerHTML
function escapeHTML(str) {
  if (!str) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function renderResults(list) {
  if (!list || list.length === 0) {
    resultsDiv.innerHTML = 'No medicines found.'
    return
  }

  resultsDiv.innerHTML = list
    .map((med, index) => {
      const name =
        med.openfda?.brand_name?.[0] ||
        med.openfda?.generic_name?.[0] ||
        'Unknown Medicine'

      const generic =
        med.openfda?.generic_name?.[0] ||
        'Not available'

      const purpose =
        med.purpose?.[0] ||
        (med.indications_and_usage?.[0]
          ? med.indications_and_usage[0].slice(0, 120) + '...'
          : 'No description available.')

      const dosage =
        med.dosage_and_administration?.[0]
          ? med.dosage_and_administration[0].slice(0, 120) + '...'
          : 'No dosage information available.'

      const ingredients =
        med.active_ingredient?.join(', ') ||
        'Not available'

      const warnings =
        med.warnings?.[0]
          ? med.warnings[0].slice(0, 200) + '...'
          : 'No safety warnings available.'

      const id =
        med.id ||
        med.openfda?.set_id?.[0] ||
        `${name}-${generic}-${index}`

      return `
        <div class="card">
          <h3>${escapeHTML(name)}</h3>

          <p>
            <strong>Generic:</strong> ${escapeHTML(generic)}
          </p>

          <p>
            <strong>Uses:</strong> ${escapeHTML(purpose)}
          </p>

          <p>
            <strong>Dosage:</strong> ${escapeHTML(dosage)}
          </p>

          <details>
            <summary>More Information</summary>

            <p>
              <strong>Ingredients:</strong>
              ${escapeHTML(ingredients)}
            </p>

            <p>
              <strong>Warnings:</strong>
              ${escapeHTML(warnings)}
            </p>
          </details>

          <button
            class="favorite-btn"
            data-id="${escapeHTML(id)}"
            data-brand="${escapeHTML(name)}"
            data-generic="${escapeHTML(generic)}"
          >
            ❤️ Save Favorite
          </button>
        </div>
      `
    })
    .join('')

  // Event listeners for favorite buttons
  document
    .querySelectorAll('.favorite-btn')
    .forEach((button) => {
      button.addEventListener('click', () => {
        // HTMLElement.dataset automatically decodes string attributes
        const medicine = {
          id: button.dataset.id,
          brand: button.dataset.brand,
          generic: button.dataset.generic
        }

        saveFavorite(medicine)

        button.textContent = '❤️ Saved!'
        button.disabled = true
      })
    })
}

async function searchMedicine(term) {
  const cleanTerm = term.trim()

  if (!cleanTerm) {
    resultsDiv.innerHTML = 'Start typing to search medicines.'
    return
  }

  resultsDiv.innerHTML = 'Searching...'

  try {
    // OpenFDA search syntax: search with wildcards to allow partial matches
    const query = encodeURIComponent(`"${cleanTerm}"`)
    const url = `${OPENFDA_URL}?search=openfda.brand_name:${query}+openfda.generic_name:${query}&limit=10`

    const response = await fetch(url)

    if (!response.ok) {
      if (response.status === 404) {
        resultsDiv.innerHTML = 'No medicines found.'
        return
      }
      throw new Error(`API request failed with status ${response.status}`)
    }

    const data = await response.json()
    renderResults(data.results || [])

  } catch (error) {
    console.error(error)

    resultsDiv.innerHTML = `
      <p class="empty">
        Unable to fetch medicines from OpenFDA.
      </p>
    `
  }
}

// Search debounce
let timer

searchInput.addEventListener('input', (e) => {
  clearTimeout(timer)
  const term = e.target.value

  timer = setTimeout(() => {
    searchMedicine(term)
  }, 500)
})

// Initial message
resultsDiv.innerHTML = 'Start typing to search medicines.'