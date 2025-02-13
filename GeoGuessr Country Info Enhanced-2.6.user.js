// ==UserScript==
// @name         GeoGuessr Country Info Enhanced 3.3
// @namespace    https://github.com/6tab
// @version      3.3
// @description  Displays country and region info with sound effects, enhanced visuals, and shortcuts. By 6tab.
// @author       6tab
// @match        https://www.geoguessr.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=geoguessr.com
// @grant        GM_webRequest
// @license      https://github.com/6tab/Geoguessr-Training-Tool/blob/main/LICENSE
// ==/UserScript==

let globalCoordinates = { lat: 0, lng: 0 };
let countryWindow = null;
let lastCountry = null;
let lastCheckedCoordinates = { lat: null, lng: null };
// Sound effects
const sounds = {
    newLocation: new Audio(''),
    newCountry: new Audio('https://www.myinstants.com/media/sounds/coin-collect-retro.mp3')
};

// Periodic function to fetch country info
setInterval(() => {
    if (
        globalCoordinates.lat !== lastCheckedCoordinates.lat ||
        globalCoordinates.lng !== lastCheckedCoordinates.lng
    ) {
        lastCheckedCoordinates.lat = globalCoordinates.lat;
        lastCheckedCoordinates.lng = globalCoordinates.lng;

        // Only query if coordinates are valid
        if (globalCoordinates.lat !== 0 && globalCoordinates.lng !== 0) {
            getCountryInfo(globalCoordinates.lat, globalCoordinates.lng);
        }
    }
}, 5000); // 5-second interval


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

// Function to get Plonkit URL for a country
function getPlonkitUrl(country) {
    const formattedCountry = country.toLowerCase().replace(/\s+/g, '-');
    return `https://www.plonkit.net/${formattedCountry}`;
}

// Function to get region map URL
function getRegionMapUrl(countryCode) {
    const regionMapUrls = {
        "CA": "https://commons.wikimedia.org/wiki/File:Canada_political_map_-_fr.svg",
        "US": "https://commons.wikimedia.org/wiki/File:Map_of_USA_with_state_names.svg",
        "MX": "https://commons.wikimedia.org/wiki/File:Map_of_Mexico_(location_map_scheme).svg",
        "GT": "https://commons.wikimedia.org/wiki/File:Regiones_precolombinas_en_Guatemala.png",
        "PA": "https://commons.wikimedia.org/wiki/File:Panama_Base_Map.png",
        "CO": "https://commons.wikimedia.org/wiki/File:Colombia_Mapa_Oficial.svg",
        "EC": "https://commons.wikimedia.org/wiki/File:Ecuador_Base_Map.png",
        "PE": "https://commons.wikimedia.org/wiki/File:Peru_Base_Map.png",
        "BO": "https://commons.wikimedia.org/wiki/File:ECHO_Bolivia_Basemap_Editable_A4_Landscape.png",
        "CL": "https://upload.wikimedia.org/wikipedia/commons/4/40/Chile_%28%2BAntarctica_%26_Islands%29%2C_administrative_divisions_-_en_-_colored_2018.svg",
        "AR": "https://commons.wikimedia.org/wiki/File:Map_of_Argentina_with_provinces_names_en.png",
        "PY": "https://commons.wikimedia.org/wiki/File:Paraguay_Base_Map.png",
        "UY": "https://commons.wikimedia.org/wiki/File:Uruguay_Base_Map.png",
        "BR": "https://commons.wikimedia.org/wiki/File:Brazil_Provinces_1889.svg",
        "GL": "https://commons.wikimedia.org/wiki/File:Greenland_regions.png",
        "IS": "https://commons.wikimedia.org/wiki/File:Iceland_Regions_map.svg",
        "FO": "https://commons.wikimedia.org/wiki/File:Faroe_islands_map_with_island_names.png",
        "NO": "https://commons.wikimedia.org/wiki/File:Norway_regions_map.png",
        "FI": "https://commons.wikimedia.org/wiki/File:Regions_of_Finland_labelled_SV.svg",
        "SE": "https://commons.wikimedia.org/wiki/File:Sweden,administrative_divisions-_en.svg",
        "DK": "https://commons.wikimedia.org/wiki/File:Denmark,_administrative_divisions_-_en.svg",
        "DE": "https://commons.wikimedia.org/wiki/File:Germany,_administrative_divisions_-_en.svg",
        "NL": "https://commons.wikimedia.org/wiki/File:Netherlands,_administrative_divisions_-_en.svg",
        "BE": "https://commons.wikimedia.org/wiki/File:Belgium,_administrative_divisions_-_en.svg",
        "LU": "https://commons.wikimedia.org/wiki/File:Luxembourg,_administrative_divisions_-_en.svg",
        "FR": "https://commons.wikimedia.org/wiki/File:France,_administrative_divisions_-_en.svg",
        "IT": "https://commons.wikimedia.org/wiki/File:Italy,_administrative_divisions-en-_colored.svg",
        "AT": "https://commons.wikimedia.org/wiki/File:Austria,_administrative_divisions_-_en.svg",
        "CH": "https://commons.wikimedia.org/wiki/File:Switzerland_regions_map_new.png",
        "ES": "https://commons.wikimedia.org/wiki/File:Autonomous_communities_of_Spain.svg",
        "PT": "https://en.wikipedia.org/wiki/Subdivisions_of_Portugal#/media/File:NUTS_PT_2024.png",
        "SI": "https://commons.wikimedia.org/wiki/File:Statistical-regions-of-Slovenia_English.PNG",
        "HU": "https://commons.wikimedia.org/wiki/File:RegionsHungary.png",
        "SK": "https://commons.wikimedia.org/wiki/File:Base_Map_of_Slovakia.png",
        "PL": "https://commons.wikimedia.org/wiki/File:Poland_Base_Map.png",
        "CZ": "https://commons.wikimedia.org/wiki/File:Czech_Republic,administrative_divisions-en-_colored.svg",
        "BA": "https://commons.wikimedia.org/wiki/File:Bosnia_and_Herzegovina,administrative_divisions-en(entities)_-_colored.svg",
        "RS": "https://commons.wikimedia.org/wiki/File:Base_map_of_Serbia.png",
        "ME": "https://commons.wikimedia.org/wiki/File:ECHO_Montenegro_Editable_A4_Landscape.png",
        "AL": "https://commons.wikimedia.org/wiki/File:ECHO_Albania_Editable_A4_Portrait_2019.png",
        "MK": "https://commons.wikimedia.org/wiki/File:North_Macedonia_Base_Map.png",
        "BG": "https://commons.wikimedia.org/wiki/File:ECHO_Bulgaria_Editable_A4_Landscape_2019.png",
        "GR": "https://commons.wikimedia.org/wiki/File:ECHO_Greece_Editable_A4_Landscape_2019.png",
        "TR": "https://e7.pngegg.com/pngimages/725/239/png-clipart-eastern-anatolia-region-marmara-region-provinces-of-turkey-black-sea-region-andalucia-text-world.png",
        "EG": "https://upload.wikimedia.org/wikipedia/commons/3/39/Egypt_Base_Map.png",
        "TN": "https://upload.wikimedia.org/wikipedia/commons/b/b7/Tunisia_Base_Map.png",
        "SN": "https://upload.wikimedia.org/wikipedia/commons/b/be/ECHO_Senegal_Basemap_Editable_A4_Landscape.png",
        "GH": "https://upload.wikimedia.org/wikipedia/commons/b/bd/Ghana_Base_Map.png",
        "ST": "https://www.worldatlas.com/upload/37/5f/bb/shutterstock-146218826.jpg",
        "NG": "https://upload.wikimedia.org/wikipedia/commons/1/19/Nigeria_Base_Map.png",
        "KE": "https://upload.wikimedia.org/wikipedia/commons/3/32/Horn_of_Africa_Base_Map.png",
        "UG": "https://upload.wikimedia.org/wikipedia/commons/2/24/Tanzania_Base_Map.png",
        "TZ": "https://upload.wikimedia.org/wikipedia/commons/2/24/Rwanda_Base_Map.png",
        "BW": "https://upload.wikimedia.org/wikipedia/commons/8/8c/ECHO_Botswana_Editable_A4_Landscape.png",
        "LS": "https://upload.wikimedia.org/wikipedia/commons/f/fd/Lesotho_Base_Map.png",
        "SZ": "https://commons.wikimedia.org/wiki/File:Swaziland_Base_Map.png",
        "ZA": "https://commons.wikimedia.org/wiki/File:Base_Map_of_South_Africa.png",
        "MG": "https://commons.wikimedia.org/wiki/File:Madagascar_Base_Map.png",
        "OM": "https://commons.wikimedia.org/wiki/File:Oman_Base_Map.png",
        "JP": "https://upload.wikimedia.org/wikipedia/commons/b/bc/Regions_and_Prefectures_of_Japan_2.svg",
        "TW": "https://upload.wikimedia.org/wikipedia/commons/1/14/Taiwan_Regions_Map.svg",
        "HK": "https://upload.wikimedia.org/wikipedia/commons/4/4f/Hong_Kong_districts_map.svg",
        "MO": "https://upload.wikimedia.org/wikipedia/commons/7/70/Macau_district_map.jpg",
        "SG": "https://commons.wikimedia.org/wiki/File:Singapore_Map_with_Regions_Labelled.png",
        "MY": "https://commons.wikimedia.org/wiki/File:Malaysia_regions_map.png",
        "IN": "https://upload.wikimedia.org/wikipedia/commons/4/46/India_Base_Map.png",
        "BD": "https://upload.wikimedia.org/wikipedia/commons/6/62/English_Wikivoyage_Bangladesh_regions_map.svg"
    };

    return regionMapUrls[countryCode] || `https://commons.wikimedia.org/wiki/File:${countryCode}_Regions_map.svg`;
}


// Define the delay function
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function getCountryInfo(lat, lng) {
    // Add a delay before making the Nominatim request
    await delay(350); // Adjust the delay as needed (1000 ms = 1 second)

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
            // If geocoding fails, display coordinates
            displayCoordinates(lat, lng);
        }
    } catch (error) {
        // If an error occurs, display coordinates
        console.error('Error fetching country info:', error);
        displayCoordinates(lat, lng);
    }
}


// Function to display coordinates window
function displayCoordinates(lat, lng) {
    // Open the coordinates window immediately
    let coordinatesWindow = window.open('', 'Coordinates', 'width=400,height=700,resizable=yes,scrollbars=yes');
    if (!coordinatesWindow || coordinatesWindow.closed) {
        coordinatesWindow = window.open('', 'Coordinates', 'width=400,height=700,resizable=yes,scrollbars=yes');
    }

    // Write basic content to the window (showing lat, lng immediately)
    coordinatesWindow.document.write(`
        <html>
        <head>
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
                .buttons {
                    display: flex;
                    gap: 15px;
                    justify-content: center;
                    margin-top: 20px;
                    flex-wrap: wrap;
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
                    width: auto;
                    min-width: 150px;
                    text-align: center;
                }
                button:hover {
                    background: #9f5ce3;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 8px rgba(0,0,0,0.3);
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Geocoding Error</h1>
                <div class="coordinates">📍 ${lat}, ${lng}</div>
            </div>
            <div class="content">
                <div class="buttons">
                    <button id="googleMapsButton">Open in Google Maps</button>
                    <button id="copyButton">Copy Coordinates</button>
                </div>
            </div>
            <script>
                // Google Maps Button Click Event
                document.getElementById('googleMapsButton').addEventListener('click', function() {
                    window.open('https://www.google.com/maps/place/${lat},${lng}', '_blank');
                });

                // Copy Coordinates Button Click Event
                document.getElementById('copyButton').addEventListener('click', function() {
                    copyCoordinates('${lat}', '${lng}');
                });

                // Function to copy coordinates to clipboard
                function copyCoordinates(lat, lng) {
                    const coords = lat + ' ' + lng;
                    navigator.clipboard.writeText(coords)
                        .then(() => {
                            alert('Coordinates copied to clipboard!');
                        })
                        .catch(err => {
                            console.error('Error copying coordinates: ', err);
                        });
                }
            </script>
        </body>
        </html>
    `);

    // Now make the geocoding request in parallel
    fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`)
        .then(response => response.json())
        .then(data => {
            // Update the window with the more detailed information if available
            const location = data.display_name || 'Location details not available';
            coordinatesWindow.document.querySelector('.coordinates').innerHTML = '📍 ' + location;
        })
        .catch(error => {
            console.error('Geocoding failed: ', error);
            // If the geocoding fails, the coordinates window still shows the original coordinates
        });

    // Close the document to allow the window to render properly
    coordinatesWindow.document.close();
}








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
    const plonkitUrl = getPlonkitUrl(country);
    const regionMapUrl = getRegionMapUrl(countryCode);

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
                flex-wrap: wrap;
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

            #regionMap {
                display: none;
                margin-top: 20px;
                width: 100%;
                border-radius: 8px;
                overflow: hidden;
            }

            #regionMap.visible {
                display: block;
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
                <button onclick="window.open('${plonkitUrl}', '_blank')">🌍 Plonkit</button>
                <button onclick="window.open('${regionMapUrl}', '_blank')">🗺️ Region Map</button>
            </div>
        </div>

        <div class="shortcuts">
            Keyboard Shortcuts:<br>
            Ctrl+I: Toggle Window | Ctrl+M: Maps | Ctrl+P: Plonkit | Ctrl+R: Region Map
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
