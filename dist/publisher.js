const addBookForm = document.getElementById("addBookForm");
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
    if (!user || user.role !== 'publisher') {
        window.location.href = "index.html"; // Redirect non-publishers
    }
}

// // Handle form submission
// if (addBookForm) {
//     addBookForm.addEventListener("submit", async (e) => {
//         e.preventDefault();
//         showStatus("Checking for plagiarism...", 'info');

//         // Manually create FormData to ensure all fields are included
//         const formData = new FormData();
//         const bookFile = document.getElementById("bookFile").files[0];
//         const bookTitle = document.getElementById("bookTitle").value;
//         const bookAuthor = document.getElementById("bookAuthor").value;
//         const bookYear = document.getElementById("bookYear").value;
//         const bookDescription = document.getElementById("bookDescription").value; // This was missing

//         formData.append("file", bookFile);
//         formData.append("title", bookTitle);
//         formData.append("author", bookAuthor);
//         formData.append("publication_year", bookYear);
//         formData.append("description", bookDescription); // Append the description

//         // First, call the mock plagiarism check
//         try {
//             const checkResponse = await fetch("http://localhost:3000/plagiarism-check", {
//                 method: "POST",
//                 headers: { 
//                     "Authorization": `Bearer ${token}` 
//                 },
//                 body: formData,
//             });

//             if (checkResponse.ok) {
//                 showStatus("Plagiarism check passed. Uploading file...", 'success');
                
//                 // If check passes, proceed with file upload
//                 const uploadResponse = await fetch("http://localhost:3000/books", {
//                     method: "POST",
//                     headers: { 
//                         "Authorization": `Bearer ${token}` 
//                     },
//                     body: formData,
//                 });
                
//                 if (uploadResponse.ok) {
//                     showStatus("Book uploaded successfully!", 'success');
//                     addBookForm.reset();
//                 } else {
//                     const error = await uploadResponse.json();
//                     showStatus(`Upload failed: ${error.message}`, 'error');
//                 }
//             } else {
//                 const error = await checkResponse.json();
//                 showStatus(`Plagiarism check failed: ${error.message}`, 'error');
//             }
//         } catch (e) {
//             showStatus("Network error. Please try again.", 'error');
//         }
//     });
// }
// In publisher.js
// ... (existing code) ...

// Handle form submission
if (addBookForm) {
    addBookForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        showStatus("Checking for plagiarism...", 'info');
        
        // --- Create a separate FormData for the plagiarism check ---
        const checkFormData = new FormData();
        checkFormData.append("file", document.getElementById("bookFile").files[0]);

        // First, call the mock plagiarism check
        try {
            const checkResponse = await fetch("http://localhost:3000/plagiarism-check", {
                method: "POST",
                headers: { 
                    "Authorization": `Bearer ${token}` 
                },
                body: checkFormData, // Send only the file
            });

            if (checkResponse.ok) {
                showStatus("Plagiarism check passed. Uploading book data...", 'success');
                
                // --- Now, prepare a new FormData for the book upload ---
                const uploadFormData = new FormData();
                uploadFormData.append("file", document.getElementById("bookFile").files[0]);
                uploadFormData.append("title", document.getElementById("bookTitle").value);
                uploadFormData.append("author", document.getElementById("bookAuthor").value);
                uploadFormData.append("publication_year", document.getElementById("bookYear").value);
                uploadFormData.append("description", document.getElementById("bookDescription").value);

                // Proceed with file upload
                const uploadResponse = await fetch("http://localhost:3000/books", {
                    method: "POST",
                    headers: { 
                        "Authorization": `Bearer ${token}` 
                    },
                    body: uploadFormData,
                });
                
                if (uploadResponse.ok) {
                    showStatus("Book uploaded successfully!", 'success');
                    addBookForm.reset();
                } else {
                    const error = await uploadResponse.json();
                    showStatus(`Upload failed: ${error.message}`, 'error');
                }
            } else {
                const error = await checkResponse.json();
                showStatus(`Plagiarism check failed: ${error.message}`, 'error');
            }
        } catch (e) {
            showStatus("Network error. Please try again.", 'error');
        }
    });
}

// ... (rest of the code) ...
// Add event listener for the logout button
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.href = 'login.html';
    });
}