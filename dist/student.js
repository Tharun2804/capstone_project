// student.js

// Get the HTML elements to manipulate
const booksList = document.getElementById("booksList");
const logoutBtn = document.getElementById("logoutBtn");

// Helper function to parse JWT token (same as your other files)
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

// Check for authentication and role on page load
const token = localStorage.getItem("token");
if (!token) {
    window.location.href = "login.html"; // Redirect if no token
} else {
    const user = parseJwt(token);
    if (!user || user.role !== 'student') {
        // Redirect if user is not a student
        localStorage.removeItem('token'); 
        window.location.href = "login.html";
    }
}

// Fetch and display the list of books, including review summaries
async function fetchBooksWithSummaries() {
    try {
        const booksResponse = await fetch("http://localhost:3000/books");
        if (!booksResponse.ok) {
            throw new Error('Failed to fetch books');
        }
        const books = await booksResponse.json();

        booksList.innerHTML = "";
        if (books.length === 0) {
            booksList.innerHTML = "<p>No books available yet.</p>";
            return;
        }

        const booksWithSummaries = await Promise.all(
            books.map(async book => {
                try {
                    const reviewsResponse = await fetch(`http://localhost:3000/books/${book.id}/reviews`);
                    const { summary } = await reviewsResponse.json();
                    return {
                        ...book,
                        summary
                    };
                } catch (error) {
                    console.error(`Error fetching reviews for book ID ${book.id}:`, error);
                    return { ...book, summary: null };
                }
            })
        );

        booksWithSummaries.forEach(book => {
            const bookItem = document.createElement("div");
            bookItem.classList.add("book-item");
            const summaryText = book.summary && book.summary.avg_rating 
                ? `(Avg Rating: ${parseFloat(book.summary.avg_rating).toFixed(2)}/5)`
                : "(No reviews)";

            bookItem.innerHTML = `
                <h3>${book.title}</h3>
                <p><strong>Author:</strong> ${book.author}</p>
                <p><strong>Year:</strong> ${book.publication_year}</p>
                <p>${book.description}</p>
                <p>${summaryText}</p>
                <div>
                    <a href="review.html?id=${book.id}">View Reviews</a>
                </div>
            `;
            booksList.appendChild(bookItem);
        });

    } catch (error) {
        console.error("Error fetching books:", error);
        booksList.innerHTML = "<p class='error-message'>Failed to load books. Please try again later.</p>";
    }
}

// Call the function to load books when the page loads
fetchBooksWithSummaries();

// Handle logout
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.href = 'login.html';
    });
}