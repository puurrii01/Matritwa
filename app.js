document.addEventListener('DOMContentLoaded', function() {
    // Initialize the Leaflet map
    function initMap() {
        const map = L.map('map').setView([27.7172, 85.3240], 12);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        // Disable default zoom control
        map.zoomControl.remove();

        // Add zoom controls
        document.getElementById('zoomin').addEventListener('click', function() {
            map.zoomIn();
        });

        document.getElementById('zoomout').addEventListener('click', function() {
            map.zoomOut();
        });

        // Add a locate me button
        document.getElementById('locateme').addEventListener('click', function() {
            map.locate({ setView: true, maxZoom: 16 });
        });

        // Handle the location found event
        map.on('locationfound', function(e) {
            const radius = e.accuracy / 2;

            L.marker(e.latlng).addTo(map)
                .bindPopup("You are within " + radius + " meters from this point").openPopup();

            L.circle(e.latlng, radius).addTo(map);
        });

        // Handle location error
        map.on('locationerror', function() {
            alert("Location access denied.");
        });

        // Initialize the geocoder
        const geocoder = L.Control.Geocoder.nominatim();
        
        // Handle the search input event for suggestions
        document.getElementById('search-input').addEventListener('input', function() {
            const query = this.value;
            const searchDiv = document.querySelector('.search');
            let suggestionsDiv = searchDiv.querySelector('.search-suggestions');
            if (!suggestionsDiv) {
                suggestionsDiv = document.createElement('div');
                suggestionsDiv.className = 'search-suggestions';
                searchDiv.appendChild(suggestionsDiv);
            }

            if (query.length > 2) {
                geocoder.geocode(query, function(results) {
                    suggestionsDiv.style.display = 'block';
                    suggestionsDiv.innerHTML = '';
                    if (results && results.length > 0) {
                        results.forEach(result => {
                            const suggestion = document.createElement('div');
                            suggestion.className = 'suggestion';
                            suggestion.innerText = result.name;
                            suggestion.addEventListener('click', function() {
                                map.setView(result.center, 16);
                                L.marker(result.center).addTo(map)
                                    .bindPopup(result.name).openPopup();
                                suggestionsDiv.innerHTML = '';
                                suggestionsDiv.style.display = 'none';
                            });
                            suggestionsDiv.appendChild(suggestion);
                        });
                    }
                });
            } else {
                suggestionsDiv.innerHTML = '';
                suggestionsDiv.style.display = 'none';
            }
        });

        // Handle the search button click event
        document.getElementById('searchbutton').addEventListener('click', function() {
            const query = document.getElementById('search-input').value;
            geocoder.geocode(query, function(results) {
                if (results && results.length > 0) {
                    const result = results[0];
                    map.setView(result.center, 16);
                    L.marker(result.center).addTo(map)
                        .bindPopup(result.name).openPopup();
                } else {
                    alert('Location not found');
                }
            });
        });
    }

    // Call the initMap function to set up the map
    initMap();
});
