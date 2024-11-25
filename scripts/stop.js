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
    const busStopName = localStorage.getItem('stopName');
    const stopSource = localStorage.getItem('stopSource');

    console.log("Retrieved from localStorage - Stop Name:", busStopName);
    console.log("Source retrieved from localStorage:", stopSource);

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
        document.getElementById('name').textContent = "No bus stop selected";
    }
}

window.onload = function() {
    displayStopName();  // Run displayStopName when stop.html is loaded
    console.log("Window loaded and displayStopName is called.");
}

// Get the bus stop name from localStorage
const busStopName = localStorage.getItem('stopName');
console.log("Bus stop name retrieved from localStorage:", busStopName);

if (busStopName) {
    db.collection('stops')  // Firestore query
        .where('name', '==', busStopName)
        .get()
        .then((querySnapshot) => {
            console.log("Firestore querySnapshot retrieved:", querySnapshot.size);

            if (querySnapshot.empty) {
                console.log("Bus stop not found.");
                document.getElementById('name').textContent = 'Bus stop not found';
                document.getElementById('Longitude').textContent = 'Longitude: N/A';
                document.getElementById('Latitude').textContent = 'Latitude: N/A';
            } else {
                querySnapshot.forEach((doc) => {
                    const busStopData = doc.data();
                    const lat = busStopData.lat;
                    const lng = busStopData.lng;
                    console.log("Bus stop data:", busStopData);
                    document.getElementById('name').textContent = busStopName;
                    document.getElementById('Longitude').textContent = `Longitude: ${lng}`;
                    document.getElementById('Latitude').textContent = `Latitude: ${lat}`;
                    initMap(lat, lng);
                    getUserLocation(lat, lng);
                });
            }
        })
        .catch((error) => {
            console.error('Error getting documents: ', error);
        });
} else {
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


    // Double-check: is your collection called "Reviews" or "reviews"?
    db.collection("reviews")
        .where('stopName', '==', busStopName)
        .get()
        .then((allReviews) => {
            reviews = allReviews.docs;
            console.log(reviews);
            reviews.forEach((doc) => {
                var title = doc.data().title;
                var level = doc.data().crowdLevel;
                var description = doc.data().description;
                var traffic = doc.data().traffic;
                var full = doc.data().full;
                var waiting = doc.data().waiting;
                var time = doc.data().timestamp.toDate();
                var rating = doc.data().rating; // Get the rating value
                console.log(rating)

                console.log(time);

                let reviewCard = hikeCardTemplate.content.cloneNode(true);
                reviewCard.querySelector(".title").innerHTML = title;
                reviewCard.querySelector(".time").innerHTML = new Date(
                    time
                ).toLocaleString();
                reviewCard.querySelector(".level").innerHTML = `Crowd evel: ${level}`;
                reviewCard.querySelector(".waiting").innerHTML = `Waiting Period: ${waiting}`;
                reviewCard.querySelector(".full").innerHTML = `Bus full: ${full}`;
                reviewCard.querySelector(".traffic").innerHTML = `Traffic: ${traffic}`;
                reviewCard.querySelector( ".description").innerHTML = `Description: ${description}`;

                // Populate the star rating based on the rating value
                
	              // Initialize an empty string to store the star rating HTML
								let starRating = "";
								// This loop runs from i=0 to i<rating, where 'rating' is a variable holding the rating value.
                for (let i = 0; i < rating; i++) {
                    starRating += '<span class="material-icons">star</span>';
                }
								// After the first loop, this second loop runs from i=rating to i<5.
                for (let i = rating; i < 5; i++) {
                    starRating += '<span class="material-icons">star_outline</span>';
                }
                reviewCard.querySelector(".star-rating").innerHTML = starRating;

                hikeCardGroup.appendChild(reviewCard);
            });
        });
}

populateReviews();
