// URL for tectonic plates data
urlPlates = 'https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json';
// URL for M2.5+ earthquake data from the last 30 days
url = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_month.geojson';

// Function to create the map
function createMap(earthquakes) {
    // Tile layer for background of the map
    var street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });
    // Other background maps
    var topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    });

    var grayscale = L.tileLayer.grayscale('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    })

    // Base maps
    let baseMaps = {
        'Street Map': street, 
        'Topography Map': topo,
        'Grayscale': grayscale
    };

    // Empty Tectonic Plates layer
    var tecPlates = new L.layerGroup();

    // Earthquake and Tectonic Plates overlays
    let overlayMaps = {
        'Earthquakes': earthquakes,
        'Tectonic Plates': tecPlates
    };

    // Creating map and attaching it to 'map' div in index.html
    var map = L.map('map', {
        center: [39.8283, -98.5795],
        zoom: 5, 
        layers: [street, earthquakes, tecPlates]
    });

    // Adding layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(map);

    //TECTONIC PLATES DATA
    // Adding tectonic plates layer
    d3.json(urlPlates).then(data => {
        // Turning tectonic plates data into a geoJSON array
        L.geoJSON(data, {
            style: function() {
                return {color: '#d9381e', weight: 2}
            }
        }).addTo(tecPlates);
    });

    // LEGEND
    // Positioning the legend on the bottom right
    var legend = L.control({position: 'bottomright'});

    // Possible color options
    var colorList = ['#00ff00', '#99ff00', '#ffcc00', '#ff9900', '#ff3300', '#ff0000'];

    legend.onAdd = function(map) {
        // Creating a new div in index.html with the 'legend'
        var div = L.DomUtil.create('div', 'legend');
        div.innerHTML += '<strong style="text-align: center">Depth (km)</strong><br>';
        div.innerHTML += '<i style="background: ' + colorList[0] + '"></i><span>-10-10</span><br>';
        div.innerHTML += '<i style="background: ' + colorList[1] + '"></i><span>10-30</span><br>';
        div.innerHTML += '<i style="background: ' + colorList[2] + '"></i><span>30-50</span><br>';
        div.innerHTML += '<i style="background: ' + colorList[3] + '"></i><span>50-70</span><br>';
        div.innerHTML += '<i style="background: ' + colorList[4] + '"></i><span>70-90</span><br>';
        div.innerHTML += '<i style="background: ' + colorList[5] + '"></i><span>90+</span>';

        return div;
    }
    
    // Adding the legend to the map
    legend.addTo(map);
}

// Function to create markers 
function createMarkers(response) {
    // EARTHQUAKE DATA
    // Pulling all features from the d3 response
    var earthquakes = response.features;

    // Empty array to hold earthquake markers
    var earthquakeMarkers = [];

    // Possible color options
    var colors = ['#00ff00', '#99ff00', '#ffcc00', '#ff9900', '#ff3300', '#ff0000'];

    // Looping through earthquakes array
    for (i=0; i<earthquakes.length; i++) {
        // Conditionals for marker color based on its depth
        var color = '';
        if (earthquakes[i].geometry.coordinates[2] >= 90) {
            color = colors[5];
        } else if (earthquakes[i].geometry.coordinates[2] >= 70) {
            color = colors[4];
        } else if (earthquakes[i].geometry.coordinates[2] >= 50) {
            color = colors[3];
        } else if (earthquakes[i].geometry.coordinates[2] >= 30) {
            color = colors[2];
        } else if (earthquakes[i].geometry.coordinates[2] >= 10) {
            color = colors[1];
        } else {
            color = colors[0];
        }

        // Creating a marker
        var marker = L.circle([earthquakes[i].geometry.coordinates[1], earthquakes[i].geometry.coordinates[0]], {
            fillOpacity: 0.75,
            color: 'black',
            weight: 1,
            fillColor: color,
            // Adjusting the size of the circle according to the earthquake's magnitude
            radius: (earthquakes[i].properties.mag) * 5000
        }).
            // Popup with earthquake info
            bindPopup(`<h3>${earthquakes[i].properties.place}</h3><hr><p>Time: ${new Date(earthquakes[i].properties.time)} \
                <br>Magnitude: ${earthquakes[i].properties.mag}<br>Depth: ${earthquakes[i].geometry.coordinates[2]} km</p>`);
        
        // Adding marker to the earthquake markers array
        earthquakeMarkers.push(marker);
    }

    // Making earthquakeMarkers into a layer group
    var earthquakes = L.layerGroup(earthquakeMarkers);

    // Passing earthquakes into createMap function
    createMap(earthquakes);
}

// Plotting map with earthquake  and tectonic plates data
d3.json(url).then(response => {
    createMarkers(response);
});

