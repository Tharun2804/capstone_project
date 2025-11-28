const booksUl = document.getElementById("booksUl");
const addBookForm = document.getElementById("addBookForm");
const editBookForm = document.getElementById("editBookForm");
const editBookContainer = document.getElementById("editBookContainer");
const cancelEditButton = document.getElementById("cancelEdit");
const logoutBtn = document.getElementById("logoutBtn");
const statusMessage = document.getElementById("statusMessage");

// New variables for the assignment form
const assignForm = document.getElementById("assignForm");
const assignBookSelect = document.getElementById("assignBookSelect");
const assignReviewerSelect = document.getElementById("assignReviewerSelect");


// Function to parse JWT token
function parseJwt (token) {
    try {
        var base64Url = token.split('.')[1];
        var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
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

// Check for authentication on page load
const token = localStorage.getItem("token");
// If there is no token, redirect to the login page immediately.
if (!token) {
    window.location.href = "login.html";
} else {
    const user = parseJwt(token);

    // If the user is a reviewer, redirect them to their dashboard.
    if (user && user.role === 'reviewer') {
        window.location.href = "reviewer-dashboard.html";
    }

    // Now, handle the admin-specific UI for admins only
    if (user && user.role === 'admin') {
        // If an admin is logged in, set up the assignment form
        if (assignForm) {
            setupAssignmentForm();
        }
    } else {
        // Hide forms if the user is not an admin (redundant with the redirect, but good practice)
        if (addBookForm) {
            addBookForm.style.display = 'none';
        }
        if (editBookContainer) {
            editBookContainer.style.display = 'none';
        }
        if (assignForm) {
            assignForm.style.display = 'none';
        }
    }
}

// Function to fetch and display books
async function fetchBooks() {
    const response = await fetch("http://localhost:3000/books");
    const books = await response.json();
    booksUl.innerHTML = "";

    const user = token ? parseJwt(token) : null;
    
    books.forEach(book => {
        const li = document.createElement("li");
        let buttons = `<a href="review.html?id=${book.id}">Review & View Summary</a>`;

        if (user && user.role === 'admin') {
            buttons += `
                <button onclick="handleEditClick(${book.id}, '${book.title}', '${book.author}', ${book.publication_year})">Edit</button>
                <button onclick="handleDeleteClick(${book.id})">Delete</button>
            `;
        }
        
        li.innerHTML = `
            <div>
                <strong>${book.title}</strong> by ${book.author} (${book.publication_year})
            </div>
            <div>
                ${buttons}
            </div>
        `;
        booksUl.appendChild(li);
    });
}

// Function to handle the delete button click
async function handleDeleteClick(bookId) {
    if (confirm("Are you sure you want to delete this book? This will also delete all associated reviews.")) {
        const response = await fetch(`http://localhost:3000/books/${bookId}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (response.ok) {
            showStatus("Book deleted successfully!", 'success');
        } else {
            showStatus("Failed to delete the book.", 'error');
        }
        fetchBooks();
    }
}

// Function to show the edit form with book data
function handleEditClick(bookId, title, author, year) {
    if (editBookContainer && addBookForm) {
        document.getElementById("editBookId").value = bookId;
        document.getElementById("editBookTitle").value = title;
        document.getElementById("editBookAuthor").value = author;
        document.getElementById("editBookYear").value = year;
        editBookContainer.style.display = "block";
        addBookForm.style.display = "none";
    }
}

// Handle form submission to add a new book
if (addBookForm) {
    addBookForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const title = document.getElementById("bookTitle").value;
        const author = document.getElementById("bookAuthor").value;
        const publication_year = document.getElementById("bookYear").value;

        const newBook = { title, author, publication_year };

        const response = await fetch("http://localhost:3000/books", {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(newBook),
        });

        if (response.ok) {
            showStatus("Book added successfully!", 'success');
        } else {
            showStatus("Failed to add book.", 'error');
        }
        
        addBookForm.reset();
        fetchBooks();
    });
}

// Handle edit form submission
if (editBookForm) {
    editBookForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const bookId = document.getElementById("editBookId").value;
        const title = document.getElementById("editBookTitle").value;
        const author = document.getElementById("editBookAuthor").value;
        const publication_year = document.getElementById("editBookYear").value;

        const updatedBook = { title, author, publication_year };

        const response = await fetch(`http://localhost:3000/books/${bookId}`, {
            method: "PUT",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(updatedBook),
        });
        
        if (response.ok) {
            showStatus("Book updated successfully!", 'success');
        } else {
            showStatus("Failed to update book.", 'error');
        }

        editBookContainer.style.display = "none";
        addBookForm.style.display = "block";
        fetchBooks();
    });
}

// Handle cancel button click on the edit form
if (cancelEditButton) {
    cancelEditButton.addEventListener("click", () => {
        editBookContainer.style.display = "none";
        addBookForm.style.display = "block";
    });
}

// Add event listener for the logout button
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.href = 'login.html';
    });
}

// ** NEW FUNCTION: To populate the assignment dropdowns **
async function setupAssignmentForm() {
    // Fetch and populate books dropdown
    const booksResponse = await fetch("http://localhost:3000/books");
    const books = await booksResponse.json();
    books.forEach(book => {
        const option = document.createElement("option");
        option.value = book.id;
        option.textContent = book.title;
        assignBookSelect.appendChild(option);
    });

    // Fetch and populate reviewers dropdown
    const reviewersResponse = await fetch("http://localhost:3000/users/reviewers", {
        headers: { "Authorization": `Bearer ${token}` }
    });
    const reviewers = await reviewersResponse.json();
    reviewers.forEach(reviewer => {
        const option = document.createElement("option");
        option.value = reviewer.id;
        option.textContent = reviewer.username;
        assignReviewerSelect.appendChild(option);
    });
}

// ** NEW EVENT LISTENER: Handle assignment form submission **
if (assignForm) {
    assignForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const textbook_id = assignBookSelect.value;
        const reviewer_id = assignReviewerSelect.value;
        
        const response = await fetch("http://localhost:3000/assignments", {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}` 
            },
            body: JSON.stringify({ textbook_id, reviewer_id }),
        });
        
        if (response.ok) {
            showStatus("Book assigned successfully!", 'success');
        } else {
            showStatus("Failed to assign book.", 'error');
        }
    });
}

// Initial fetch
fetchBooks();