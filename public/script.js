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

// Function to fetch and display reviewer applications
async function fetchReviewerApplications() {
    const applicationsUl = document.getElementById("applicationsUl");
    const loadingDiv = document.getElementById("applicationsLoading");
    const noApplicationsDiv = document.getElementById("noApplications");
    
    if (!applicationsUl) return;
    
    try {
        console.log('Fetching reviewer applications...');
        const response = await fetch("http://localhost:3000/admin/reviewer-applications", {
            headers: { "Authorization": `Bearer ${token}` }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const applications = await response.json();
        console.log('Reviewer applications:', applications);
        
        // Hide loading
        if (loadingDiv) loadingDiv.style.display = 'none';
        
        applicationsUl.innerHTML = "";

        if (applications.length === 0) {
            if (noApplicationsDiv) noApplicationsDiv.style.display = 'block';
            return;
        }
        
        if (noApplicationsDiv) noApplicationsDiv.style.display = 'none';

        applications.forEach(app => {
            const li = document.createElement("li");
            li.style.cssText = 'border: 1px solid #ddd; padding: 15px; margin: 10px 0; border-radius: 5px; background: #f9f9f9;';
            
            const statusBadge = app.application_status === 'pending' ? 
                '<span style="background: orange; color: white; padding: 3px 8px; border-radius: 3px; font-size: 12px;">PENDING</span>' :
                app.application_status === 'approved' ? 
                '<span style="background: green; color: white; padding: 3px 8px; border-radius: 3px; font-size: 12px;">APPROVED</span>' :
                '<span style="background: red; color: white; padding: 3px 8px; border-radius: 3px; font-size: 12px;">REJECTED</span>';
            
            let actionButtons = '';
            if (app.application_status === 'pending') {
                actionButtons = `
                    <div style="margin-top: 10px;">
                        <button onclick="approveReviewer(${app.id})" style="background-color: #27ae60; color: white; padding: 8px 15px; border: none; border-radius: 3px; margin-right: 5px; cursor: pointer;">✓ Approve</button>
                        <button onclick="rejectReviewer(${app.id})" style="background-color: #e74c3c; color: white; padding: 8px 15px; border: none; border-radius: 3px; cursor: pointer;">✗ Reject</button>
                    </div>
                `;
            }
            
            const proofDocs = app.proof_documents ? 
                app.proof_documents.split(',').map(doc => 
                    `<a href="/uploads/${doc}" target="_blank" style="color: #3498db; text-decoration: underline;">${doc}</a>`
                ).join(', ') : '<em>No documents uploaded</em>';
            
            li.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div style="flex: 1;">
                        <h4 style="margin: 0 0 10px 0; color: #2c3e50;">${app.username} ${statusBadge}</h4>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 5px; font-size: 14px;">
                            <div><strong>Qualification:</strong> ${app.educational_qualification || 'N/A'}</div>
                            <div><strong>Specialization:</strong> ${app.specialization || 'N/A'}</div>
                            <div><strong>Experience:</strong> ${app.years_experience || 0} years</div>
                            <div><strong>Type:</strong> ${app.reviewer_type || 'N/A'}</div>
                            <div><strong>Designation:</strong> ${app.current_designation || 'N/A'}</div>
                            <div><strong>Institution:</strong> ${app.current_institution || 'N/A'}</div>
                        </div>
                        <div style="margin-top: 8px; font-size: 13px;">
                            <strong>Documents:</strong> ${proofDocs}
                        </div>
                        <div style="margin-top: 5px; font-size: 12px; color: #666;">
                            <strong>Applied:</strong> ${new Date(app.created_at).toLocaleDateString()}
                        </div>
                        ${actionButtons}
                    </div>
                </div>
            `;
            applicationsUl.appendChild(li);
        });
    } catch (error) {
        console.error('Error fetching reviewer applications:', error);
        if (loadingDiv) {
            loadingDiv.innerHTML = 'Error loading applications: ' + error.message;
            loadingDiv.style.color = 'red';
        }
        showStatus('Error loading reviewer applications: ' + error.message, 'error');
    }
}

// Function to approve reviewer
async function approveReviewer(reviewerId) {
    try {
        const response = await fetch(`http://localhost:3000/admin/reviewer-applications/${reviewerId}/approve`, {
            method: "PUT",
            headers: { "Authorization": `Bearer ${token}` }
        });
        
        if (response.ok) {
            showStatus("Reviewer approved successfully!", 'success');
            fetchReviewerApplications();
        } else {
            showStatus("Failed to approve reviewer.", 'error');
        }
    } catch (error) {
        showStatus("Error approving reviewer.", 'error');
    }
}

// Function to reject reviewer
async function rejectReviewer(reviewerId) {
    const reason = prompt("Please provide a reason for rejection:");
    if (!reason) return;
    
    try {
        const response = await fetch(`http://localhost:3000/admin/reviewer-applications/${reviewerId}/reject`, {
            method: "PUT",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}` 
            },
            body: JSON.stringify({ rejectionReason: reason })
        });
        
        if (response.ok) {
            showStatus("Reviewer rejected.", 'success');
            fetchReviewerApplications();
        } else {
            showStatus("Failed to reject reviewer.", 'error');
        }
    } catch (error) {
        showStatus("Error rejecting reviewer.", 'error');
    }
}

// Make functions globally available
window.approveReviewer = approveReviewer;
window.rejectReviewer = rejectReviewer;

// Initial fetch
fetchBooks();
if (token && parseJwt(token)?.role === 'admin') {
    console.log('Admin detected, loading reviewer applications...');
    fetchReviewerApplications();
} else {
    console.log('Not admin or no token, skipping reviewer applications');
}