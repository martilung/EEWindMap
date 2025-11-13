//
// --- STEP 1: Initialize the Map ---
//
const map = L.map('map').setView([58.6, 25.0], 7); // Centered on Estonia

// Add the visual map tiles (OpenStreetMap)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

//
// --- STEP 2: Helper Functions for Styling ---
//
function getWindColorClass(speed) {
    if (speed < 5) return 'wind-light';     // < 5 m/s
    if (speed < 10) return 'wind-medium';   // 5-10 m/s
    if (speed < 15) return 'wind-strong';   // 10-15 m/s
    return 'wind-severe';                  // 15+ m/s
}

//
// --- STEP 3: Main Function to Fetch and Draw Data ---
//
async function loadWindData() {
    try {
        // Fetch data from our backend API
        // *** THIS URL HAS BEEN CORRECTED (https://) ***
        const response = await fetch('https://garmin-wind-api.vercel.app/api/all-stations');

        if (!response.ok) {
            throw new Error(`API Error: ${response.statusText}`);
        }

        const stations = await response.json();

        // Loop through every station
        for (const station of stations) {

            // --- 3A: Create the Custom Icon ---
            const iconClass = getWindColorClass(station.wind_speed);

            const windIcon = L.divIcon({
                className: `wind-icon ${iconClass}`,
                // This fix (from before) is crucial
                iconSize: [24, 35],
                iconAnchor: [12, 17.5]
            });

            // --- 3B: Create the Marker ---

            // --- THIS IS THE 180° FIX ---
            // A 270° (West) wind *comes from* the West and *blows toward* the East (90°).
            // (270 + 180) % 360 = 450 % 360 = 90. This is the correct vector.
            const rotation = (station.wind_direction + 180) % 360;

            const marker = L.marker(
                [station.latitude, station.longitude],
                {
                    icon: windIcon,
                    rotationAngle: rotation // Use the corrected rotation
                }
            ).addTo(map);

            // --- 3C: Add the Data Point (Popup) ---

            // Build the popup content dynamically
            let popupContent = `
                <b>${station.name}</b><br>
                Wind: ${station.wind_speed} m/s<br>
            `;

            // Only add the gust line if wind_gust is not null and greater than 0
            if (station.wind_gust) {
                popupContent += `Gust: ${station.wind_gust} m/s<br>`;
            }

            popupContent += `
                Direction: ${station.wind_direction}°<br>
                Time: ${station.observation_time}
            `;

            marker.bindPopup(popupContent);
        }

    } catch (error) {
        console.error("Failed to load wind data:", error);
        alert("Could not load wind data. See console for details.");
    }
}

//
// --- STEP 4: Run the function when the page loads ---
//
loadWindData();