// Function to store the stop name dynamically
function storeStopName(stopElement) {
    // Extract the bus stop name from the clicked element (using textContent or innerText)
    const stopName = stopElement.textContent || stopElement.innerText;

    // Store the stop name in localStorage
    localStorage.setItem('busStopName', stopName);

    // Redirect to the stop.html page
    window.location.href = 'stop.html';
}

// Function to retrieve the stop name and display it on stop.html
function displayStopName() {
    // Retrieve the bus stop name from localStorage
    const stopName = localStorage.getItem('busStopName');

    // Display the stop name in the "name" element on the stop.html page
    if (stopName) {
        document.getElementById('name').textContent = stopName;
    } else {
        document.getElementById('name').textContent = "No bus stop selected";  // Fallback if no stop is selected
    }
}

// Run displayStopName when the stop.html page loads to show the stored stop name
window.onload = displayStopName;

// Get the bus stop name from localStorage
const busStopName = localStorage.getItem('busStopName');

if (busStopName) {
    // Query Firestore for the bus stop details using the bus stop name
    db.collection('stops') // 'stops' is your collection name in Firestore
        .where('name', '==', busStopName) // Ensure this matches the bus stop name
        .get()
        .then((querySnapshot) => {
            if (querySnapshot.empty) {
                // Handle case where no bus stop is found
                document.getElementById('name').textContent = 'Bus stop not found';
                document.getElementById('Longitude').textContent = 'Longitude: N/A';
                document.getElementById('Latitude').textContent = 'Latitude: N/A';
            } else {
                querySnapshot.forEach((doc) => {
                    // Get the bus stop data from Firestore
                    const busStopData = doc.data();
                    const lat = busStopData.lat;
                    const lng = busStopData.lng;

                    // Set the bus stop details in the HTML
                    document.getElementById('name').textContent = busStopName;
                    document.getElementById('Longitude').textContent = `Longitude: ${lng}`;
                    document.getElementById('Latitude').textContent = `Latitude: ${lat}`;

                    // Initialize the map with the bus stop location
                    initMap(lat, lng);
                });
            }
        })
        .catch((error) => {
            console.error('Error getting documents: ', error);
        });
} else {
    // Handle case if bus stop name is not available
    document.getElementById('name').textContent = 'No bus stop selected';
    document.getElementById('Longitude').textContent = 'Longitude: N/A';
    document.getElementById('Latitude').textContent = 'Latitude: N/A';
}

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
