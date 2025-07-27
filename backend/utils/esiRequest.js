const axios = require("axios");

const ESI_HEADERS = {
  "User-Agent": "Triffnix/1.0 (contact: cooperbroderick25@gmail.com)",
};

async function fetchESI(url) {
  try {
    const response = await axios.get(url, { headers: ESI_HEADERS });
    return response.data;
  } catch (error) {
    console.error(`Error fetching ESI: ${url}`, error.response?.status || error.message);
    return null; // important to avoid crashing downstream
  }
}

module.exports = fetchESI;
