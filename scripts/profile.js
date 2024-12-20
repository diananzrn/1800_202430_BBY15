var currentUser; // Points to the document of the user who is logged in

function populateUserInfo() {
            firebase.auth().onAuthStateChanged(user => {
                // Check if user is signed in:
                if (user) {
                    // Go to the correct user document by referencing to the user uid
                    currentUser = db.collection("users").doc(user.uid)
                    // Get the document for current user
                    currentUser.get()
                        .then(userDoc => {
                            // Get the data fields of the user
                            let userName = userDoc.data().name;
                            let userFavoriteBus = userDoc.data().favorite;
                            let userCity = userDoc.data().city;
                            // If the data fields are not empty, then write them in to the form
                            if (userName != null) {
                                document.getElementById("nameInput").value = userName;
                            }
                            if (userFavoriteBus != null) {
                                document.getElementById("favoriteBusInput").value = userFavoriteBus;
                            }
                            if (userCity != null) {
                                document.getElementById("cityInput").value = userCity;
                            }
                        })
                } else {
                    // No user is signed in.
                    console.log ("No user is signed in");
                }
            });
}

// Call the function to run it 
populateUserInfo();

function editUserInfo() {
    // Enable the form fields
    console.log ("editUserInfo enabled");
    document.getElementById('personalInfoFields').disabled = false;
    const editButton = document.getElementById("editButton");
    const saveButton = document.getElementById("saveButton");
    editButton.style.display = "none"; // Hides the edit button
    saveButton.style.display = "inline-block"; // Displays the save button

 }

 function saveUserInfo() {

        // Get user entered values
        userName = document.getElementById('nameInput').value; // Get the value of the field with id="nameInput"
        userFavoriteBus = document.getElementById('favoriteBusInput').value; // Get the value of the field with id="favoriteBusInput"
        userCity = document.getElementById('cityInput').value; // Get the value of the field with id="cityInput"
        const editButton = document.getElementById("editButton");
        const saveButton = document.getElementById("saveButton");
        const editSeparator = document.getElementById("editSeparator");
        saveButton.style.display = "none"; // Hides the save button
        editSeparator.style.display = "none"; // Hides the edit separator which would make the button look off
        editButton.style.display = "inline-block"; // Displays the edit button

        // Update user's document in Firestore
        currentUser.update({
            name: userName,
            favorite: userFavoriteBus,
            city: userCity,
        })
        .then(() => {
            console.log("Document successfully updated!");
            document.getElementById('personalInfoFields').disabled = true;
        })
}

function logout() {
    firebase.auth().signOut()
    .then(() => {
        // Refreshes the page, doing so returns the login.
        window.location.href = "login.html";
    })
    .catch((error) => {
        // Error message in case of any issue.
        console.error("Error logging out:", error);
    });
}


