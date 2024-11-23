const searchInput = document.getElementById('searchInput');
const suggestionsContainer = document.getElementById('suggestions');

// Function to fetch bus stops from Firestore and filter based on query
function fetchBusStops(query) {
    console.log("Fetching bus stops..."); // Debugging: Check if function is called

    suggestionsContainer.innerHTML = ''; // Clear previous suggestions

    if (query.trim()) {
        // Fetch stops from Firestore
        db.collection("stops")
            .get()
            .then(snapshot => {
                console.log(`Snapshot length: ${snapshot.docs.length}`);  // Debugging: Check how many docs are in the collection

                const filteredSuggestions = [];

                snapshot.forEach(doc => {
                    const stopName = doc.data().name.toLowerCase();
                    if (stopName.includes(query.toLowerCase())) {
                        filteredSuggestions.push({
                            name: doc.data().name,
                            id: doc.id
                        });
                    }
                });

                console.log("Filtered suggestions:", filteredSuggestions);  // Debugging: Log filtered suggestions

                if (filteredSuggestions.length > 0) {
                    filteredSuggestions.forEach(item => {
                        const suggestionElement = document.createElement('div');
                        suggestionElement.classList.add('autocomplete-suggestion');
                        suggestionElement.textContent = item.name;
                        suggestionElement.setAttribute('data-source', 'search'); // Set the source as 'search'

                        // Add click event to auto-fill input and store the selected stop in localStorage
                        suggestionElement.addEventListener('click', function(event) {
                            event.preventDefault();
                            searchInput.value = item.name; // Set input value to the selected suggestion
                            suggestionsContainer.innerHTML = ''; // Clear suggestions
                            
                            // Store selected stop data and source
                            const stopData = { name: item.name, id: item.id, source: 'search' };
                            localStorage.setItem('selectedStop', JSON.stringify(stopData)); // Store selected stop data
                            
                            // Redirect to the stop page
                            window.location.href = "stop.html";
                        });

                        suggestionsContainer.appendChild(suggestionElement);
                    });

                    console.log('Displaying suggestions'); // Debugging: Check if suggestions are displayed
                    suggestionsContainer.style.display = 'block'; // Show the suggestions
                } else {
                    console.log('No matching suggestions'); // Debugging: If no matches found
                    suggestionsContainer.style.display = 'none'; // Hide suggestions if no matches
                }
            })
            .catch(error => {
                console.error("Error getting documents: ", error); // Debugging: Log Firestore error
                suggestionsContainer.style.display = 'none'; // Hide suggestions if there's an error
            });
    } else {
        suggestionsContainer.style.display = 'none'; // Hide suggestions if query is empty
    }
}

// Event listener for the search input field to trigger suggestions based on user input
searchInput.addEventListener('keyup', function() {
    console.log("Keyup detected"); // Debugging: Check if keyup event is fired
    const query = searchInput.value.toLowerCase().trim();
    fetchBusStops(query); // Call the function to fetch bus stops based on the query
});

// Hide suggestions when clicking outside the search input or suggestions container
document.addEventListener('click', function(event) {
    if (!searchInput.contains(event.target) && !suggestionsContainer.contains(event.target)) {
        suggestionsContainer.style.display = 'none'; // Hide suggestions if clicked outside
    }
});
