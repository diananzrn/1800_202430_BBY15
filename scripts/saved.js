// saved.js

// Function to handle bus stop click
function handleBusStopClick(event) {
    const stopNumber = event.currentTarget.getAttribute('data-stop'); // Get the stop number from the data attribute
    console.log(`Clicked on Bus Stop ${stopNumber}`); // Log the stop number to the console
}

// Wait until the document is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Get all bus stop containers
    const busStops = document.querySelectorAll('.favorite');

    // Add click event listener to each bus stop container
    busStops.forEach(busStop => {
        busStop.addEventListener('click', handleBusStopClick);
    });
});

