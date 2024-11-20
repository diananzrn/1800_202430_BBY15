var currentUser;               //points to the document of the user who is logged in

function populateUserInfo() {
            firebase.auth().onAuthStateChanged(user => {
                // Check if user is signed in:
                if (user) {
                    //go to the correct user document by referencing to the user uid
                    currentUser = db.collection("users").doc(user.uid)
                    //get the document for current user.
                    currentUser.get()
                        .then(userDoc => {
                            //get the data fields of the user
                            let userName = userDoc.data().name;
                            let userFavoriteBus = userDoc.data().favorite;
                            let userCity = userDoc.data().city;
                            //if the data fields are not empty, then write them in to the form.
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

//call the function to run it 
populateUserInfo();

function editUserInfo() {
    //Enable the form fields
    console.log ("editUserInfo enabled");
    document.getElementById('personalInfoFields').disabled = false;
 }

 function saveUserInfo() {

        // get user entered values
        userName = document.getElementById('nameInput').value;       // get the value of the field with id="nameInput"
        userFavoriteBus = document.getElementById('favoriteBusInput').value;     // get the value of the field with id="favoriteBusInput"
        userCity = document.getElementById('cityInput').value;       // get the value of the field with id="cityInput"
        
        // update user's document in Firestore
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