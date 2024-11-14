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
    db.collection("stops").get()
        .then(querySnapshot => {
            const busStops = [];

            querySnapshot.forEach(doc => {
                const busStopData = doc.data();
                const stopId = doc.id;
                busStops.push({ stopId, ...busStopData });
            });

            // Randomly select two bus stops
            const randomBusStops = getRandomBusStops(busStops, 2);

            // Display the first random bus stop
            const stop1 = randomBusStops[0];
            document.getElementById("stop1").textContent = stop1.name;
            document.getElementById("NB1").textContent = formatRouteNumber(stop1.id);
            document.getElementById("NB2").textContent = formatRouteNumber(stop1.lat);
            document.getElementById("NB3").textContent = formatRouteNumber(stop1.lng);
            displayStars("stop1-stars", stop1.stars, stop1.stopId);
            displayAverageStars(stop1.stopId, "stop1-average");

            // Display the second random bus stop
            const stop2 = randomBusStops[1];
            document.getElementById("stop2").textContent = stop2.name;
            document.getElementById("south1").textContent = formatRouteNumber(stop2.id);
            document.getElementById("south2").textContent = formatRouteNumber(stop2.lat);
            document.getElementById("south3").textContent = formatRouteNumber(stop2.lng);
            displayStars("stop2-stars", stop2.stars, stop2.stopId);
            displayAverageStars(stop2.stopId, "stop2-average");

            // Add event listener to click on each bus stop
            document.querySelectorAll('.bus-stop').forEach(stopElement => {
                stopElement.addEventListener('click', (e) => {
                    const stopId = e.target.getAttribute('data-id');
                    // Store the stopId in localStorage
                    localStorage.setItem('stopId', stopId);
                    // Redirect to stop.html
                    window.location.href = 'stop.html';
                });
            });
        })
        .catch(error => {
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


// Display the star rating (and options) in each bus stop
function displayStars(elementId, busStopId) {
    const userId = firebase.auth().currentUser?.uid;
    const starContainer = document.getElementById(elementId);
    starContainer.innerHTML = ""; // Clear any existing stars

    if (userId) {
        db.collection("bus_stops").doc(busStopId).collection("ratings").doc(userId).get()
            .then(doc => {
                const userStarCount = doc.exists ? doc.data().starRating : 0; // Defaults to 0 if no rating


                for (let i = 1; i <= 5; i++) {
                    const star = document.createElement("i");
                    star.classList.add("star", "fas", "fa-star");
                    star.classList.add("clickable");

                    // Sets the star colour based on the rating
                    if (i <= currentStarCount) {
                        star.classList.add("filled"); // Filled = yellow
                    } else {
                        star.classList.add("empty"); // Unfilled = grey
                    }

                    // Updates star rating when clicked
                    star.addEventListener("click", () => {
                        updateStarRating(i, busStopId, elementId);
                    });

                    star.addEventListener("mouseout", () => displayStars(elementId, busStopId));

                    starContainer.appendChild(star);
                }
            })
            .catch(error => {
                console.error("Error fetching user star rating:", error)
            });
    } else {
        console.log("No user is logged in");
    }
}

// Update the star rating in Firestore and display the updated count
function updateStarRating(newRating, busStopId, elementId) {
    const userId = firebase.auth().currentUser?.uid;

    if (userId) {
        // Update the user's rating in Firestore
        db.collection("bus_stops").doc(busStopId).collection("ratings").doc(userId).set({
            stars: newRating
        }).then(() => {
            console.log(`Rating updated to ${newRating} stars`);
            // Refresh the display to show updated stars
            displayStars(elementId, busStopId);
        }).catch(error => {
            console.error("Error updating rating:", error);
        });
    } else {
        console.log("No user is logged in");
    }
}


// Initial rendering based on Firestore data
function loadStarRating(elementId, busStopId) {
    db.collection("bus_stops").doc(busStopId).get()
        .then((doc) => {
            if (doc.exists) {
                const starCount = doc.data().stars || 0;
                displayStars(elementId, busStopId);
            } else {
                console.error("No such document!");
            }
        })
        .catch((error) => {
            console.error("Error fetching document:", error);
        });
}

// Calculate and display the average star rating of a bus stop
function displayAverageStars(busStopId, elementId) {
    db.collection("bus_stops").doc(busStopId).collection("ratings").get()
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

