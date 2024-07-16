var map = L.map('map').setView([65.0, 26.0], 6);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

var positiveMigrationData, negativeMigrationData;

fetch('https://statfin.stat.fi/PxWeb/sq/4bb2c735-1dc3-4c5e-bde7-2165df85e65f')
    .then(response => response.json())
    .then(data => {
        positiveMigrationData = data.dataset.value;
        return fetch('https://statfin.stat.fi/PxWeb/sq/944493ca-ea4d-4fd9-a75c-4975192f7b6e');
    })
    .then(response => response.json())
    .then(data => {
        negativeMigrationData = data.dataset.value;
        return fetch('https://geo.stat.fi/geoserver/wfs?service=WFS&version=2.0.0&request=GetFeature&typeName=tilastointialueet:kunta4500k&outputFormat=json&srsName=EPSG:4326');
    })
    .then(response => response.json())
    .then(data => {
        var geojsonLayer = L.geoJson(data, {
            style: function (feature) {
                var positiveMigration = positiveMigrationData[feature.properties.kunta];
                var negativeMigration = negativeMigrationData[feature.properties.kunta];
                var hue = Math.min((positiveMigration / negativeMigration) * 60, 120);
                return {
                    color: `hsl(${hue}, 75%, 50%)`,
                    weight: 2
                };
            },
            onEachFeature: function (feature, layer) {
                layer.bindTooltip(feature.properties.name);
                layer.on('click', function () {
                    var positiveMigration = positiveMigrationData[feature.properties.kunta];
                    var negativeMigration = negativeMigrationData[feature.properties.kunta];
                    var popupContent = `
                        <b>${feature.properties.name}</b><br>
                        Positive Migration: ${positiveMigration}<br>
                        Negative Migration: ${negativeMigration}
                    `;
                    layer.bindPopup(popupContent).openPopup();
                });
            }
        }).addTo(map);

        map.fitBounds(geojsonLayer.getBounds());
    })
    .catch(error => console.error('Error fetching data:', error));
