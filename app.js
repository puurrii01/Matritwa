document.addEventListener('DOMContentLoaded', function() {
    // Define fixed hospital locations with their latitude and longitude
    const fixedHospitals = [
        { lat: 27.725, lon: 85.330 }, 
        { lat: 27.710, lon: 85.325 }, 
    ];

    const link = document.querySelector("#amore");
    link.addEventListener("click", ()=>{
        window.location.href = './resources.html'
    })
    // Generate random coordinates within the Kathmandu area
    function getRandomCoordinates(num) {
        const coordinates = [];
        const minLat = 27.65; // Approximate southernmost latitude of Kathmandu
        const maxLat = 27.75; // Approximate northernmost latitude of Kathmandu
        const minLon = 85.25; // Approximate westernmost longitude of Kathmandu
        const maxLon = 85.38; // Approximate easternmost longitude of Kathmandu

        for (let i = 0; i < num; i++) {
            const lat = (Math.random() * (maxLat - minLat) + minLat).toFixed(6);
            const lon = (Math.random() * (maxLon - minLon) + minLon).toFixed(6);
            coordinates.push({ lat: parseFloat(lat), lon: parseFloat(lon) });
        }

        return coordinates;
    }

    var menubar = document.querySelector("#hamburger");
    menubar.addEventListener("click", () => {
        var menu = document.querySelector(".hide")
        if (menubar.src.endsWith('menu.png')) {
            menubar.src = './Images/close.png';
            console.log('clicked');
            menu.classList.add('extended-menu');
        } else {
            menubar.src = './Images/menu.png';
            menu.classList.remove('extended-menu');
        }
    })

    const scrollLinks = document.querySelectorAll(".scroll-link");

    scrollLinks.forEach(link => {
        link.addEventListener("click", function(event) {
            event.preventDefault();
            const targetId = this.getAttribute("href").substring(1);
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: "smooth" });
            }
        });
    });
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

        // Add a locate me button with default pin pointer
        document.getElementById('locateme').addEventListener('click', function() {
            map.locate({ setView: true, maxZoom: 16 });
        });

        // Handle the location found event with default pin pointer
        map.on('locationfound', function(e) {
            const radius = e.accuracy / 2;

            L.marker(e.latlng).addTo(map)
                .bindPopup("You are within " + radius + " meters from this point").openPopup();

            L.circle(e.latlng, radius).addTo(map);

            // Store the user's location for routing
            window.userLocation = e.latlng;
        });

        // Handle location error
        map.on('locationerror', function() {
            alert("Location access denied.");
        });

        // Initialize the geocoder
        const geocoder = L.Control.Geocoder.nominatim();

        // Handle the search input event for suggestions
        document.getElementById('search-input').addEventListener('input', function() {
            const query = this.value.trim(); // Trim whitespace

            // Get the search suggestions div
            const searchDiv = document.querySelector('.search');
            let suggestionsDiv = searchDiv.querySelector('.search-suggestions');

            // Create or clear suggestions div as needed
            if (!suggestionsDiv) {
                suggestionsDiv = document.createElement('div');
                suggestionsDiv.className = 'search-suggestions';
                searchDiv.appendChild(suggestionsDiv);
            }

            // Clear and hide suggestions when query length is <= 2
            if (query.length <= 2) {
                suggestionsDiv.innerHTML = '';
                suggestionsDiv.style.display = 'none';
                return; // Exit early
            }

            // Geocode query and display suggestions
            geocoder.geocode(query, function(results) {
                suggestionsDiv.innerHTML = '';
                if (results && results.length > 0) {
                    suggestionsDiv.style.display = 'block';
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
                } else {
                    suggestionsDiv.style.display = 'none';
                }
            });
        });

        // Handle the search button click event
        document.getElementById('searchbutton').addEventListener('click', function() {
            const query = document.getElementById('search-input').value.trim(); // Trim whitespace

            // Geocode query and set map view
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

        // Add fixed icons for specific locations
        fixedHospitals.forEach(hospital => {
            L.marker([hospital.lat, hospital.lon], {
                icon: L.icon({
                    iconUrl: './Images/hospital.png',
                    iconSize: [45, 45], // Size of the icon
                    iconAnchor: [22, 45] // Anchor point of the icon
                })
            }).addTo(map);
        });

        // Add random pin pointers for other coordinates
        const coordinates = getRandomCoordinates(100);
        coordinates.forEach(coord => {
            L.marker([coord.lat, coord.lon], {
                icon: L.icon({
                    iconUrl: './Images/hospital.png',
                    iconSize: [45, 45],
                    iconAnchor: [22, 45]
                })
            }).addTo(map);
        });

        // Directions feature
        document.getElementById('directions-button').addEventListener('click', function() {
            if (!window.userLocation) {
                alert('Unable to get your location. Please click "Locate Me" first.');
                return;
            }

            // Remove existing route if any
            if (window.route) {
                window.route.remove();
            }

            // Get random fixed hospital location for demonstration
            const randomHospital = fixedHospitals[Math.floor(Math.random() * fixedHospitals.length)];

            console.log('User Location:', window.userLocation);
            console.log('Destination Location:', randomHospital);

            // Add route to map
            window.route = L.Routing.control({
                waypoints: [
                    L.latLng(window.userLocation.lat, window.userLocation.lng),
                    L.latLng(randomHospital.lat, randomHospital.lon)
                ],
                createMarker: function() { return null; }, // Hide default markers
                routeWhileDragging: true
            }).addTo(map);

            // Zoom to fit route
            map.fitBounds(window.route.getBounds());
        });
    }

    // Call the initMap function to set up the map
    initMap();
});
