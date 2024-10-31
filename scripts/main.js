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
            console.log ("No user is logged in");
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
            
            // Determine which stop we're dealing with based on the document ID
            if (stopId === "TlHlIjyyzNlDDppmyFSb") {
                // Update first bus stop
                document.getElementById("stop1").textContent = busStopData.name;
                document.getElementById("NB1").textContent = formatRouteNumber(busStopData.number1);
                document.getElementById("NB2").textContent = formatRouteNumber(busStopData.number2);
                document.getElementById("NB3").textContent = formatRouteNumber(busStopData.number3);
            } else if (stopId === "jkbo3NGmM49mbWqhi1mA") {
                // Update second bus stop
                document.getElementById("stop2").textContent = busStopData.name;
                document.getElementById("south1").textContent = formatRouteNumber(busStopData.number1);
                document.getElementById("south2").textContent = formatRouteNumber(busStopData.number2);
                document.getElementById("south3").textContent = formatRouteNumber(busStopData.number3);
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

