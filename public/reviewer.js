const booksUl = document.getElementById("booksUl");
const logoutBtn = document.getElementById("logoutBtn");
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

// Check for authentication on page load
const token = localStorage.getItem("token");
if (!token) {
    window.location.href = "login.html";
} else {
    const user = parseJwt(token);
    if (!user || user.role !== 'reviewer') {
        window.location.href = "index.html";
    }
}

// Function to fetch and display assigned books
async function fetchAssignedBooks() {
    try {
        const response = await fetch("http://localhost:3000/assignments/my-books", {
            headers: { "Authorization": `Bearer ${token}` }
        });

        // Add this check for a successful response status
        if (!response.ok) {
            // The response was not a 2xx status code
            throw new Error('Server response was not ok');
        }

        const books = await response.json();
        
        booksUl.innerHTML = "";
        if (books.length === 0) {
            booksUl.innerHTML = "<li>No books have been assigned to you yet.</li>";
            return;
        }
        
        books.forEach(book => {
            const li = document.createElement("li");
            li.innerHTML = `
                <div>
                    <strong>${book.title}</strong> by ${book.author} (${book.publication_year})
                </div>
                <div class="button-group">
                    <a href="review.html?id=${book.id}">Submit Review</a>
                    ${book.file_path ? `<button onclick="downloadBook('${book.file_path}', '${book.title}')">📥 Download</button>` : ''}
                    <button onclick="readBookOnline(${book.id})" class="read-online-btn">📖 Read Online</button>
                </div>
            `;
            booksUl.appendChild(li);
        });
    } catch (e) {
        showStatus("Failed to fetch assigned books.", 'error');
        console.error("Fetch error:", e); // This will show you the real error in the console
    }
}

// Add event listener for the logout button
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.href = 'login.html';
    });
}

// Function to download book
function downloadBook(filePath, title) {
    const link = document.createElement('a');
    link.href = `/${filePath}`;
    link.download = `${title}.pdf`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Function to read book online
function readBookOnline(bookId) {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Please login first');
        return;
    }
    
    const readUrl = `http://localhost:3000/books/${bookId}/read?token=${token}`;
    window.open(readUrl, '_blank');
}

// Initial fetch
fetchAssignedBooks();