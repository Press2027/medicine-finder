import './style.css'

const OPENFDA_URL = 'https://api.fda.gov/drug/label.json'

document.querySelector('#app').innerHTML = `
  <div class="container">
    <h1>💊 Medicine Finder</h1>

    <input
      id="search"
      type="text"
      placeholder="Search medicine (e.g. paracetamol, ibuprofen)"
    />

    <div id="results"></div>
  </div>
`

const searchInput = document.getElementById('search')
const resultsDiv = document.getElementById('results')

function renderResults(list) {
  if (!list || list.length === 0) {
    resultsDiv.innerHTML = '<p class="empty">No medicines found.</p>'
    return
  }

  resultsDiv.innerHTML = list
    .map((med) => {
      const name =
        med.openfda?.brand_name?.[0] ||
        med.openfda?.generic_name?.[0] ||
        'Unknown Medicine'

      const generic =
        med.openfda?.generic_name?.[0] || 'Not available'

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
        med.active_ingredient?.join(', ') || 'Not available'

      const warnings =
        med.warnings?.[0]
          ? med.warnings[0].slice(0, 200) + '...'
          : 'No safety warnings available.'

      return `
        <div class="card">
          <h3>${name}</h3>

          <p><strong>Generic:</strong> ${generic}</p>

          <p><strong>Uses:</strong> ${purpose}</p>

          <p><strong>Dosage:</strong> ${dosage}</p>

          <details>
            <summary>More Information</summary>

            <p><strong>Ingredients:</strong> ${ingredients}</p>

            <p><strong>Warnings:</strong> ${warnings}</p>
          </details>
        </div>
      `
    })
    .join('')
}

async function searchMedicine(term) {
  if (!term.trim()) {
    resultsDiv.innerHTML =
      '<p class="empty">Start typing to search medicines.</p>'
    return
  }

  resultsDiv.innerHTML = '<p class="empty">Searching...</p>'

  try {
    const query = encodeURIComponent(term)

    const url =
      `${OPENFDA_URL}?search=(openfda.brand_name:${query}) OR (openfda.generic_name:${query})&limit=10`

    const response = await fetch(url)

    if (!response.ok) {
      throw new Error('API request failed')
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

// Search as user types (debounced)
let timer

searchInput.addEventListener('input', (e) => {
  clearTimeout(timer)

  const term = e.target.value

  timer = setTimeout(() => {
    searchMedicine(term)
  }, 500)
})

// Initial message
resultsDiv.innerHTML =
  '<p class="empty">Start typing to search medicines.</p>'