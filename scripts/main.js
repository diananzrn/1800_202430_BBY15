function getNameFromAuth() {
    firebase.auth().onAuthStateChanged(user => {
        // Check if a user is signed in:
        if (user) {
            // Do something for the currently logged-in user here: 
            console.log(user.uid); //print the uid in the browser console
            console.log(user.displayName);  //print the user name in the browser console
            userName = user.displayName;

            //method #1:  insert with JS
            //document.getElementById("name-goes-here").innerText = userName;    

            //method #2:  insert using jquery
            // $("#name-goes-here").text(userName); //using jquery

            //method #3:  insert using querySelector
            document.querySelector("#name-goes-here").innerText = userName

        } else {
            // No user is signed in.
            console.log("No user is logged in");
        }
    });
}
getNameFromAuth(); //run the function



// Option 1: Only show bus stops to logged-in users (current implementation)
function loadBusStops() {
    db.collection("bus_stops").get().then(querySnapshot => {
        // Store all bus stops in an array
        const busStops = [];
        
        querySnapshot.forEach(doc => {
            const busStopData = doc.data();
            const stopId = doc.id;
            busStops.push({ stopId, ...busStopData }); // Add stopId and data to the array
        });

        // Randomly select two bus stops
        const randomBusStops = getRandomBusStops(busStops, 2);

        // Display the details for the first random bus stop
        const stop1 = randomBusStops[0];
        document.getElementById("stop1").textContent = stop1.name;
        document.getElementById("NB1").textContent = formatRouteNumber(stop1.number1);
        document.getElementById("NB2").textContent = formatRouteNumber(stop1.number2);
        document.getElementById("NB3").textContent = formatRouteNumber(stop1.number3);
        displayStars("stop1-stars", stop1.stars, stop1.stopId); // Pass stopId here
        displayAverageStars("stop1-average", stop1.stopId); // Displays average rating

        // Display the details for the second random bus stop
        const stop2 = randomBusStops[1];
        document.getElementById("stop2").textContent = stop2.name;
        document.getElementById("south1").textContent = formatRouteNumber(stop2.number1);
        document.getElementById("south2").textContent = formatRouteNumber(stop2.number2);
        document.getElementById("south3").textContent = formatRouteNumber(stop2.number3);
        displayStars("stop2-stars", stop2.stars, stop2.stopId); // Pass stopId here
        displayAverageStars("stop2-average", stop2.stopId); // Displays average rating

    }).catch(error => {
        console.error("Error loading bus stops: ", error);
    });
}

// Helper function to get 'n' random bus stops from the array
function getRandomBusStops(busStops, n) {
    const randomBusStops = [];
    const usedIndexes = new Set(); // To keep track of used indexes and avoid duplicates
    
    while (randomBusStops.length < n) {
        const randomIndex = Math.floor(Math.random() * busStops.length);
        
        // Ensure no duplicates are added
        if (!usedIndexes.has(randomIndex)) {
            randomBusStops.push(busStops[randomIndex]);
            usedIndexes.add(randomIndex);
        }
    }

    return randomBusStops;
}
 



function formatRouteNumber(number) {
    return number.toString().padStart(3, '0');
}

// Option 1: Only show data to logged-in users
function initializePage() {
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            console.log(user.uid);
            console.log(user.displayName);
            const userName = user.displayName;

            // Update user name if element exists
            const nameElement = document.querySelector("#name-goes-here");
            if (nameElement) {
                nameElement.innerText = userName;
            }

            // Load bus stop data only for logged-in users
            loadBusStops();
        } else {
            console.log("No user is logged in");
            // Optionally redirect to login page
            // window.location.href = 'login.html';
        }
    });
}

// Option 2: Show bus stops to everyone, but still handle user auth
function initializePagePublic() {
    // Load bus stops immediately for all users
    loadBusStops();

    // Handle authentication separately
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            console.log(user.uid);
            console.log(user.displayName);
            const userName = user.displayName;

            // Update user name if element exists
            const nameElement = document.querySelector("#name-goes-here");
            if (nameElement) {
                nameElement.innerText = userName;
            }
        } else {
            console.log("No user is logged in");
        }
    });
}
// we'll change this to only authenticated users when login process is properly set up.
// Use either Option 1 or Option 2 initialization when the page loads
document.addEventListener('DOMContentLoaded', initializePage); // For authenticated access only
document.addEventListener('DOMContentLoaded', initializePagePublic); // For public access

async function initMap() {
    // Default location (in case geolocation fails)
    const defaultLocation = { lat: 49.2488, lng: -122.9805 }; // Burnaby, BC

    // Create the map, initially centered at the default location
    const map = new google.maps.Map(document.getElementById("map"), {
        zoom: 16,
        center: defaultLocation,
    });

    // Try to get the user's location
    const userLocation = await getUserLocation();

    // If we got a user location, center the map there
    if (userLocation) {
        map.setCenter(userLocation);

        // Add a marker at the user's location
        new google.maps.Marker({
            position: userLocation,
            map: map,
            title: "Your Location",
        });

        // Find nearby bus stops
        findNearbyBusStops(map, userLocation);
    } else {
        alert("Failed to get user location. Showing default location.");
    }
    const trafficLayer = new google.maps.TrafficLayer();

    trafficLayer.setMap(map);

    const transitLayer = new google.maps.TransitLayer();

    transitLayer.setMap(map);
}

// Async function to get the user's location
async function getUserLocation() {
    if (navigator.geolocation) {
        try {
            // Wrap geolocation in a promise
            const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject);
            });

            return {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
            };
        } catch (error) {
            console.error("Error getting user location:", error);
            return null;
        }
    } else {
        alert("Geolocation is not supported by this browser.");
        return null;
    }
}

// Find and display nearby bus stops
function findNearbyBusStops(map, location) {
    const service = new google.maps.places.PlacesService(map);

    service.nearbySearch(
        {
            location: location,
            radius: 500,
            type: ["transit_station"],
        },
        (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK) {

                results.forEach((stop, index) => {
                    const stopNameId = `stop${index + 1}`;
                    const stopNameElement = document.getElementById(stopNameId);
                    const routeId = `NB${index + 1}`;
                    const routeElement = document.getElementById(routeId);
                    const routeId2 = `south${index + 1}`;
                    const routeElement2 = document.getElementById(routeId2);

                    if (stopNameElement) {
                        stopNameElement.innerHTML = `
                  ${stop.name}
                `;
                    }
                    if (routeElement) {
                        routeElement.innerHTML = `
                ${document.getElementById(routeId)};
                `;
                    }

                    if (routeElement2) {
                        routeElement2.innerHTML = `
                ${document.getElementById(routeId2)};
                `;
                    }

                    // Add a marker for each bus stop
                    new google.maps.Marker({
                        position: stop.geometry.location,
                        map: map,
                        icon: {
                            url: "https://cdn3.iconfinder.com/data/icons/infrastructure-isometric-1/512/g6007-512.png",
                            scaledSize: new google.maps.Size(50, 50),
                        },
                        title: stop.name,
                    });
                });
            } else {
                console.error("Error finding nearby bus stops:", status);
            }
        }
    );
}

// Display the star rating (and options) in each bus stop
function displayStars(elementId, currentStarCount, busStopId) {
    const starContainer = document.getElementById(elementId);
    starContainer.innerHTML = ""; // Clear any existing stars

    for (let i = 1; i <= 5; i++) {
        const star = document.createElement("i");
        star.classList.add("star", "fas", "fa-star");
        star.classList.add("clickable");

        // Sets the star colour based on the rating
        if (i <= currentStarCount) {
            star.classList.add("filled"); // Filled = yellow
        } else {
            star.classList.add("unfilled"); // Unfilled = grey
        }

        // Updates star rating when clicked
        star.addEventListener("click", () => {
            updateStarRating(i, busStopId, elementId); 
        });

        star.addEventListener("mouseout", () => displayStars(elementId, currentStarCount, busStopId));

        starContainer.appendChild(star);
    }
}

// Update the star rating in Firestore and display the updated count
function updateStarRating(newStarCount, busStopId, elementId) {
    // Updates the display
    displayStars(elementId, newStarCount, busStopId);

    const userId = firebase.auth().currentUser.uid;
    if (!userId) return; // Checks if the user is logged in

    // Stores the new rating in the ratings subcollection of the bus stop
    db.collection("bus_stops").doc(busStopId).collection("ratings").doc(userId).set({
        stars: newStarCount
    })
    .then(() => {
        console.log(`Star rating updated to ${newStarCount} for user ${userId}` );
    })
    .catch((error) => {
        console.error("Error updating star rating:", error);
    });
}

// Initial rendering based on Firestore data
function loadStarRating(elementId, busStopId) {
    db.collection("bus_stops").doc(busStopId).get()
    .then((doc) => {
        if (doc.exists) {
            const starCount = doc.data().stars || 0;
            displayStars(elementId, starCount, busStopId);
        } else {
            console.error("No such document!");
        }
    })
    .catch((error) => {
        console.error("Error fetching document:", error);
    });
}

// Calculate and display the average star rating of a bus stop
function displayAverageStars(elementId, busStopId) {

    const ratingsRef = db.collection("bus_stops").doc(busStopId).collection("ratings");

    ratingsRef.get().then((querySnapshot) => {
        let totalStars = 0;
        let ratingCount = 0;

        querySnapshot.forEach((dog) => {
            const ratingData = doc.data();
            if (ratingData.starCount) {
                totalStars += ratingData.starCount;
                ratingCount += 1;
            }
        });

        // Calculates the average rating
        const averageRating = ratingCount > 0 ? totalStars / ratingCount : 0;

        // Updates the UI to show the average rating
        displayStars(elementId, Math.round(averageRating)); // Displays the average rounded
    }).catch((error) => {
        console.error("Error calculating average star rating:", error);
    });
}