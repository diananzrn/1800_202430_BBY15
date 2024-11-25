// Function to store the stop name dynamically
function storeStopName(stopElement) {
    // Extract the bus stop name from the clicked element
    const stopName = stopElement.textContent || stopElement.innerText;

    // Store the stop name in localStorage
    localStorage.setItem('busStopName', stopName);

    // Redirect to the stop.html page
    window.location.href = 'stop.html';
}

// Function to retrieve the stop name and display it on stop.html
function displayStopName() {
    const stopName = getStopNameFromLocalStorage();
    updateStopNameInPage(stopName);
}

function getStopNameFromLocalStorage() {
    return localStorage.getItem('busStopName');
}

function updateStopNameInPage(stopName) {
    const stopNameElement = document.getElementById('name');
    if (stopName) {
        stopNameElement.textContent = stopName;
    } else {
        stopNameElement.textContent = "No bus stop selected";  // Fallback if no stop is selected
    }
}

function getBusStopDetailsFromFirestore(stopName) {
    return db.collection('stops') // 'stops' is your collection name in Firestore
        .where('name', '==', stopName) // Ensure this matches the bus stop name
        .get();
}

function handleNoBusStopFound() {
    document.getElementById('name').textContent = 'Bus stop not found';
    document.getElementById('Longitude').textContent = 'Longitude: N/A';
    document.getElementById('Latitude').textContent = 'Latitude: N/A';
}

function handleBusStopFound(busStopData) {
    const lat = busStopData.lat;
    const lng = busStopData.lng;

    document.getElementById('Longitude').textContent = `Longitude: ${lng}`;
    document.getElementById('Latitude').textContent = `Latitude: ${lat}`;

    // Initialize the map with the bus stop location
    initMap(lat, lng);

    // Call getUserLocation to calculate and display distance
    getUserLocation(lat, lng);
}

function fetchBusStopDetails(busStopName) {
    if (!busStopName) {
        handleNoBusStopFound();
        return;
    }

    getBusStopDetailsFromFirestore(busStopName)
        .then((querySnapshot) => {
            if (querySnapshot.empty) {
                handleNoBusStopFound();
            } else {
                querySnapshot.forEach((doc) => {
                    const busStopData = doc.data();
                    handleBusStopFound(busStopData);
                });
            }
        })
        .catch((error) => {
            console.error('Error getting documents: ', error);
        });
}

function initializePage() {
    displayStopName();  // Display stop name on page load
    const busStopName = getStopNameFromLocalStorage();
    fetchBusStopDetails(busStopName);  // Fetch bus stop details from Firestore
}

window.onload = initializePage;


// Map initialization function to display the bus stop's location
function initMap(lat, lng) {
    const map = new google.maps.Map(document.getElementById('map'), {
        zoom: 14,
        center: { lat: parseFloat(lat), lng: parseFloat(lng) }
    });

    new google.maps.Marker({
        position: { lat: parseFloat(lat), lng: parseFloat(lng) },
        map: map,
        title: 'Bus Stop Location'
    });
}

// Function to calculate distance between two coordinates (lat, lng)
function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
        0.5 - Math.cos(dLat) / 2 + 
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        (1 - Math.cos(dLng)) / 2;
    const distance = R * 2 * Math.asin(Math.sqrt(a)); // Distance in km
    return distance;
}

// Function to get the user's current location and calculate distance
function getUserLocation(busStopLat, busStopLng) {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            const userLat = position.coords.latitude;
            const userLng = position.coords.longitude;
            console.log("User Location: ", userLat, userLng);

            // Calculate distance
            const distance = calculateDistance(userLat, userLng, busStopLat, busStopLng);

            // Display the distance on the webpage
            document.getElementById('distanceValue').textContent = `${distance.toFixed(2)} km`;
        }, function(error) {
            console.error("Error getting user location: ", error);
            document.getElementById('distanceValue').textContent = 'Unable to retrieve your location.';
        });
    } else {
        document.getElementById('distanceValue').textContent = "Geolocation is not supported by this browser.";
    }
}
