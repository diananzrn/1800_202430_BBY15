function storeStopName(stopElement, source) {
    const stopName = stopElement.textContent.trim();
    console.log("Clicked element text:", stopElement.textContent);
    console.log("Source passed to storeStopName:", source);

    if (stopName) {
        console.log("Valid stop name captured:", stopName);

        // Store the bus stop name and source in localStorage
        localStorage.setItem('busStopName', stopName);
        localStorage.setItem('stopSource', source);
        console.log("Stored in localStorage - busStopName:", stopName);
        console.log("Stored in localStorage - stopSource:", source);

        // Update the search input field with the selected stop name
        const searchInput = document.getElementById('suggestions');
        searchInput.value = stopName;

        setTimeout(function () {
            console.log("Redirecting to stop.html...");
            window.location.href = 'stop.html';
        }, 100);
    } else {
        console.error("Invalid stop name captured.");
    }
}

function storeStopFromSearch() {
    const searchInput = document.getElementById('suggestions');
    const stopName = searchInput.value.trim();
    
    if (stopName) {
        console.log("Stop name from search input:", stopName);

        // Store the bus stop name from search in localStorage
        localStorage.setItem('busStopName', stopName);
        localStorage.setItem('stopSource', 'search');
        console.log("Stored in localStorage - busStopName:", stopName);
        console.log("Stored in localStorage - stopSource: search");
// Function to store the stop name dynamically
function storeStopName(stopElement) {
    // Extract the bus stop name from the clicked element
    const stopName = stopElement.textContent || stopElement.innerText;

    // Store the stop name in localStorage
    localStorage.setItem('stopName', stopName);
}
        setTimeout(function () {
            console.log("Redirecting to stop.html...");
            window.location.href = 'stop.html';
        }, 100);
    } else {
        console.error("Invalid stop name captured from search.");
    }
}

function displayStopName() {
    // Retrieve the bus stop name from localStorage
    const stopName = localStorage.getItem('stopName');
    const stopSource = localStorage.getItem('stopSource');

    console.log("Retrieved from localStorage - Stop Name:", busStopName);
    console.log("Source retrieved from localStorage:", stopSource);

    if (stopName) {
        console.log("Valid stop name captured:", stopName);

        // Store the bus stop name and source in localStorage
        localStorage.setItem('stopName', stopName);
        localStorage.setItem('stopSource', source);
        console.log("Stored in localStorage - busStopName:", stopName);
        console.log("Stored in localStorage - stopSource:", source);

        // Update the search input field with the selected stop name
        const searchInput = document.getElementById('suggestions');
        searchInput.value = stopName;

        setTimeout(function () {
            console.log("Redirecting to stop.html...");
            window.location.href = 'stop.html';
        }, 100);
    } else {
        document.getElementById('name').textContent = "No bus stop selected";
    }
}

// Run displayStopName when the stop.html page loads to show the stored stop name
window.onload = displayStopName;

// Get the bus stop name from localStorage
const busStopName = localStorage.getItem('busStopName');

if (busStopName) {
    // Query Firestore for the bus stop details using the bus stop name
    db.collection('stops') // Firestore query
        .where('name', '==', busStopName) 
        .get()
        .then((querySnapshot) => {
            if (querySnapshot.empty) {
                // Handle case where no bus stop is found
                console.log("Bus stop not found.");
                document.getElementById('name').textContent = 'Bus stop not found';
                document.getElementById('Longitude').textContent = 'Longitude: N/A';
                document.getElementById('Latitude').textContent = 'Latitude: N/A';
            } else {
                querySnapshot.forEach((doc) => {
                    // Get the bus stop data from Firestore
                    const busStopData = doc.data();
                    const lat = busStopData.lat;
                    const lng = busStopData.lng;
                    console.log("Bus stop data:", busStopData);

                    // Set the bus stop details in the HTML
                    document.getElementById('name').textContent = busStopName;
                    document.getElementById('Longitude').textContent = `Longitude: ${lng}`;
                    document.getElementById('Latitude').textContent = `Latitude: ${lat}`;

                    // Initialize the map with the bus stop location
                    initMap(lat, lng);

                    // Call getUserLocation to calculate and display distance
                    getUserLocation(lat, lng);
                });
            }
        })
        .catch((error) => {
            console.error('Error getting documents: ', error);
        });
} else {
    // Handle case if bus stop name is not available
    console.log("No bus stop name found in localStorage.");
    document.getElementById('name').textContent = 'No bus stop selected';
    document.getElementById('Longitude').textContent = 'Longitude: N/A';
    document.getElementById('Latitude').textContent = 'Latitude: N/A';
}

// Map initialization function to display the bus stop's location
function initMap(lat, lng) {
    console.log("Initializing map with coordinates:", lat, lng);
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
    const distance = R * 2 * Math.asin(Math.sqrt(a));  // Distance in km
    console.log("Calculated distance:", distance, "km");
    return distance;
}

// Function to get the user's current location and calculate distance
function getUserLocation(busStopLat, busStopLng) {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            const userLat = position.coords.latitude;
            const userLng = position.coords.longitude;
            console.log("User Location: ", userLat, userLng);
            const distance = calculateDistance(userLat, userLng, busStopLat, busStopLng);
            document.getElementById('distanceValue').textContent = `${distance.toFixed(2)} km`;
        }, function (error) {
            console.error("Error getting user location: ", error);
            document.getElementById('distanceValue').textContent = 'Unable to retrieve your location.';
        });
    } else {
        document.getElementById('distanceValue').textContent = "Geolocation is not supported by this browser.";
    }
}


function saveStopDocumentIDAndRedirect(){
    window.location.href = 'review.html';
}

// displays reviews
function populateReviews() {
    let hikeCardTemplate = document.getElementById("reviewCardTemplate");
    let hikeCardGroup = document.getElementById("reviewCardGroup");

    
    const busStopName = localStorage.getItem('stopName');


    
    db.collection("reviews")
        .where('stopName', '==', busStopName)
        .get()
        .then((querySnapshot) => {
            if (!querySnapshot.empty) {
                const stopDoc = querySnapshot.docs[0];
                localStorage.setItem('stopName', stopDoc.data().name); // Store the specific stop name
                localStorage.setItem('stopId', stopDoc.id);
                window.location.href = 'review.html';
            }
        });

}

// This code will be in stop.js, assuming Firestore and Firebase are already initialized.

document.addEventListener("DOMContentLoaded", function() {
    // Get the stop name from localStorage (already set in the review page)
    const stopName = localStorage.getItem('stopName');
    
    // Reference to the reviews collection in Firestore
    const reviewsRef = db.collection("reviews").where("stopName", "==", stopName);

    // Get the reviews from Firestore
    reviewsRef.get().then((querySnapshot) => {
        const reviewCardGroup = document.getElementById("reviewCardGroup");
        
        // Check if reviews exist
        if (querySnapshot.empty) {
            reviewCardGroup.innerHTML = "<p>No reviews yet.</p>";
        } else {
            querySnapshot.forEach((doc) => {
                const reviewData = doc.data();

                // Clone the review card template
                const reviewCardTemplate = document.getElementById("reviewCardTemplate").content.cloneNode(true);
                
                // Fill the template with data
                reviewCardTemplate.querySelector(".title").textContent = reviewData.title;
                reviewCardTemplate.querySelector(".user").textContent = reviewData.userName;
                reviewCardTemplate.querySelector(".stop-name-value").textContent = reviewData.stopName;
                reviewCardTemplate.querySelector(".star-rating").textContent = `Rating: ${reviewData.rating} stars`;
                reviewCardTemplate.querySelector(".time").textContent = new Date(reviewData.timestamp.seconds * 1000).toLocaleString(); // Format timestamp
                reviewCardTemplate.querySelector(".waiting").textContent = `Waiting: ${reviewData.waiting}`;
                reviewCardTemplate.querySelector(".level").textContent = `Crowd Level: ${reviewData.crowdLevel}`;
                reviewCardTemplate.querySelector(".full").textContent = `Bus Full: ${reviewData.full}`;
                reviewCardTemplate.querySelector(".traffic").textContent = `Traffic: ${reviewData.traffic}`;
                reviewCardTemplate.querySelector(".description").textContent = reviewData.description;

                // Append the filled card to the reviewCardGroup container
                reviewCardGroup.appendChild(reviewCardTemplate);
            });
        }
    }).catch((error) => {
        console.error("Error fetching reviews: ", error);
    });
});
