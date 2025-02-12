document.addEventListener('DOMContentLoaded', () => {
    const getCurrentLocationBtn = document.getElementById('getCurrentLocation');
    const radiusInput = document.getElementById('radius');
    const doctorsList = document.getElementById('doctorsList');
    const addressSearchInput = document.getElementById('addressSearch');
    const searchAddressBtn = document.getElementById('searchAddress');
    const locationInfo = document.createElement('div');
    locationInfo.className = 'alert alert-info mt-3 text-center';
    locationInfo.style.display = 'none';

    // Initialize the map centered on Hanoi
    const map = L.map('map').setView([21.026899, 105.788692], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    let currentMarker = null;
    let doctorMarkers = [];
    let selectedLocation = null;

    // Initialize Nominatim geocoding service
    const nominatimEndpoint = 'https://nominatim.openstreetmap.org';
    let searchTimeout = null;
    let lastSearchTime = 0;
    const THROTTLE_DELAY = 1000; // 1 second delay between requests

    // Function to throttle API requests
    const throttledFetch = async (url) => {
        const now = Date.now();
        const timeSinceLastSearch = now - lastSearchTime;

        if (timeSinceLastSearch < THROTTLE_DELAY) {
            const delay = THROTTLE_DELAY - timeSinceLastSearch;
            await new Promise(resolve => setTimeout(resolve, delay));
        }

        lastSearchTime = Date.now();
        return fetch(url);
    };

    // Initialize autoComplete
    const autoCompleteJS = new autoComplete({
        selector: "#addressSearch",
        placeHolder: "Enter an address...",
        data: {
            src: async (query) => {
                try {
                    if (query.length < 3) return [];

                    // Clear any pending requests
                    if (searchTimeout) {
                        clearTimeout(searchTimeout);
                    }

                    // Return a promise that resolves with the search results
                    return new Promise((resolve) => {
                        searchTimeout = setTimeout(async () => {
                            try {
                                const response = await throttledFetch(
                                    `${nominatimEndpoint}/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=vn`
                                );
                                const data = await response.json();
                                resolve(data);
                            } catch (error) {
                                console.error("Error fetching address suggestions:", error);
                                resolve([]);
                            }
                        }, 300); // Debounce time
                    });
                } catch (error) {
                    console.error("Error fetching address suggestions:", error);
                    return [];
                }
            },
            keys: ["display_name"],
            cache: false,
        },
        resultItem: {
            highlight: true
        },
        events: {
            input: {
                selection: (event) => {
                    const selection = event.detail.selection.value;
                    autoCompleteJS.input.value = selection.display_name;
                    const lat = parseFloat(selection.lat);
                    const lon = parseFloat(selection.lon);
                    selectedLocation = { latitude: lat, longitude: lon };
                    map.setView([lat, lon], 16);
                    updateSelectedLocation();
                }
            }
        }
    });

    // Add click handler to search button
    searchAddressBtn.addEventListener('click', async () => {
        const query = addressSearchInput.value;
        if (!query) return;

        try {
            searchAddressBtn.disabled = true;
            const response = await throttledFetch(
                `${nominatimEndpoint}/search?format=json&q=${encodeURIComponent(query)}&limit=1&countrycodes=vn`
            );
            const data = await response.json();

            if (data && data.length > 0) {
                const { lat, lon, display_name } = data[0];
                selectedLocation = {
                    latitude: parseFloat(lat),
                    longitude: parseFloat(lon)
                };
                addressSearchInput.value = display_name;
                map.setView([lat, lon], 16);
                updateSelectedLocation();
            } else {
                alert('Address not found. Please try a different search term.');
            }
        } catch (error) {
            console.error('Error searching address:', error);
            alert('Failed to search address. Please try again.');
        } finally {
            searchAddressBtn.disabled = false;
        }
    });

    // Add click handler to map for location selection
    map.on('click', async (e) => {
        const { lat, lng } = e.latlng;
        selectedLocation = { latitude: lat, longitude: lng };
        updateSelectedLocation();

        // Reverse geocode the clicked location with throttling
        try {
            const response = await throttledFetch(
                `${nominatimEndpoint}/reverse?format=json&lat=${lat}&lon=${lng}`
            );
            const data = await response.json();
            if (data.display_name) {
                addressSearchInput.value = data.display_name;
            }
        } catch (error) {
            console.error('Error reverse geocoding:', error);
        }
    });

    function updateSelectedLocation() {
        if (!selectedLocation) return;

        // Update location info display
        locationInfo.style.display = 'block';
        locationInfo.innerHTML = `Selected Location: ${selectedLocation.latitude.toFixed(6)}°, ${selectedLocation.longitude.toFixed(6)}°`;
        getCurrentLocationBtn.parentElement.insertAdjacentElement('afterend', locationInfo);

        // Update map marker
        if (currentMarker) {
            map.removeLayer(currentMarker);
        }
        currentMarker = L.marker([selectedLocation.latitude, selectedLocation.longitude], {
            icon: L.divIcon({
                className: 'current-location-marker',
                html: '<i class="fas fa-map-marker-alt"></i>',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34]
            })
        })
            .bindPopup('<div class="map-popup"><h5>Selected Location</h5></div>')
            .addTo(map);

        // Draw radius circle
        if (window.radiusCircle) {
            map.removeLayer(window.radiusCircle);
        }
        const radius = parseInt(radiusInput.value);
        window.radiusCircle = L.circle([selectedLocation.latitude, selectedLocation.longitude], {
            radius: radius,
            color: '#007bff',
            fillColor: '#007bff',
            fillOpacity: 0.1
        }).addTo(map);

        // Search for doctors near the selected location
        searchDoctors(selectedLocation.latitude, selectedLocation.longitude, radius);
    }

    getCurrentLocationBtn.addEventListener('click', () => {
        if ('geolocation' in navigator) {
            getCurrentLocationBtn.disabled = true;
            getCurrentLocationBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Getting location...';

            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    selectedLocation = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    };
                    map.setView([selectedLocation.latitude, selectedLocation.longitude], 14);

                    // Reverse geocode the current location with throttling
                    try {
                        const response = await throttledFetch(
                            `${nominatimEndpoint}/reverse?format=json&lat=${selectedLocation.latitude}&lon=${selectedLocation.longitude}`
                        );
                        const data = await response.json();
                        if (data.display_name) {
                            addressSearchInput.value = data.display_name;
                        }
                    } catch (error) {
                        console.error('Error reverse geocoding:', error);
                    }

                    updateSelectedLocation();
                    getCurrentLocationBtn.disabled = false;
                    getCurrentLocationBtn.innerHTML = '<i class="fas fa-location-dot me-2"></i>Use Current Location';
                },
                (error) => {
                    console.error('Geolocation error:', error);
                    alert('Failed to get your location. Please make sure location services are enabled or click on the map to select a location.');
                    getCurrentLocationBtn.disabled = false;
                    getCurrentLocationBtn.innerHTML = '<i class="fas fa-location-dot me-2"></i>Use Current Location';
                }
            );
        } else {
            alert('Geolocation is not supported by your browser. Please click on the map to select a location.');
        }
    });

    // Add event listener for radius changes
    radiusInput.addEventListener('change', () => {
        if (selectedLocation) {
            updateSelectedLocation();
        }
    });

    async function searchDoctors(latitude, longitude, radius) {
        try {
            const response = await fetch(
                `/api/doctors/nearby?latitude=${latitude}&longitude=${longitude}&radius=${radius}`
            );

            if (!response.ok) {
                throw new Error('Failed to fetch doctors');
            }

            const doctors = await response.json();
            displayDoctors(doctors);
            updateMapMarkers(doctors);
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to fetch nearby doctors. Please try again.');
        }
    }

    function updateMapMarkers(doctors) {
        // Clear existing doctor markers
        doctorMarkers.forEach(marker => map.removeLayer(marker));
        doctorMarkers = [];

        // Add new markers for each doctor
        doctors.forEach(doctor => {
            const marker = L.marker([doctor.latitude, doctor.longitude], {
                icon: L.divIcon({
                    className: 'doctor-marker',
                    html: '<i class="fas fa-user-md"></i>',
                    iconSize: [25, 41],
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -34]
                })
            })
                .bindPopup(`
                    <div class="map-popup">
                        <h5>${doctor.name}</h5>
                        <p>${doctor.specialty}</p>
                        <p>${formatDistance(doctor.distance)}</p>
                    </div>
                `);
            marker.addTo(map);
            doctorMarkers.push(marker);
        });
    }

    function displayDoctors(doctors) {
        if (doctors.length === 0) {
            doctorsList.innerHTML = `
                <div class="col-12 text-center">
                    <p class="text-muted">No doctors found within the specified radius.</p>
                </div>
            `;
            return;
        }

        doctorsList.innerHTML = doctors.map(doctor => `
            <div class="col-md-4">
                <div class="card doctor-card">
                    <div class="card-body">
                        <span class="distance-badge">${formatDistance(doctor.distance)}</span>
                        <h5 class="card-title">${doctor.name}</h5>
                        <span class="specialty-badge">${doctor.specialty}</span>
                        <p class="card-text">${doctor.address}</p>
                        <div class="contact-info">
                            <div><i class="fas fa-phone"></i>${doctor.phone}</div>
                            <div><i class="fas fa-envelope"></i>${doctor.email}</div>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    function formatDistance(meters) {
        if (meters < 1000) {
            return `${Math.round(meters)}m`;
        }
        return `${(meters / 1000).toFixed(1)}km`;
    }
});
