const searchInput = document.getElementById('searchInput');
const suggestionsContainer = document.getElementById('suggestions');

// Function to fetch bus stops from Firestore and filter based on query
function fetchBusStops(query) {
    suggestionsContainer.innerHTML = ''; // Clear previous suggestions

    if (query.trim()) {
        // Fetch stops from Firestore
        db.collection("stops")
            .get()
            .then(snapshot => {
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

                // Display suggestions
                if (filteredSuggestions.length > 0) {
                    filteredSuggestions.forEach(item => {
                        const suggestionElement = document.createElement('div');
                        suggestionElement.classList.add('autocomplete-suggestion');
                        suggestionElement.textContent = item.name;

                        // Add click event to redirect to stop.html with the selected stop ID
                        suggestionElement.addEventListener('click', function() {
                            localStorage.setItem('busStopName', item.name); // Store stop name
                            window.location.href = `stop.html?id=${item.id}`; // Redirect to stop page
                        });

                        suggestionsContainer.appendChild(suggestionElement);
                    });
                    suggestionsContainer.style.display = 'block'; // Show the suggestions
                } else {
                    suggestionsContainer.style.display = 'none'; // Hide suggestions if no matches
                }
            })
            .catch(error => {
                console.error("Error getting documents: ", error);
                suggestionsContainer.style.display = 'none'; // Hide suggestions if there's an error
            });
    } else {
        suggestionsContainer.style.display = 'none'; // Hide suggestions if query is empty
    }
}

// Event listener for the search input field to trigger suggestions based on user input
searchInput.addEventListener('keyup', function() {
    const query = searchInput.value.toLowerCase().trim();
    fetchBusStops(query); // Call the function to fetch bus stops based on the query
});

// Hide suggestions when clicking outside the search input or suggestions container
document.addEventListener('click', function(event) {
    if (!searchInput.contains(event.target) && !suggestionsContainer.contains(event.target)) {
        suggestionsContainer.style.display = 'none'; // Hide suggestions if clicked outside
    }
});