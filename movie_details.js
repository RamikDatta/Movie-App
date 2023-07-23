const apiKey = "638b344e";
const movieDetailsContainer = document.getElementById("movie-details");
const starRatingContainer = document.getElementById("star-rating");
const commentInput = document.getElementById("comment");
const commentButton = document.getElementById("comment-button");

// Function to fetch movie details from OMDB API based on IMDb ID
async function fetchMovieDetails(imdbId) {
    try {
        const response = await fetch(`https://www.omdbapi.com/?i=${imdbId}&apikey=${apiKey}`);
        const data = await response.json();

        if (data.Response === "True") {
            // Create movie details content
            const detailsContent = `
                <img src="${data.Poster === "N/A" ? "placeholder.png" : data.Poster}" class="movie-poster">
                <div class="movie-info">
                    <h2>${data.Title}</h2>
                    <p><strong>Year:</strong> ${data.Year}</p>
                    <p><strong>Genre:</strong> ${data.Genre}</p>
                    <p><strong>Director:</strong> ${data.Director}</p>
                    <p><strong>Actors:</strong> ${data.Actors}</p>
                    <p><strong>Plot:</strong></p>
                    <p class="movie-plot">${data.Plot}</p>
                    <div class="user-ratings">
                        <p><strong>Average Rating:</strong> <span id="average-rating">Not rated yet</span></p>
                        <p><strong>Your Rating:</strong> <span id="user-rating">Not rated yet</span></p>
                    </div>
                    <div class="user-comments">
                        <p><strong>Your Comment:</strong></p>
                        <ul id="comment-list">
                            <!-- User comments will be dynamically added here -->
                        </ul>
                    </div>
                </div>
            `;

            // Display movie details
            movieDetailsContainer.innerHTML = detailsContent;

            // Load user rating and comments from local storage
            loadUserRatingAndComments(imdbId);

            // Add event listeners for star ratings
            const stars = document.querySelectorAll(".star");
            stars.forEach(star => {
                star.addEventListener("click", () => {
                    const rating = parseInt(star.dataset.value);
                    saveUserRating(imdbId, rating);
                });
            });

            // Add event listener for comment submission
            commentButton.addEventListener("click", () => {
                const comment = commentInput.value;
                saveUserComment(imdbId, comment);
            });
        } else {
            console.error("Error fetching movie details:", data.Error);
        }
    } catch (error) {
        console.error("Error fetching movie details:", error);
    }
}

function calculateAverageRating(imdbId) {
    const userRatings = JSON.parse(localStorage.getItem(`ratings_${imdbId}`)) || [];
    const totalRatings = userRatings.length;
    if (totalRatings === 0) {
        return 0;
    }
    const sumRatings = userRatings.reduce((sum, rating) => sum + rating, 0);
    return Math.round(sumRatings / totalRatings);
}

function loadUserRatingAndComments(imdbId) {
    const userRating = getUserRating(imdbId);
    const userComment = getUserComment(imdbId);
    const averageRating = calculateAverageRating(imdbId);

    // Display average rating as stars
    const averageRatingElement = document.getElementById("average-rating");
    averageRatingElement.textContent = averageRating ? averageRating + " stars" : "Not rated yet";

    // Display user rating as stars
    const userRatingElement = document.getElementById("user-rating");
    userRatingElement.textContent = userRating ? userRating + " stars" : "Not rated yet";

    // Display user comments
    const commentList = document.getElementById("comment-list");
    commentList.innerHTML = ""; // Clear previous comments

    const userComments = JSON.parse(localStorage.getItem(`comments_${imdbId}`)) || [];
    userComments.forEach(comment => {
        const commentItem = document.createElement("li");
        commentItem.textContent = comment;
        commentList.appendChild(commentItem);
    });
}

function saveUserRating(imdbId, rating) {
    const userRatings = JSON.parse(localStorage.getItem(`ratings_${imdbId}`)) || [];
    userRatings.push(rating);
    localStorage.setItem(`ratings_${imdbId}`, JSON.stringify(userRatings));

    loadUserRatingAndComments(imdbId);
}

function getUserRating(imdbId) {
    const userRatings = JSON.parse(localStorage.getItem(`ratings_${imdbId}`)) || [];
    if (userRatings.length === 0) {
        return 0;
    }
    const sumRatings = userRatings.reduce((sum, rating) => sum + rating, 0);
    return Math.round(sumRatings / userRatings.length);
}

function saveUserComment(imdbId, comment) {
    if (comment.trim() !== "") {
        const userComments = JSON.parse(localStorage.getItem(`comments_${imdbId}`)) || [];
        userComments.push(comment);
        localStorage.setItem(`comments_${imdbId}`, JSON.stringify(userComments));
        commentInput.value = ""; // Clear comment input after saving
        loadUserRatingAndComments(imdbId);
    } else {
        alert("Please enter a valid comment.");
    }
}

function getUserComment(imdbId) {
    const userComments = JSON.parse(localStorage.getItem(`comments_${imdbId}`)) || [];
    return userComments;
}

// Get the IMDb ID from the URL parameter
const urlParams = new URLSearchParams(window.location.search);
const imdbId = urlParams.get("imdbId");

// Fetch and display movie details
fetchMovieDetails(imdbId);
