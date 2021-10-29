const url = "https://api.openweathermap.org";
const API_KEY = "d8f811a17a46fad08708e1773d5122f5";
const baseIconUrl = "http://openweathermap.org/img/w";
let errorMsg,
  cityInput,
  citiesList,
  contentContainer,
  citiesDict = [];

$(document).ready(function () {
  errorMsg = document.getElementById("errorMsg");
  contentContainer = document.querySelector(".content-container");
  hideErrorMsg();
  hideContent();
  cityInput = document.getElementById("cityInput");
  citiesList = document.getElementById("citiesList");
  const storedCities = localStorage.getItem("cities");
  storedCities &&
    storedCities.split(",").forEach((city) => {
      citiesDict.push(city);
      updateSearchedCities(city);
    });
});

function searchCity() {
  const { value: cityName } = cityInput;
  if (cityName) {
    fetchCityCoordinates(cityName.trim());
  } else {
    showErrorMsg();
    hideContent();
  }
}

function searchCityFromHistory(event) {
  cityInput.value = event.target.innerText;
  searchCity();
}

function fetchCityCoordinates(cityName) {
  // make api call to fetch coordinates
  fetch(`${url}/data/2.5/weather?q=${cityName}&appid=${API_KEY}`)
    .then((res) => res.json())
    .then((res) => {
      if (res.cod !== "404") {
        makeApiCallForWeather(res.coord.lat, res.coord.lon, cityName);
      } else {
        showErrorMsg();
        hideContent();
      }
    });
}

function makeApiCallForWeather(lat, lon, cityName) {
  fetch(
    `${url}/data/2.5/onecall?lat=${lat}&lon=${lon}&units=imperial&exclude=minutely,hourly,alerts&appid=${API_KEY}`
  )
    .then((res) => res.json())
    .then((res) => {
      if (res.cod !== "404") {
        hideErrorMsg();
        showContent();
        setCurrentData(res, cityName);
        SetNextFiveDaysWeather(res);
        // make search history if it is a valid city and not already exist
        if (
          citiesDict.findIndex(
            (city) => city.toLowerCase() === cityName.toLowerCase()
          ) === -1
        ) {
          updateSearchedCities(cityName);
          citiesDict.push(cityName);
          localStorage.setItem("cities", citiesDict.toLocaleString());
        }
      } else {
        showErrorMsg();
        hideContent();
      }
    });
}

function setCurrentData(data, cityName) {
  let currTemp,
    currHumidity,
    currWind,
    currUv,
    currCity,
    currDate,
    currWeatherImg;
  // set variables for current data
  currTemp = document.getElementById("current_temperature");
  currHumidity = document.getElementById("current_humidity");
  currWind = document.getElementById("current_wind");
  currUv = document.getElementById("current_uv_index");
  currCity = document.getElementById("current_city");
  currDate = document.getElementById("current_date");
  currWeatherImg = document.getElementById("current_weather_img");

  const { temp, humidity, uvi, wind_speed, dt, weather } = data.current;
  currTemp.innerText = temp;
  currCity.innerText = cityName;
  currHumidity.innerText = humidity;
  currWind.innerText = wind_speed;
  currDate.innerText = getDate(dt);
  currWeatherImg.src = `${baseIconUrl}/${weather[0].icon}.png`;
  setUvIndex(currUv, uvi);
}

function setUvIndex(currUv, uvi) {
  // 0-2 favorable
  // 3-7 moderate
  // 8+ severe
  currUv.innerText = uvi;
  if (uvi >= 0 && uvi <= 2) {
    currUv.style.backgroundColor = "green";
  } else if (uvi > 2 && uvi <= 7) {
    currUv.style.backgroundColor = "yellow";
  } else {
    currUv.style.backgroundColor = "red";
  }
}

function getDate(dt) {
  const resp = new Date(dt * 1000);
  const date = resp.toJSON().slice(0, 10);
  return date.slice(5, 7) + "/" + date.slice(8, 10) + "/" + date.slice(0, 4);
}

function updateSearchedCities(cityName) {
  const li = document.createElement("li");
  const markup = `
    <h2>
      <button style='width:200px;' onclick="searchCityFromHistory(event)">${cityName}</span>
    </h2>
  `;
  li.innerHTML = markup;
  citiesList.appendChild(li);
}

function SetNextFiveDaysWeather(res) {
  const weatherList = document.getElementById("weather-list");
  weatherList.innerHTML = "";

  for (let i = 1; i <= 5; i++) {
    const { temp, humidity, wind_speed, dt, weather } = res.daily[i];
    const li = document.createElement("li");
    const date = getDate(dt);
    const img = `${baseIconUrl}/${weather[0].icon}.png`;
    const markup = `
    <div class='weather-tile'>
      <h4>${date}</h4>
      <h4><img src=${img} alt='' /></h4>
      <h4>Temp: ${temp.max} F</h4>
      <h4>Wind: ${wind_speed} MPH</h4>
      <h4>Humidity: ${humidity} %</h4>
    </div>
    `;
    li.className = "weather-item";
    li.innerHTML = markup;
    weatherList.appendChild(li);
  }
}

function showErrorMsg() {
  errorMsg.style.display = "";
}

function hideErrorMsg() {
  errorMsg.style.display = "None";
}

function showContent() {
  contentContainer.style.display = "";
}

function hideContent() {
  contentContainer.style.display = "None";
}
