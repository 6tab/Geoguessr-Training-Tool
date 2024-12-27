// ==UserScript==
// @name         GeoGuessr Country Info Enhanced
// @namespace    http://tampermonkey.net/
// @version      2.6
// @description  Displays country and region info with sound effects, enhanced visuals, and shortcuts. By 6tab.
// @author       6tab
// @match        https://www.geoguessr.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=geoguessr.com
// @grant        GM_webRequest
// @license      MIT
// ==/UserScript==

let globalCoordinates = { lat: 0, lng: 0 };
let countryWindow = null;
let lastCountry = null;

// Sound effects
const sounds = {
    newLocation: new Audio('linkhere'),
    newCountry: new Audio('linkhere')
};

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.key === 'i' && e.ctrlKey) {
        if (countryWindow && !countryWindow.closed) {
            countryWindow.close();
        } else if (globalCoordinates.lat !== 0 || globalCoordinates.lng !== 0) {
            getCountryInfo(globalCoordinates.lat, globalCoordinates.lng);
        }
    }
    if (e.key === 'm' && e.ctrlKey) {
        const mapUrl = `https://maps.google.com/?q=${globalCoordinates.lat},${globalCoordinates.lng}&ll=${globalCoordinates.lat},${globalCoordinates.lng}&z=5`;
        window.open(mapUrl, '_blank');
    }
});

// Your existing getCountryInfo function
async function getCountryInfo(lat, lng) {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data && data.address && data.address.country) {
            const country = data.address.country;
            const countryCode = data.address.country_code.toUpperCase();
            const city = data.address.city || 'Unknown City';
            const region = data.address.state || data.address.region || 'Unknown Region';
            const area = data.address.subregion || 'Unknown Region';

            console.log(`Location: ${lat}, ${lng} - Country: ${country}, City: ${city}, Region: ${region}`);

            const countryInfo = await getCountryInfoFromREST(countryCode);
            console.log(countryInfo);

            updateCountryWindow(country, countryCode, countryInfo, city, region, area);
        } else {
            console.error('Country not found in Nominatim response.');
        }
    } catch (error) {
        console.error('Error fetching country info:', error);
    }
}

// Your existing getCountryInfoFromREST function
async function getCountryInfoFromREST(countryCode) {
    const url = `https://restcountries.com/v3.1/alpha/${countryCode}`;
    try {
        const response = await fetch(url);
        const data = await response.json();

        const countryData = data[0];
        const tld = countryData.tld ? countryData.tld[0] : 'Unknown TLD';
        const drivesOn = countryData.car && countryData.car.side ? (countryData.car.side === 'left' ? 'Left' : 'Right') : 'Unknown';
        const languages = Object.values(countryData.languages || {});
        const currency = countryData.currencies ? Object.values(countryData.currencies)[0].name : 'Unknown';
        const phonePrefix = countryData.idd && countryData.idd.root && countryData.idd.suffixes
            ? countryData.idd.root + countryData.idd.suffixes[0]
            : 'Unknown';

        return { tld, drivesOn, languages, currency, phonePrefix };
    } catch (error) {
        console.error('Error fetching country info from REST Countries API:', error);
        return {
            tld: 'Unknown TLD',
            drivesOn: 'Unknown',
            languages: ['Unknown'],
            currency: 'Unknown',
            phonePrefix: 'Unknown'
        };
    }
}

function updateCountryWindow(country, countryCode, countryInfo, city, region) {
    const mapUrl = `https://maps.google.com/?q=${globalCoordinates.lat},${globalCoordinates.lng}&ll=${globalCoordinates.lat},${globalCoordinates.lng}&z=5`;

    // Play sound if it's a new country
    if (lastCountry !== country) {
        sounds.newCountry.play();
        lastCountry = country;
    } else {
        sounds.newLocation.play();
    }

    if (!countryWindow || countryWindow.closed) {
        countryWindow = window.open('', 'CountryInfo', 'width=400,height=700,resizable=yes,scrollbars=yes');
    }

    countryWindow.document.body.innerHTML = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap');

            body {
                font-family: 'Poppins', sans-serif;
                background-color: #3b186a;
                color: white;
                padding: 20px;
                margin: 0;
            }

            .header {
                text-align: center;
                margin-bottom: 20px;
            }

            h1 {
                color: #b36dff;
                font-size: 24px;
                margin: 0 0 5px 0;
            }

            .coordinates {
                color: #8a6ba1;
                font-size: 14px;
                margin-bottom: 15px;
            }

            .content {
                background: #4a217d;
                border-radius: 15px;
                padding: 20px;
                margin: 10px 0;
                box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                border: 2px solid #b36dff;
            }

            .info-row {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 8px 0;
                border-bottom: 1px solid #5c2e8f;
            }

            .info-row:last-child {
                border-bottom: none;
            }

            .label {
                color: #b36dff;
                font-weight: 600;
            }

            .value {
                color: #ffffff;
            }

            .flag-container {
                text-align: center;
                margin: 20px 0;
            }

            img {
                width: 120px;
                border-radius: 8px;
                box-shadow: 0 4px 10px rgba(0,0,0,0.3);
                transition: transform 0.3s ease;
                cursor: pointer;
            }

            img:hover {
                transform: scale(1.05);
            }

            .buttons {
                display: flex;
                gap: 10px;
                justify-content: center;
                margin-top: 20px;
            }

            button {
                padding: 10px 20px;
                background: #b36dff;
                color: white;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-family: 'Poppins', sans-serif;
                font-size: 14px;
                transition: all 0.3s ease;
                box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            }

            button:hover {
                background: #9f5ce3;
                transform: translateY(-2px);
                box-shadow: 0 4px 8px rgba(0,0,0,0.3);
            }

            .shortcuts {
                text-align: center;
                margin-top: 20px;
                font-size: 12px;
                color: #8a6ba1;
            }
        </style>

        <div class="header">
            <h1>${country}</h1>
            <div class="coordinates">📍 ${globalCoordinates.lat.toFixed(4)}, ${globalCoordinates.lng.toFixed(4)}</div>
        </div>

        <div class="content">
            <div class="info-row">
                <span class="label">🏙️ City</span>
                <span class="value">${city}</span>
            </div>
            <div class="info-row">
                <span class="label">🗺️ Region</span>
                <span class="value">${region}</span>
            </div>
            <div class="info-row">
                <span class="label">🌐 TLD</span>
                <span class="value">${countryInfo.tld}</span>
            </div>
            <div class="info-row">
                <span class="label">🚗 Driving Side</span>
                <span class="value">${countryInfo.drivesOn}</span>
            </div>
            <div class="info-row">
                <span class="label">🗣️ Languages</span>
                <span class="value">${countryInfo.languages.join(', ')}</span>
            </div>
            <div class="info-row">
                <span class="label">💰 Currency</span>
                <span class="value">${countryInfo.currency}</span>
            </div>
            <div class="info-row">
                <span class="label">📞 Phone</span>
                <span class="value">${countryInfo.phonePrefix}</span>
            </div>

            <div class="flag-container">
                <img src="https://flagcdn.com/w320/${countryCode.toLowerCase()}.png"
                     alt="Flag of ${country}"
                     onclick="window.open(this.src, '_blank')"
                     title="Click to view larger flag">
            </div>

            <div class="buttons">
                <button onclick="window.open('${mapUrl}', '_blank')">🗺️ Google Maps</button>
                <button onclick="window.open('https://en.wikipedia.org/wiki/${encodeURIComponent(country)}', '_blank')">📚 Wikipedia</button>
            </div>
        </div>

        <div class="shortcuts">
            Keyboard Shortcuts:<br>
            Ctrl+I: Toggle Window | Ctrl+M: Maps | Ctrl+W: Wikipedia
        </div>
    `;
}

// Your existing XMLHttpRequest intercept
var originalOpen = XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open = function(method, url) {
    if (method.toUpperCase() === 'POST' &&
        (url.startsWith('https://maps.googleapis.com/$rpc/google.internal.maps.mapsjs.v1.MapsJsInternalService/GetMetadata') ||
         url.startsWith('https://maps.googleapis.com/$rpc/google.internal.maps.mapsjs.v1.MapsJsInternalService/SingleImageSearch'))) {

        this.addEventListener('load', function () {
            let interceptedResult = this.responseText;
            const pattern = /-?\d+\.\d+,-?\d+\.\d+/g;
            let match = interceptedResult.match(pattern)[0];
            let split = match.split(",");

            globalCoordinates.lat = Number.parseFloat(split[0]);
            globalCoordinates.lng = Number.parseFloat(split[1]);

            getCountryInfo(globalCoordinates.lat, globalCoordinates.lng);
        });
    }
    return originalOpen.apply(this, arguments);
};
