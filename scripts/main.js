// Get user name from Firebase Auth and display it
function getNameFromAuth() {
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            const userName = user.displayName;
            // Insert the user's name
            document.querySelector("#name-goes-here").innerText = userName;
        } else {
            console.log("No user is logged in");
        }
    });
}

// Function to load bus stops and check for favorites dynamically
function loadBusStops() {
    db.collection("stops").get().then(querySnapshot => {
        const busStops = [];
        const userId = firebase.auth().currentUser?.uid;

        querySnapshot.forEach(doc => {
            const busStopData = doc.data();
            const stopId = doc.id; // Document ID of the bus stop (generated ID)
            busStops.push({ stopId, ...busStopData });
        });

        // Randomly select two bus stops
        const randomBusStops = getRandomBusStops(busStops, 2);

        // Display details for the first random bus stop
        const stop1 = randomBusStops[0];
        document.getElementById("stop1").textContent = stop1.name;
        document.getElementById("NB1").textContent = formatRouteNumber(stop1.id);
        document.getElementById("NB2").textContent = formatRouteNumber(stop1.lat);
        document.getElementById("NB3").textContent = formatRouteNumber(stop1.lng);
        displayStars("stop1-stars", stop1.stars, stop1.stopId);
        displayAverageStars(stop1.stopId, "stop1-average");

        // Display details for the second random bus stop
        const stop2 = randomBusStops[1];
        document.getElementById("stop2").textContent = stop2.name;
        document.getElementById("south1").textContent = formatRouteNumber(stop2.id);
        document.getElementById("south2").textContent = formatRouteNumber(stop2.lat);
        document.getElementById("south3").textContent = formatRouteNumber(stop2.lng);
        displayStars("stop2-stars", stop2.stars, stop2.stopId);
        displayAverageStars(stop2.stopId, "stop2-average");

        if (userId) {
            // For each of the random bus stops, check if they are favorites
            randomBusStops.forEach((stop, index) => {
                // For stop1, call the function with the correct element ID
                checkFavoriteStatus(userId, stop.stopId, `stop${index + 1}-bookmark`);
            });
        }
    }).catch(error => {
        console.error("Error loading bus stops: ", error);
    });
}

// Function to check if a bus stop's document ID exists in the user's favorites
function checkFavoriteStatus(userId, stopId, bookmarkElementId) {
    // Ensure user is logged in before proceeding
    if (!userId) return;

    db.collection("users").doc(userId)
        .collection("favorites").doc(stopId) // Check by stop's document ID (stopId)
        .get()
        .then((doc) => {
            const bookmarkIcon = document.querySelector(`#${bookmarkElementId} i.fa-bookmark`);
            
            if (bookmarkIcon) { // Check if the bookmark icon exists
                if (doc.exists) {
                    // If the document exists in favorites, fill the bookmark
                    bookmarkIcon.classList.remove('far');
                    bookmarkIcon.classList.add('fas'); // filled bookmark
                } else {
                    // If the document does not exist, empty the bookmark
                    bookmarkIcon.classList.remove('fas');
                    bookmarkIcon.classList.add('far'); // empty bookmark
                }
            }
        }).catch(error => {
            console.error("Error checking favorites: ", error);
        });
}

// Helper function to get 'n' random bus stops from the array
function getRandomBusStops(busStops, n) {
    const randomBusStops = [];
    const usedIndexes = new Set(); 
    
    while (randomBusStops.length < n) {
        const randomIndex = Math.floor(Math.random() * busStops.length);
        
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

function initializePage() {
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            const userName = user.displayName;
            const nameElement = document.querySelector("#name-goes-here");
            if (nameElement) {
                nameElement.innerText = userName;
            }
            loadBusStops();
        } else {
            console.log("No user is logged in");
        }
    });
}

document.addEventListener('DOMContentLoaded', initializePage);

// Display and manage stars for bus stop ratings
function displayStars(elementId, currentStarCount, busStopId) {
    const starContainer = document.getElementById(elementId);
    
    const stars = starContainer.querySelectorAll(".star");
    if (stars.length > 0) {
        stars.forEach((star, index) => {
            star.classList.toggle("filled", index < currentStarCount);
            star.classList.toggle("unfilled", index >= currentStarCount);
        });
        return;
    }

    for (let i = 1; i <= 5; i++) {
        const star = document.createElement("i");
        star.classList.add("star", "fas", "fa-star", "clickable");
        star.classList.add(i < currentStarCount ? "filled" : "unfilled");
        star.addEventListener("click", () => updateStarRating(i, busStopId, elementId));
        starContainer.appendChild(star);
    }
}

function updateStarRating(newStarCount, busStopId, elementId) {
    displayStars(elementId, newStarCount, busStopId);

    const userId = firebase.auth().currentUser?.uid;
    if (!userId) return;

    db.collection("stops").doc(busStopId).collection("ratings").doc(userId).set({
        stars: newStarCount
    }).then(() => {
        console.log(`Rating updated to ${newStarCount} stars`);
        displayStars(elementId, newStarCount, busStopId);
    }).catch(error => {
        console.error("Error updating rating:", error);
    });
}

function loadStarRating(elementId, busStopId) {
    db.collection("stops").doc(busStopId).get()
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

function displayAverageStars(busStopId, elementId) {
    db.collection("stops").doc(busStopId).collection("ratings").get()
    .then(querySnapshot => {
        let totalStars = 0;
        let userCount = 0;

        querySnapshot.forEach(doc => {
            const data = doc.data();
            if (data.stars) {
                totalStars += data.stars;
                userCount++;
            }
        });
        const averageRating = userCount > 0 ? (totalStars / userCount).toFixed(1) : "No ratings";
        document.getElementById(elementId).textContent = averageRating;
    })
    .catch(error => {
        console.error("Error calculating average rating:", error);
    });
}
