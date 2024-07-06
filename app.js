document.addEventListener('DOMContentLoaded', function() {
    let map;
    let hospitalInfoCache = null;
    const hospitalAPI = 'https://overpass-api.de/api/interpreter?data=[out:json];(node["amenity"="hospital"](around:5000,LAT,LON);way["amenity"="hospital"](around:5000,LAT,LON);relation["amenity"="hospital"](around:5000,LAT,LON););out;';

    function initMap() {
        map = L.map('map').setView([27.7172, 85.3240], 12);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        map.zoomControl.remove();

        document.getElementById('zoomin').addEventListener('click', function() {
            map.zoomIn();
        });

        document.getElementById('zoomout').addEventListener('click', function() {
            map.zoomOut();
        });

        document.getElementById('locateme').addEventListener('click', function() {
            map.locate({ setView: true, maxZoom: 16 });
        });

        map.on('locationfound', function(e) {
            const radius = e.accuracy / 2;

            L.marker(e.latlng).addTo(map)
                .bindPopup("You are within " + radius + " meters from this point").openPopup();

            L.circle(e.latlng, radius).addTo(map);

            updateHospitalInfo(e.latlng.lat, e.latlng.lng);
        });

        map.on('locationerror', function() {
            alert("Location access denied.");
        });

        map.on('moveend', function() {
            const center = map.getCenter();
            updateHospitalInfo(center.lat, center.lng);
        });
    }

    function updateHospitalInfo(lat, lng) {
        const apiUrl = hospitalAPI.replace('LAT', lat).replace('LON', lng);

        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                if (data && data.elements && data.elements.length > 0) {
                    const hospitals = data.elements;
                    displayHospitalList(hospitals);
                } else {
                    clearHospitalList();
                }
            })
            .catch(error => {
                console.error('Error fetching hospital data:', error);
                clearHospitalList();
            });
    }

    function displayHospitalList(hospitals) {
        const listDiv = document.getElementById('hospital-list');
        listDiv.innerHTML = '';

        hospitals.forEach(hospital => {
            const name = hospital.tags && hospital.tags.name ? hospital.tags.name : 'Hospital';
            const address = hospital.tags && hospital.tags.addr_city ? hospital.tags.addr_city : 'City not available';
            const lat = hospital.lat || 'N/A';
            const lon = hospital.lon || 'N/A';

            console.log(`Hospital Name: ${name}`);
            console.log(`Address: ${address}`);
            console.log(`Latitude: ${lat.toFixed(6)}`);
            console.log(`Longitude: ${lon.toFixed(6)}`);

            const hospitalItem = document.createElement('div');
            hospitalItem.classList.add('hospital-item');
            hospitalItem.innerHTML = `
                <h1>${name}</h1>
                <h3>${address}</h3>
                <h3>Lat: ${lat.toFixed(6)}, Long: ${lon.toFixed(6)}</h3>
            `;
            listDiv.appendChild(hospitalItem);
        });
    }

    function clearHospitalList() {
        const listDiv = document.getElementById('hospital-list');
        listDiv.innerHTML = '<p>No hospitals found nearby.</p>';
    }

    initMap();
});
