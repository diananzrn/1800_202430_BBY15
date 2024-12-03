const stopName = localStorage.getItem('stopName');
// Add this JavaScript code to make stars clickable

// Select all elements with the class name "star" and store them in the "stars" variable
const stars = document.querySelectorAll('.star');

// Iterate through each star element
stars.forEach((star, index) => {
    // Add a click event listener to the current star
    star.addEventListener('click', () => {
        // Fill in clicked star and stars before it
        for (let i = 0; i <= index; i++) {
            // Change the text content of stars to 'star' (filled)
            document.getElementById(`star${i + 1}`).innerHTML = '<i class="fas fa-star"></i>';
        }
    });
});



function writeReview() {
    console.log("inside write review");
    let stopTitle = document.getElementById("title").value;
    let crowdLevel = document.getElementById("level").value;
    let stopWait = document.getElementById("waiting").value;
    let stopDescription = document.getElementById("description").value;
    let stopTraffic = document.querySelector('input[name="traffic"]:checked').value;
    let busFull = document.querySelector('input[name="full"]:checked').value;

    // Get the star rating
		// Get all the elements with the class "star" and store them in the 'stars' variable
    const stars = document.querySelectorAll('.star');
		// Initialize a variable 'hikeRating' to keep track of the rating count
    let stopRating = 0;
		// Iterate through each element in the 'stars' NodeList using the forEach method
    stars.forEach((star) => {
				// Check if the text content of the current 'star' element is equal to the string 'star'
        if (star.innerHTML === '<i class="fas fa-star"></i>') {
						// If the condition is met, increment the 'hikeRating' by 1
            stopRating++;
        }
    });

    console.log(stopTitle, crowdLevel, stopWait, stopDescription, stopTraffic, busFull, stopRating);

    var user = firebase.auth().currentUser;
    if (user) {
        var currentUser = db.collection("users").doc(user.uid);
        
        // Get the document for the current user.
        db.collection("reviews").add({
            stopName: stopName,
            userID: currentUser,
            userName: user.displayName,
            title: stopTitle,
            crowdLevel: crowdLevel,
            waiting: stopWait,
            description: stopDescription,
            traffic: stopTraffic,
            full: busFull,
            rating: stopRating, // Include the rating in the review
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        }).then(() => {
            window.location.href = "thanks.html"; // Redirect to the thanks page
        });
    } else {
        console.log("No user is signed in");
        window.location.href = 'review.html';
    }
}

