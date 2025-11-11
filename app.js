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
        // ***IMPORTANT: Update this URL to your API endpoint***
        const response = await fetch('/api/all-stations');
        
        if (!response.ok) {
            throw new Error(`API Error: ${response.statusText}`);
        }
        
        const stations = await response.json();

        // Loop through every station
        for (const station of stations) {
            
            // --- 3A: Create the Custom Icon ---
            const iconClass = getWindColorClass(station.wind_speed);
            
            const windIcon = L.divIcon({
                className: `wind-icon ${iconClass}`, // e.g., "wind-icon wind-medium"
                iconSize: [20, 30],
                iconAnchor: [10, 15] // Center of the icon
            });
            
            // --- 3B: Create the Marker ---
            const marker = L.marker(
                [station.latitude, station.longitude], 
                {
                    icon: windIcon,
                    // This is the magic: rotate the icon by the wind direction
                    // Leaflet's 'rotationAngle' rotates clockwise from North (0 deg).
                    // This matches our 'wind_direction' data perfectly.
                    rotationAngle: station.wind_direction 
                }
            ).addTo(map);

            // --- 3C: Add the Data Point (Popup) ---
            marker.bindPopup(`
                <b>${station.name}</b><br>
                Wind: ${station.wind_speed} m/s<br>
                Direction: ${station.wind_direction}°<br>
                Time: ${station.observation_time}
            `);
        }

    } catch (error) {
        console.error("Failed to load wind data:", error);
        alert("Could not load wind data. See console for details.");
    }
}

//
// --- STEP 4: Run the function when the page loads ---
//
// Note: We need a Leaflet plugin for rotation.
// But wait, the standard L.marker doesn't support rotation...