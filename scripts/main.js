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
        querySnapshot.forEach(doc => {
            const busStopData = doc.data();
            const stopId = doc.id;

            if (stopId === "TlHlIjyyzNlDDppmyFSb") {
                document.getElementById("stop1").textContent = busStopData.name;
                document.getElementById("NB1").textContent = formatRouteNumber(busStopData.number1);
                document.getElementById("NB2").textContent = formatRouteNumber(busStopData.number2);
                document.getElementById("NB3").textContent = formatRouteNumber(busStopData.number3);
                displayStars("stop1-stars", busStopData.stars, stopId); // Pass stopId here
            } else if (stopId === "jkbo3NGmM49mbWqhi1mA") {
                document.getElementById("stop2").textContent = busStopData.name;
                document.getElementById("south1").textContent = formatRouteNumber(busStopData.number1);
                document.getElementById("south2").textContent = formatRouteNumber(busStopData.number2);
                document.getElementById("south3").textContent = formatRouteNumber(busStopData.number3);
                displayStars("stop2-stars", busStopData.stars, stopId); // Pass stopId here
            }
        });
    }).catch(error => {
        console.error("Error loading bus stops: ", error);
    });
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

// Function to find and display nearby bus stops
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

//Function to display the star ratings in each bus stop
function displayStars(elementId, currentStarCount, busStopId) {
    const starContainer = document.getElementById(elementId);
    starContainer.innerHTML = ""; // Clear any existing stars

    for (let i = 1; i <= 5; i++) {
        const star = document.createElement("i");
        star.classList.add("star", "fas", "fa-star");
        star.classList.add("clickable");

        if (i <= currentStarCount) {
            star.classList.add("filled"); 
        }

        // Updates star rating when clicked
        star.addEventListener("click", () => {
            updateStarRating(i, busStopId, elementId); 
        });

        star.addEventListener("mouseout", () => displayStars(elementId, currentStarCount, busStopId));

        starContainer.appendChild(star);
    }
}

// Function to update the star rating in Firestore and display the updated count
function updateStarRating(newStarCount, busStopId, elementId) {
    displayStars(elementId, newStarCount, busStopId);

    db.collection("bus_stops").doc(busStopId).update({
        stars: newStarCount
    })
    .then(() => {
        console.log(`Star rating updated to ${newStarCount}`);
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
