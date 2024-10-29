// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAlRppEWh0F9rhyQnkYn2QTQ6BkBgrmkrA",
    authDomain: "comp1800-dab60.firebaseapp.com",
    projectId: "comp1800-dab60",
    storageBucket: "comp1800-dab60.appspot.com",
    messagingSenderId: "513871194770",
    appId: "1:513871194770:web:64c2bc151fd92cead9144b"
  };
  
  //--------------------------------------------
  // initialize the Firebase app
  // initialize Firestore database if using it
  //--------------------------------------------
  const app = firebase.initializeApp(firebaseConfig);
  const db = firebase.firestore();
  const storage = firebase.storage();
  