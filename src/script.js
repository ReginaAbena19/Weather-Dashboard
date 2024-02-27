const searchInput = $("#search-input");
const searchButton = $("#search-button");
const todaysForecast = $("#today");
const fiveDaysForecast = $("#forecast");

const todayDate = dayjs();
const fiveDayCardsArr = Array.from({ length: 5 }, (_, i) =>
  todayDate.add(i + 1, "day").format("DD/MM/YYYY")
);

const searchHistory = JSON.parse(localStorage.getItem("searchHistory")) || [];

init();

function init() {
  renderSearchHistoryBtns();
  searchButton.on("click", handleSearch);
}

function handleSearch(event) {
  event.preventDefault();
  const citySearched = searchInput.val();
  getWeather(citySearched);
  searchInput.val("");
}

function saveToStorage(citySearched) {
  if (!searchHistory.includes(citySearched)) {
    searchHistory.unshift(citySearched);
    localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
    renderSearchHistoryBtns();
  }
}

function renderSearchHistoryBtns() {
  $("#history").empty();
  searchHistory.slice(0, 10).forEach((city) => {
    const cityButton = $(`<button>${city}</button>`)
      .addClass("btn btn-primary m-1")
      .on("click", () => getWeather(city));

    $("#history").append(cityButton);
  });
}

async function getWeather(citySearched) {
  $("#today, #forecast").empty();

  const fetchWeatherData = async (url) => {
    try {
      const response = await fetch(url);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error while fetching weather data:", error);
    }
  };

  const queryUrlCityCoordinates = `https://api.openweathermap.org/geo/1.0/direct?q=${citySearched}&limit=5&appid=18c18128340252dff3f8d65846038c18`;
  const locationData = await fetchWeatherData(queryUrlCityCoordinates);

  if (!locationData) return;

  const { lat, lon } = locationData[0];
  const queryURL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat.toFixed(4)}&&lon=${lon.toFixed(4)}&appid=18c18128340252dff3f8d65846038c18`;

  const weatherData = await fetchWeatherData(queryURL);

  if (!weatherData) return;

  saveToStorage(weatherData.city.name);

  const forecastHeading = $(
    `<h2>${weatherData.city.name} ${todayDate.format(
      "(DD/MM/YYYY)"
    )} <img src="http://openweathermap.org/img/w/${weatherData.list[0].weather[0].icon}.png"></h2>`
  );
  const forecastTemp = $(
    `<p>Temp: ${(weatherData.list[0].main.temp - 273.15).toFixed(2)} &deg;C</p>`
  );
  const forecastWind = $(
    `<p>Wind: ${weatherData.list[0].wind.speed} KPH</p>`
  );
  const forecastHumidity = $(
    `<p>Humidity: ${weatherData.list[0].main.humidity}%</p>`
  );

  todaysForecast.append(
    forecastHeading,
    forecastTemp,
    forecastWind,
    forecastHumidity
  );

  const fiveDayHeading = $(`<h4>5-Day Forecast</h4>`);
  fiveDaysForecast.append(fiveDayHeading);

  weatherData.list.slice(0, 5).forEach((dayData, i) => {
    const fiveDayCard = $(
      `<div class="card col-2 m-1">
        <div class="card-body">
          <h6>${fiveDayCardsArr[i]}</h6>
          <img id="pic" src="http://openweathermap.org/img/w/${dayData.weather[0].icon}.png">
          <p id="temp" class="card-text">Temp: ${(dayData.main.temp - 273.15).toFixed(2)} &deg;C</p>
          <p id="wind" class="card-text">Wind: ${dayData.wind.speed} KPH</p>
          <p id="humidity" class="card-text">Humidity: ${dayData.main.humidity}%</p>
        </div>  
      </div>`
    );

    fiveDaysForecast.append(fiveDayCard);
  });
}