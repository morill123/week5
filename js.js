var map = L.map('map').setView([65.0, 26.0], 5);
map.options.minZoom = -3;

// Add OpenStreetMap background layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Fetch and display GeoJSON data
fetch('https://geo.stat.fi/geoserver/wfs?service=WFS&version=2.0.0&request=GetFeature&typeName=tilastointialueet:kunta4500k&outputFormat=json&srsName=EPSG:4326')
    .then(response => response.json())
    .then(data => {
        var geojsonLayer = L.geoJSON(data, {
            style: {
                weight: 2
            },
            onEachFeature: onEachFeature
        }).addTo(map);

        map.fitBounds(geojsonLayer.getBounds());
    });

// Fetch migration data
let positiveMigration = {};
let negativeMigration = {};

fetch('https://statfin.stat.fi/PxWeb/sq/4bb2c735-1dc3-4c5e-bde7-2165df85e65f')
    .then(response => response.json())
    .then(data => {
        data.dataset.dimension.Alue.category.label.forEach((name, key) => {
            positiveMigration[name] = data.dataset.value[key];
        });
    });

fetch('https://statfin.stat.fi/PxWeb/sq/944493ca-ea4d-4fd9-a75c-4975192f7b6e')
    .then(response => response.json())
    .then(data => {
        data.dataset.dimension.Alue.category.label.forEach((name, key) => {
            negativeMigration[name] = data.dataset.value[key];
        });
    });

function onEachFeature(feature, layer) {
    // Add tooltip
    layer.bindTooltip(feature.properties.name);

    // Add popup with migration data
    layer.on('click', function() {
        let positive = positiveMigration[feature.properties.name] || 0;
        let negative = negativeMigration[feature.properties.name] || 0;
        layer.bindPopup(`<strong>${feature.properties.name}</strong><br>Positive Migration: ${positive}<br>Negative Migration: ${negative}`).openPopup();
    });

    // Set style based on migration data
    layer.setStyle({
        color: getColor(feature.properties.name)
    });
}

function getColor(name) {
    let positive = positiveMigration[name] || 0;
    let negative = negativeMigration[name] || 0;
    let hue = Math.min((positive / negative) * 60, 120);
    return `hsl(${hue}, 75%, 50%)`;
}