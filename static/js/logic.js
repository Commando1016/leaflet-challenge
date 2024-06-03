// Define the URLs for the GeoJSON earthquake data
const URLS = {
    1: "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson",
    2: "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_month.geojson",
    3: "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson"
};

// Function to choose the URL based on input number
function chooseUrl(number) {
    return URLS[number] || "Invalid input. Please choose a number between 1 and 3.";
}

// Example usage
const userInput = 1; // You can change this to test different URLs
const url = chooseUrl(userInput);
console.log(url); // This will output the selected URL based on the input

// Define a dictionary of country/state codes and their corresponding coordinates
const locationCoordinates = {
    "CN": [31.2304, 121.4737], // Shanghai, China
    "US": [36.7783, -119.4179], // California, USA
    "JP": [35.6895, 139.6917] // Tokyo, Japan
    // Add more countries and their coordinates as needed
};

// Function to get coordinates by country/state code
function getCoordinates(code) {
    return locationCoordinates[code] || "Country/State code not found.";
}

// Example usage
const countryCode = "US"; // You can change this to test different country codes
const coordinates = getCoordinates(countryCode);
console.log(coordinates); // This will output the coordinates for the specified country/state code

// Create the map
const myMap = L.map("map", {
    center: coordinates,
    zoom: 4
});

// Add a tile layer to the map
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(myMap);

// Function to style the map based on earthquake data
function mapStyle(feature) {
    return {
        opacity: 1,
        fillOpacity: 1,
        fillColor: mapColor(feature.geometry.coordinates[2]), // Assign color based on depth
        color: "black", // Changed stroke color to black for better visibility
        radius: mapRadius(feature.properties.mag), // Set radius based on magnitude
        stroke: true,
        weight: 0.5
    };
}

// Function to determine the fill color based on earthquake depth
function mapColor(depth) {
    if (depth > 90) return "firebrick";
    if (depth > 80) return "red";
    if (depth > 70) return "orangered";
    if (depth > 60) return "darkorange";
    if (depth > 50) return "orange";
    if (depth > 40) return "gold";
    if (depth > 30) return "yellow";
    if (depth > 20) return "lightgreen";
    if (depth > 10) return "palegreen";
    return "greenyellow";
}

// Function to determine the radius of circle markers based on earthquake magnitude
function mapRadius(mag) {
    return mag === 0 ? 1 : mag * 4;
}

// Retrieve and add the earthquake data to the map
d3.json(url).then(function (data) {
    // Add earthquake data to the map as circle markers
    L.geoJson(data, {
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng);
        },
        style: mapStyle,
        // Activate pop-up data when circles are clicked
        onEachFeature: function (feature, layer) {
            layer.bindPopup(`Magnitude: ${feature.properties.mag}<br>Location: ${feature.properties.place}<br>Depth: ${feature.geometry.coordinates[2]}`);
        }
    }).addTo(myMap);

    // Function to create the legend
    function createLegend() {
        var legend = L.control({ position: "bottomright" });

        // Function to add legend content
        legend.onAdd = function () {
            var div = L.DomUtil.create("div", "info legend"),
                depth = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90];


            // Add legend entries
            for (var i = 0; i < depth.length; i++) {
                div.innerHTML += `<i style="background:${mapColor(depth[i] + 1)}"></i> ${depth[i]}${depth[i + 1] ? '&ndash;' + depth[i + 1] + '<br>' : '+'}`;
            }
            return div;
        };

        return legend;
    }

    // Add the legend to the map
    var legend = createLegend();
    legend.addTo(myMap);
});
