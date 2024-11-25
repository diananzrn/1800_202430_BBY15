// Function to store the stop name dynamically
function storeStopName(stopElement) {
    // Extract the bus stop name from the clicked element
    const stopName = stopElement.textContent || stopElement.innerText;

    // Store the stop name in localStorage
    localStorage.setItem('stopName', stopName);

    // Redirect to the stop.html page
    window.location.href = 'stop.html';
}

// Function to retrieve the stop name and display it on stop.html
function displayStopName() {
    // Retrieve the bus stop name from localStorage
    const stopName = localStorage.getItem('stopName');

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
const busStopName = localStorage.getItem('stopName');

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

function displayUserName() {
db.collection("users")
  .doc(userId)
  .get()
  .then((doc) => {
    if (doc.exists) {
      let ID = '/users/' + doc; // Get the user ID with the desired format
      let userName = doc.data().name; // Extract the user's name

      // Query the reviews collection for matching userID
      db.collection("reviews")
        .where("userID", "==", ID)
        .get()
        .then((reviewSnapshot) => {
          if (!reviewSnapshot.empty) {
            // If a matching review exists, update the user name in the DOM
            document.getElementById("user-name").innerHTML = userName;
          } else {
            console.log("No reviews found for this user.");
          }
        })
        .catch((error) => {
          console.error("Error fetching reviews:", error);
        });
    } else {
      console.log("No user found with this ID.");
    }
  })
  .catch((error) => {
    console.error("Error fetching user:", error);
  });
}
displayUserName();