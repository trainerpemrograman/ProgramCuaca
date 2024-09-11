const apikey = "d31387ba03msha233335b2ebe76dp13ab8bjsn3bab8387a398"; // x-rapidapi-key
const weatherDataEl = document.getElementById("weather-data");
const cityInputEl = document.getElementById("city-input");
const formEl = document.querySelector("form");
const searchHistoryEl = document.getElementById("search-history");

// Load history from localStorage on page load
document.addEventListener("DOMContentLoaded", loadHistory);

formEl.addEventListener("submit", (event) => {
  event.preventDefault();
  const cityValue = cityInputEl.value.trim(); // Menghapus spasi di awal dan akhir input

  if (!cityValue) {
    // Tampilkan alert jika input kosong
    Swal.fire({
      icon: "warning",
      title: "Masukkan Kota terlebih dahulu",
      text: "Silahkan masukkan kota telebih dahulu",
    });
    return; // Hentikan eksekusi jika input kosong
  }

  getWeatherData(cityValue);
});

formEl.addEventListener("submit", (event) => {
  event.preventDefault();
  const cityValue = cityInputEl.value.trim();
  if (cityValue) {
    getWeatherData(cityValue);
  }
});

async function getWeatherData(cityValue) {
  try {
    const response = await fetch(
      `https://weatherapi-com.p.rapidapi.com/forecast.json?q=${cityValue}&days=3`,
      {
        method: "GET",
        headers: {
          "X-RapidAPI-Key": apikey,
          "X-RapidAPI-Host": "weatherapi-com.p.rapidapi.com",
        },
      }
    );

    const data = await response.json();

    // Check if location is not found (error code 1006)
    if (data.error && data.error.code === 1006) {
      // Display SweetAlert when location is not found
      Swal.fire({
        icon: "error",
        title: "Lokasi tidak ditemukan",
        text: `Kota yang anda masukkan ada salah input pada "${cityValue}". Coba lagi yuk input kota yang benar.`,
      });
      return;
    }

    // Otherwise, continue processing the weather data
    const temperature = Math.round(data.current.temp_c); // Celsius
    const description = data.current.condition.text;
    const icon = data.current.condition.icon;
    const details = [
      `Feels like: ${Math.round(data.current.feelslike_c)}°C`,
      `Humidity: ${data.current.humidity}%`,
      `Wind speed: ${data.current.wind_kph} km/h`,
    ];

    // Update UI with weather data
    weatherDataEl.querySelector(
      ".icon"
    ).innerHTML = `<img src="${icon}" alt="Weather Icon">`;
    weatherDataEl.querySelector(
      ".temperature"
    ).textContent = `${temperature}°C`;
    weatherDataEl.querySelector(".description").textContent = description;
    weatherDataEl.querySelector(".details").innerHTML = details
      .map((detail) => `<div>${detail}</div>`)
      .join("");

    // Save search to localStorage
    saveToHistory(cityValue, temperature, description);
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "An error occurred. Please try again later.",
    });
    console.error("Error:", error.message);
  }
}

// Save search result to localStorage
function saveToHistory(city, temperature, description) {
  const history = JSON.parse(localStorage.getItem("weatherHistory")) || [];
  const newEntry = { city, temperature, description, timestamp: new Date() };

  // Add the new entry at the beginning of the array
  history.unshift(newEntry);

  // Limit history to the latest 5 searches
  if (history.length > 5) history.pop();

  localStorage.setItem("weatherHistory", JSON.stringify(history));
  loadHistory(); // Update the displayed history
}

// Load history from localStorage and display it
function loadHistory() {
  const history = JSON.parse(localStorage.getItem("weatherHistory")) || [];
  searchHistoryEl.innerHTML = history
    .map(
      (item) => `
          <div class="history-item">
            <strong>${item.city}</strong> - ${item.temperature}°C, ${
        item.description
      } <br>
            <small>${new Date(item.timestamp).toLocaleString()}</small>
          </div>`
    )
    .join("");
}
