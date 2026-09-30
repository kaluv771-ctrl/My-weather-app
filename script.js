// ==========================================
// API CONFIGURATION
// ==========================================

const GEOCODING_API =
    "https://geocoding-api.open-meteo.com/v1/search";

const WEATHER_API =
    "https://api.open-meteo.com/v1/forecast";


// ==========================================
// DOM ELEMENTS
// ==========================================

const searchForm =
    document.getElementById("search-form");

const cityInput =
    document.getElementById("city-input");

const searchButton =
    document.getElementById("search-button");

const errorMessage =
    document.getElementById("error-message");

const loading =
    document.getElementById("loading");

const weatherContent =
    document.getElementById("weather-content");

const welcomeMessage =
    document.getElementById("welcome-message");


// Current weather elements

const cityName =
    document.getElementById("city-name");

const countryName =
    document.getElementById("country-name");

const currentIcon =
    document.getElementById("current-icon");

const currentTemperature =
    document.getElementById("current-temperature");

const weatherCondition =
    document.getElementById("weather-condition");

const feelsLike =
    document.getElementById("feels-like");

const windSpeed =
    document.getElementById("wind-speed");

const humidity =
    document.getElementById("humidity");

const cloudCover =
    document.getElementById("cloud-cover");

const localDate =
    document.getElementById("local-date");

const localTime =
    document.getElementById("local-time");

const forecastContainer =
    document.getElementById("forecast-container");


// ==========================================
// WEATHER CODE DATA
// ==========================================

const weatherCodes = {

    0: {
        description: "Clear sky",
        icon: "☀️"
    },

    1: {
        description: "Mainly clear",
        icon: "🌤️"
    },

    2: {
        description: "Partly cloudy",
        icon: "⛅"
    },

    3: {
        description: "Overcast",
        icon: "☁️"
    },

    45: {
        description: "Fog",
        icon: "🌫️"
    },

    48: {
        description: "Depositing rime fog",
        icon: "🌫️"
    },

    51: {
        description: "Light drizzle",
        icon: "🌦️"
    },

    53: {
        description: "Moderate drizzle",
        icon: "🌦️"
    },

    55: {
        description: "Dense drizzle",
        icon: "🌧️"
    },

    56: {
        description: "Light freezing drizzle",
        icon: "🌧️"
    },

    57: {
        description: "Dense freezing drizzle",
        icon: "🌧️"
    },

    61: {
        description: "Slight rain",
        icon: "🌦️"
    },

    63: {
        description: "Moderate rain",
        icon: "🌧️"
    },

    65: {
        description: "Heavy rain",
        icon: "🌧️"
    },

    66: {
        description: "Light freezing rain",
        icon: "🌧️"
    },

    67: {
        description: "Heavy freezing rain",
        icon: "🌧️"
    },

    71: {
        description: "Slight snowfall",
        icon: "🌨️"
    },

    73: {
        description: "Moderate snowfall",
        icon: "🌨️"
    },

    75: {
        description: "Heavy snowfall",
        icon: "❄️"
    },

    77: {
        description: "Snow grains",
        icon: "❄️"
    },

    80: {
        description: "Slight rain showers",
        icon: "🌦️"
    },

    81: {
        description: "Moderate rain showers",
        icon: "🌧️"
    },

    82: {
        description: "Violent rain showers",
        icon: "⛈️"
    },

    85: {
        description: "Slight snow showers",
        icon: "🌨️"
    },

    86: {
        description: "Heavy snow showers",
        icon: "❄️"
    },

    95: {
        description: "Thunderstorm",
        icon: "⛈️"
    },

    96: {
        description: "Thunderstorm with hail",
        icon: "⛈️"
    },

    99: {
        description: "Thunderstorm with heavy hail",
        icon: "⛈️"
    }

};


// ==========================================
// FORM SUBMISSION
// ==========================================

searchForm.addEventListener("submit", function (event) {

    event.preventDefault();

    const city = cityInput.value.trim();

    if (!city) {
        showError("Please enter a city name.");

        return;
    }

    getWeather(city);

});


// ==========================================
// GET WEATHER
// ==========================================

async function getWeather(city) {

    showLoading();

    clearError();

    try {

        // --------------------------------------
        // STEP 1: FIND CITY COORDINATES
        // --------------------------------------

        const location =
            await getCoordinates(city);


        // --------------------------------------
        // STEP 2: GET WEATHER
        // --------------------------------------

        const weather =
            await getWeatherData(
                location.latitude,
                location.longitude,
                location.timezone
            );


        // --------------------------------------
        // STEP 3: DISPLAY WEATHER
        // --------------------------------------

        displayWeather(location, weather);


        // Save city

        localStorage.setItem(
            "lastCity",
            location.name
        );


    } catch (error) {

        console.error(error);

        showError(
            error.message ||
            "Unable to get weather information."
        );

    } finally {

        hideLoading();

    }

}


// ==========================================
// GET COORDINATES
// ==========================================

async function getCoordinates(city) {

    const url =
        `${GEOCODING_API}?name=${encodeURIComponent(city)}` +
        `&count=1` +
        `&language=en` +
        `&format=json`;


    const response =
        await fetch(url);


    if (!response.ok) {
        throw new Error(
            "Unable to search for this city."
        );
    }


    const data =
        await response.json();


    if (
        !data.results ||
        data.results.length === 0
    ) {
        throw new Error(
            `City "${city}" was not found.`
        );
    }


    return data.results[0];

}


// ==========================================
// GET WEATHER DATA
// ==========================================

async function getWeatherData(
    latitude,
    longitude,
    timezone
) {

    const params = new URLSearchParams({

        latitude: latitude,

        longitude: longitude,

        timezone: timezone,

        forecast_days: "5",

        current: [
            "temperature_2m",
            "relative_humidity_2m",
            "apparent_temperature",
            "weather_code",
            "cloud_cover",
            "wind_speed_10m"
        ].join(","),

        daily: [
            "weather_code",
            "temperature_2m_max",
            "temperature_2m_min"
        ].join(",")

    });


    const url =
        `${WEATHER_API}?${params.toString()}`;


    const response =
        await fetch(url);


    if (!response.ok) {
        throw new Error(
            "Unable to retrieve weather data."
        );
    }


    return await response.json();

}


// ==========================================
// DISPLAY WEATHER
// ==========================================

function displayWeather(location, weather) {

    const current =
        weather.current;


    // --------------------------------------
    // LOCATION
    // --------------------------------------

    cityName.textContent =
        location.name;


    countryName.textContent =
        location.country ||
        location.country_code ||
        "";


    // --------------------------------------
    // CURRENT CONDITIONS
    // --------------------------------------

    const currentWeatherInfo =
        getWeatherInfo(
            current.weather_code
        );


    currentIcon.textContent =
        currentWeatherInfo.icon;


    currentTemperature.textContent =
        Math.round(current.temperature_2m);


    weatherCondition.textContent =
        currentWeatherInfo.description;


    feelsLike.textContent =
        `Feels like ${
            Math.round(
                current.apparent_temperature
            )
        }°C`;


    windSpeed.textContent =
        `${Math.round(
            current.wind_speed_10m
        )} km/h`;


    humidity.textContent =
        `${current.relative_humidity_2m}%`;


    cloudCover.textContent =
        `${current.cloud_cover}%`;


    // --------------------------------------
    // LOCAL TIME
    // --------------------------------------

    displayLocalTime(
        current.time,
        weather.timezone
    );


    // --------------------------------------
    // FORECAST
    // --------------------------------------

    displayForecast(
        weather.daily
    );


    // --------------------------------------
    // SHOW WEATHER
    // --------------------------------------

    weatherContent.classList.remove(
        "hidden"
    );

    welcomeMessage.classList.add(
        "hidden"
    );

}


// ==========================================
// DISPLAY LOCAL TIME
// ==========================================

function displayLocalTime(
    dateTime,
    timezone
) {

    const date =
        new Date(dateTime);


    const formattedDate =
        new Intl.DateTimeFormat(
            "en-US",
            {
                timeZone: timezone,
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric"
            }
        ).format(date);


    const formattedTime =
        new Intl.DateTimeFormat(
            "en-US",
            {
                timeZone: timezone,
                hour: "numeric",
                minute: "2-digit",
                hour12: true
            }
        ).format(date);


    localDate.textContent =
        formattedDate;


    localTime.textContent =
        formattedTime;

}


// ==========================================
// DISPLAY 5-DAY FORECAST
// ==========================================

function displayForecast(daily) {

    forecastContainer.innerHTML = "";


    for (
        let i = 0;
        i < daily.time.length;
        i++
    ) {

        const date =
            new Date(
                `${daily.time[i]}T12:00:00`
            );


        const day =
            date.toLocaleDateString(
                "en-US",
                {
                    weekday: "short"
                }
            );


        const formattedDate =
            date.toLocaleDateString(
                "en-US",
                {
                    month: "short",
                    day: "numeric"
                }
            );


        const weatherInfo =
            getWeatherInfo(
                daily.weather_code[i]
            );


        const maxTemperature =
            Math.round(
                daily.temperature_2m_max[i]
            );


        const minTemperature =
            Math.round(
                daily.temperature_2m_min[i]
            );


        const card =
            document.createElement("article");


        card.className =
            "forecast-card";


        card.innerHTML = `

            <div class="forecast-day">
                ${day}
            </div>

            <div class="forecast-date">
                ${formattedDate}
            </div>

            <div class="forecast-icon">
                ${weatherInfo.icon}
            </div>

            <div class="forecast-temperatures">

                <span class="max-temp">
                    ${maxTemperature}°C
                </span>

                <span class="min-temp">
                    ${minTemperature}°C
                </span>

            </div>

            <p class="forecast-condition">
                ${weatherInfo.description}
            </p>

        `;


        forecastContainer.appendChild(card);

    }

}


// ==========================================
// WEATHER CODE LOOKUP
// ==========================================

function getWeatherInfo(code) {

    return (
        weatherCodes[code] || {
            description: "Unknown",
            icon: "🌤️"
        }
    );

}


// ==========================================
// LOADING
// ==========================================

function showLoading() {

    loading.classList.remove(
        "hidden"
    );

    weatherContent.classList.add(
        "hidden"
    );

    welcomeMessage.classList.add(
        "hidden"
    );

    searchButton.disabled = true;

    searchButton.textContent =
        "Searching...";

}


function hideLoading() {

    loading.classList.add(
        "hidden"
    );

    searchButton.disabled = false;

    searchButton.textContent =
        "Search";

}


// ==========================================
// ERROR HANDLING
// ==========================================

function showError(message) {

    errorMessage.textContent =
        message;

}


function clearError() {

    errorMessage.textContent =
        "";

}


// ==========================================
// LOAD LAST SEARCHED CITY
// ==========================================

window.addEventListener(
    "DOMContentLoaded",
    function () {

        const lastCity =
            localStorage.getItem(
                "lastCity"
            );


        if (lastCity) {

            cityInput.value =
                lastCity;

            getWeather(lastCity);

        }

    }
);
