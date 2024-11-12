// Function to store the stop name dynamically
function storeStopName(stopElement) {
    // Extract the bus stop name from the clicked element (using textContent or innerText)
    const stopName = stopElement.textContent || stopElement.innerText;

    // Store the stop name in localStorage
    localStorage.setItem('busStopName', stopName);

    // Redirect to the stop.html page
    window.location.href = 'stop.html';
}

// Function to retrieve the stop name and display it on stop.html
function displayStopName() {
    // Retrieve the bus stop name from localStorage
    const stopName = localStorage.getItem('busStopName');

    // Display the stop name in the "name" element on the stop.html page
    if (stopName) {
        document.getElementById('name').textContent = stopName;
    } else {
        document.getElementById('name').textContent = "No bus stop selected";  // Fallback if no stop is selected
    }
}

// Run displayStopName when the stop.html page loads to show the stored stop name
window.onload = displayStopName;
