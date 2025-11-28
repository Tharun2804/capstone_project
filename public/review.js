const reviewsList = document.getElementById("reviewsList");
const reviewForm = document.getElementById("reviewForm");
const bookTitleDisplay = document.getElementById("bookTitleDisplay");
const reviewFormContainer = document.getElementById("reviewFormContainer");
const logoutBtn = document.getElementById("logoutBtn");
const backLink = document.getElementById('backLink');

const avgRating = document.getElementById("avgRating");
const totalReviews = document.getElementById("totalReviews");
const avgAccuracy = document.getElementById("avgAccuracy");
const avgClarity = document.getElementById("avgClarity");
const avgRelevance = document.getElementById("avgRelevance");
const avgReferences = document.getElementById("avgReferences");
const statusMessage = document.getElementById("statusMessage");


// Function to parse JWT token
function parseJwt (token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        return null;
    }
}

// Helper function to display a status message
function showStatus(message, type) {
    if (statusMessage) {
        statusMessage.textContent = message;
        statusMessage.className = `alert-message ${type}`;
    }
}

// Check for authentication and set UI based on role
const token = localStorage.getItem("token");
const user = token ? parseJwt(token) : null;
if (!user || user.role !== 'reviewer') {
    if (reviewFormContainer) {
        reviewFormContainer.style.display = 'none';
    }
}

// Update the back link based on user role
if (user) {
    if (user.role === 'reviewer') {
        backLink.href = 'reviewer-dashboard.html';
    } else if (user.role === 'admin') {
        backLink.href = 'index.html';
    }
} else {
    backLink.href = 'public.html';
}

// Get the book ID from the URL
const urlParams = new URLSearchParams(window.location.search);
const textbookId = urlParams.get('id');
if (reviewForm) {
    reviewForm.textbookId.value = textbookId;
}

// Function to fetch book data and reviews
async function fetchBookData() {
    // Fetch book details to display the title
    const bookResponse = await fetch(`http://localhost:3000/books/${textbookId}`);
    const book = await bookResponse.json();
    bookTitleDisplay.textContent = book.title;

    // Fetch reviews and summary
    const reviewsResponse = await fetch(`http://localhost:3000/books/${textbookId}/reviews`);
    const { summary, detailedReviews } = await reviewsResponse.json();

    // Display summary data
    if (summary && summary.total_reviews > 0) {
        avgRating.textContent = parseFloat(summary.avg_rating).toFixed(2);
        totalReviews.textContent = summary.total_reviews;
        avgAccuracy.textContent = parseFloat(summary.avg_accuracy).toFixed(2);
        avgClarity.textContent = parseFloat(summary.avg_clarity).toFixed(2);
        avgRelevance.textContent = parseFloat(summary.avg_relevance).toFixed(2);
        avgReferences.textContent = parseFloat(summary.avg_references_quality).toFixed(2);
    } else {
        document.getElementById('reviewSummary').innerHTML = "<h3>Review Summary</h3><p>No reviews yet.</p>";
    }

    // Display detailed reviews
    reviewsList.innerHTML = "";
    if (detailedReviews.length > 0) {
        detailedReviews.forEach(review => {
            const li = document.createElement("li");
            li.innerHTML = `
                <div>
                    <strong>Reviewer:</strong> ${review.reviewer_name}<br>
                    <strong>Overall Rating:</strong> ${review.rating} / 5<br>
                    <strong>Comments:</strong> ${review.comments}<br>
                    <strong>Scores:</strong> Accuracy: ${review.accuracy}, Clarity: ${review.clarity}, Relevance: ${review.relevance}, References: ${review.references_quality}
                </div>
            `;
            reviewsList.appendChild(li);
        });
    } else {
        reviewsList.innerHTML = "<li>No detailed reviews to display.</li>";
    }
}

// Handle review form submission
if (reviewForm) {
    reviewForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const reviewData = {
            textbook_id: parseInt(textbookId),
            reviewer_name: document.getElementById("reviewerName").value,
            rating: parseInt(document.getElementById("rating").value),
            accuracy: parseInt(document.getElementById("accuracy").value),
            clarity: parseInt(document.getElementById("clarity").value),
            relevance: parseInt(document.getElementById("relevance").value),
            references_quality: parseInt(document.getElementById("referencesQuality").value),
            comments: document.getElementById("comments").value
        };

        const response = await fetch("http://localhost:3000/reviews", {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}` 
            },
            body: JSON.stringify(reviewData),
        });

        if (response.ok) {
            showStatus("Review submitted successfully!", 'success');
            reviewForm.reset();
            fetchBookData(); // Refresh the data
        } else {
            showStatus("Failed to submit review.", 'error');
        }
    });
}

// Add event listener for the logout button
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.href = 'login.html';
    });
}

// Initial fetch
fetchBookData();