//-----------------------------------------------------
// Add pin for showing where the user is with a custom icon
//------------------------------------------------------

// Load the pin image for the map
function loadPinImage(map) {
    map.loadImage(
        'https://cdn3.iconfinder.com/data/icons/infrastructure-isometric-1/512/g6007-512.png',
        (error, image) => {
            if (error) throw error;
            map.addImage('eventpin', image); // Pin Icon
            loadEventData(map);
        }
    );
}

// Read events from Firestore and process them into features
function loadEventData(map) {
    db.collection('stops').get().then(allEvents => {
        const features = allEvents.docs.map(doc => createFeature(doc));
        addEventSourceAndLayer(map, features);
    });
}

// Create feature for each event
function createFeature(doc) {
    const { lat, lng, name, details } = doc.data();
    const coordinates = [lng, lat];
    const description = `<strong>${name}</strong><p>${details}</p><br><a href="/hike.html?id=${doc.id}" target="_blank" title="Opens in a new window">Read more</a>`;
    return {
        'type': 'Feature',
        'properties': { 'description': description },
        'geometry': { 'type': 'Point', 'coordinates': coordinates }
    };
}

// Add event source and layer to the map
function addEventSourceAndLayer(map, features) {
    map.addSource('places', {
        'type': 'geojson',
        'data': { 'type': 'FeatureCollection', 'features': features }
    });

    map.addLayer({
        'id': 'places',
        'type': 'symbol',
        'source': 'places',
        'layout': {
            'icon-image': 'eventpin', 
            'icon-size': 0.1,
            'icon-allow-overlap': true
        }
    });

    setupEventInteractions(map);
}

// Set up interactions for pins (click and hover events)
function setupEventInteractions(map) {
    map.on('click', 'places', (e) => showPopup(map, e));
    map.on('mouseenter', 'places', () => map.getCanvas().style.cursor = 'pointer');
    map.on('mouseleave', 'places', () => map.getCanvas().style.cursor = '');
}

// Show popup when a pin is clicked
function showPopup(map, e) {
    const coordinates = e.features[0].geometry.coordinates.slice();
    const description = e.features[0].properties.description;
    while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
    }
    new mapboxgl.Popup().setLngLat(coordinates).setHTML(description).addTo(map);
}

// Main function to add pins to the map
function addPins(map) {
    loadPinImage(map);
}





function initializeMap() {
    mapboxgl.accessToken = 'pk.eyJ1IjoiZGlhbmFuenJuIiwiYSI6ImNtM2RnY3c4MzAyeXoya3B6M3VlbXd0Z2UifQ.hz7VMCJ7LWbx5mOljlF4IA';
    return new mapboxgl.Map({
        container: 'map', 
        style: 'mapbox://styles/mapbox/streets-v11', 
        center: [-122.964274, 49.236082], 
        zoom: 14
    });
}

function addMapControls(map) {
    map.addControl(new mapboxgl.NavigationControl());
}

function setupMapLoadListener(map) {
    map.on('load', () => {
        addPins(map);
        addUserPinCustomImage(map);
    });
}

function showMap() {
    const map = initializeMap();
    addMapControls(map);
    setupMapLoadListener(map);
}

showMap();   // Initialize map

function addUserPinCustomImage(map) {
    map.loadImage(
        'https://cdn0.iconfinder.com/data/icons/user-75/512/location-user-account-member-map-512.png',
        (error, image) => {
            if (error) throw error;
            map.addImage('userpin', image, { width: 10, height: 10 });
            addUserLocationSource(map);
        }
    );
}

function addUserLocationSource(map) {
    navigator.geolocation.getCurrentPosition(position => {
        const userLocation = [position.coords.longitude, position.coords.latitude];
        if (userLocation) {
            map.setCenter(userLocation);
            map.addSource('userLocation', createUserGeoJson(userLocation));
            addUserLocationLayer(map);
            addUserLocationPopup(map);
            addUserLocationCursor(map);
        }
    });
}

function createUserGeoJson(userLocation) {
    return {
        'type': 'geojson',
        'data': {
            'type': 'FeatureCollection',
            'features': [{
                'type': 'Feature',
                'geometry': { 'type': 'Point', 'coordinates': userLocation },
                'properties': { 'description': 'Your location' }
            }]
        }
    };
}

function addUserLocationLayer(map) {
    map.addLayer({
        'id': 'userLocation',
        'type': 'symbol',
        'source': 'userLocation',
        'layout': {
            'icon-image': 'userpin', 
            'icon-size': 0.07, 
            'icon-allow-overlap': true 
        }
    });
}

function addUserLocationPopup(map) {
    map.on('click', 'userLocation', (e) => {
        const coordinates = e.features[0].geometry.coordinates.slice();
        const description = e.features[0].properties.description;
        new mapboxgl.Popup()
            .setLngLat(coordinates)
            .setHTML(description)
            .addTo(map);
    });
}

function addUserLocationCursor(map) {
    map.on('mouseenter', 'userLocation', () => {
        map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', 'userLocation', () => {
        map.getCanvas().style.cursor = '';
    });
}


