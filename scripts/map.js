//-----------------------------------------------------
// Add pin for showing where the user is with a custom icon
//------------------------------------------------------

function addHikePins(map) {
    map.loadImage(
        'https://cdn3.iconfinder.com/data/icons/infrastructure-isometric-1/512/g6007-512.png',
        (error, image) => {
            if (error) throw error;

            // Add the image to the map style.
            map.addImage('eventpin', image); // Pin Icon

            // READING information from "events" collection in Firestore
            db.collection('stops').get().then(allEvents => {
                const features = []; // Defines an empty array for information to be added to

                allEvents.forEach(doc => {
                    lat = doc.data().lat;
                    lng = doc.data().lng;
                    console.log(lat, lng);
                    coordinates = [lng, lat];
                    console.log(coordinates);
                    // Coordinates
                    event_name = doc.data().name; // Event Name
                    preview = doc.data().details; // Text Preview
                    // img = doc.data().posterurl; // Image
                    // url = doc.data().link; // URL

                    // Pushes information into the features array
                    features.push({
                        'type': 'Feature',
                        'properties': {
                            'description':
                                `<strong>${event_name}</strong><p>${preview}</p> 
                            <br> <a href="/hike.html?id=${doc.id}" target="_blank" 
                            title="Opens in a new window">Read more</a>`
                        },
                        'geometry': {
                            'type': 'Point',
                            'coordinates': coordinates
                        }
                    });
                });

                // Adds features (in our case, pins) to the map
                // "places" is the name of this array of features
                map.addSource('places', {
                    'type': 'geojson',
                    'data': {
                        'type': 'FeatureCollection',
                        'features': features
                    }
                });

                // Creates a layer above the map displaying the pins
                map.addLayer({
                    'id': 'places',
                    'type': 'symbol',
                    'source': 'places',
                    'layout': {
                        'icon-image': 'eventpin', // Pin Icon
                        'icon-size': 0.1, // Pin Size
                        'icon-allow-overlap': true // Allows icons to overlap
                    }
                });

                // When one of the "places" markers are clicked,
                // create a popup that shows information 
                // Everything related to a marker is save in features[] array
                map.on('click', 'places', (e) => {
                    // Copy coordinates array.
                    const coordinates = e.features[0].geometry.coordinates.slice();
                    const description = e.features[0].properties.description;

                    // Ensure that if the map is zoomed out such that multiple 
                    // copies of the feature are visible, the popup appears over 
                    // the copy being pointed to.
                    while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
                    }

                    new mapboxgl.Popup()
                        .setLngLat(coordinates)
                        .setHTML(description)
                        .addTo(map);
                });

                // Change the cursor to a pointer when the mouse is over the places layer.
                map.on('mouseenter', 'places', () => {
                    map.getCanvas().style.cursor = 'pointer';
                });

                // Defaults cursor when not hovering over the places layer
                map.on('mouseleave', 'places', () => {
                    map.getCanvas().style.cursor = '';
                });
            });
        }
    );
}



function showMap() {
    //------------------------------------------
    // Defines and initiates basic mapbox data
    //------------------------------------------
    // TO MAKE THE MAP APPEAR YOU MUST
    // ADD YOUR ACCESS TOKEN FROM
    // https://account.mapbox.com
    mapboxgl.accessToken = 'pk.eyJ1IjoiZGlhbmFuenJuIiwiYSI6ImNtM2RnY3c4MzAyeXoya3B6M3VlbXd0Z2UifQ.hz7VMCJ7LWbx5mOljlF4IA';
    const map = new mapboxgl.Map({
        container: 'map', // Container ID
        style: 'mapbox://styles/mapbox/streets-v11', // Styling URL
        center: [-122.964274, 49.236082], // Starting position
        zoom: 14 // Starting zoom
    });


    // Add user controls to map, zoom bar
    map.addControl(new mapboxgl.NavigationControl());

    //------------------------------------------------
    // Add listener for when the map finishes loading.
    // After loading, we can add map features
    //------------------------------------------------
    map.on('load', () => {

        //---------------------------------
        // Add interactive pins for the hikes
        //---------------------------------
        addHikePins(map);

        //--------------------------------------
        // Add interactive pin for the user's location
        //--------------------------------------
        addUserPinCustomImage(map);

    });
}

showMap();   // Call it! 

//-----------------------------------------------------
// Add pin for showing where the user is.
// This is a separate function so that we can use a different
// looking pin for the user
//------------------------------------------------------
function addUserPinCustomImage(map) {
    map.loadImage(
        'https://cdn0.iconfinder.com/data/icons/user-75/512/location-user-account-member-map-512.png',
        (error, image) => {
            if (error) throw error;

            // Add the image to the map style with width and height values
            map.addImage('userpin', image, {
                width: 10,
                height: 10
            });

            // Adds user's current location as a source to the map
            navigator.geolocation.getCurrentPosition(position => {
                const userLocation = [position.coords.longitude, position.coords.latitude];
                console.log(userLocation);
                if (userLocation) {
                    // If we got a user location, center the map there
                    
                    map.setCenter(userLocation);
                    map.addSource('userLocation', {
                        'type': 'geojson',
                        'data': {
                            'type': 'FeatureCollection',
                            'features': [{
                                'type': 'Feature',
                                'geometry': {
                                    'type': 'Point',
                                    'coordinates': userLocation
                                },
                                'properties': {
                                    'description': 'Your location'
                                }
                            }]
                        }
                    });


                    // Creates a layer above the map displaying the user's location
                    map.addLayer({
                        'id': 'userLocation',
                        'type': 'symbol',
                        'source': 'userLocation',
                        'layout': {
                            'icon-image': 'userpin', // Pin Icon
                            'icon-size': 0.07, // Pin Size
                            'icon-allow-overlap': true // Allows icons to overlap
                        }
                    });

                    // Map On Click function that creates a popup displaying the user's location
                    map.on('click', 'userLocation', (e) => {
                        // Copy coordinates array.
                        const coordinates = e.features[0].geometry.coordinates.slice();
                        const description = e.features[0].properties.description;

                        new mapboxgl.Popup()
                            .setLngLat(coordinates)
                            .setHTML(description)
                            .addTo(map);
                    });

                    // Change the cursor to a pointer when the mouse is over the userLocation layer.
                    map.on('mouseenter', 'userLocation', () => {
                        map.getCanvas().style.cursor = 'pointer';
                    });

                    // Defaults
                    // Defaults cursor when not hovering over the userLocation layer
                    map.on('mouseleave', 'userLocation', () => {
                        map.getCanvas().style.cursor = '';
                    });
                }
            });
        })
}

