// Store the selected bus stop name and redirect
function storeStopName(stopElement) {
    const stopName = stopElement.textContent.trim();
    if (stopName) {
        console.log("Storing selected stop:", stopName);
        localStorage.setItem('busStopName', stopName);
        setTimeout(() => window.location.href = 'stop.html', 100);
    } else {
        console.error("No stop name found to store.");
    }
}

// Display the stored bus stop name and fetch its details
function displayStopName() {
    const busStopName = localStorage.getItem('busStopName');

    if (busStopName) {
        console.log("Displaying stored stop name:", busStopName);
        document.getElementById('name').textContent = busStopName;

        // Query Firestore for stop details
        db.collection('stops')
            .where('name', '==', busStopName)
            .get()
            .then((querySnapshot) => {
                if (querySnapshot.empty) {
                    console.error("No matching bus stop found in Firestore.");
                    displayStopNotFound();
                } else {
                    querySnapshot.forEach((doc) => {
                        const data = doc.data();
                        // Display Longitude and Latitude
                        document.getElementById('Longitude').textContent = `Longitude: ${data.lng || 'N/A'}`;
                        document.getElementById('Latitude').textContent = `Latitude: ${data.lat || 'N/A'}`;
                        
                        // Initialize the map and get user location
                        initMap(data.lat, data.lng);
                        getUserLocation(data.lat, data.lng);
                    });
                }
            })
            .catch((error) => {
                console.error("Error fetching stop data:", error);
                displayStopNotFound();
            });
    } else {
        console.error("No stop name found in localStorage.");
        displayStopNotFound();
    }
}

// Fallback display for missing stop data
function displayStopNotFound() {
    document.getElementById('name').textContent = 'No bus stop selected';
    document.getElementById('Longitude').textContent = 'Longitude: N/A';
    document.getElementById('Latitude').textContent = 'Latitude: N/A';
}

// Initialize the map with the bus stop coordinates
function initMap(lat, lng) {
    if (lat && lng) {
        const map = new google.maps.Map(document.getElementById('map'), {
            zoom: 14,
            center: { lat: parseFloat(lat), lng: parseFloat(lng) },
        });
        new google.maps.Marker({
            position: { lat: parseFloat(lat), lng: parseFloat(lng) },
            map: map,
            title: 'Bus Stop Location',
        });
    } else {
        console.error("Invalid coordinates for map initialization.");
    }
}

// Get the user's location and calculate the distance to the bus stop
function getUserLocation(busStopLat, busStopLng) {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const userLat = position.coords.latitude;
                const userLng = position.coords.longitude;
                const distance = calculateDistance(userLat, userLng, busStopLat, busStopLng);
                document.getElementById('distanceValue').textContent = `${distance.toFixed(2)} km`;
            },
            (error) => {
                console.error("Geolocation error:", error);
                document.getElementById('distanceValue').textContent = 'Unable to retrieve your location.';
            }
        );
    } else {
        document.getElementById('distanceValue').textContent = "Geolocation is not supported by this browser.";
    }
}

// Calculate the distance between two geographic coordinates
function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.asin(Math.sqrt(a));
}

// Run displayStopName when the page loads
window.onload = displayStopName;

function saveStopDocumentIDAndRedirect() {
    const busStopName = localStorage.getItem('busStopName');
    
    // Query Firestore to get the stop document ID
    db.collection('stops')
        .where('name', '==', busStopName)
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
