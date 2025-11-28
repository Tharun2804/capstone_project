const registerForm = document.getElementById("registerForm");
const loginForm = document.getElementById("loginForm");
const statusMessage = document.getElementById("statusMessage");

// Helper function to display a status message
function showStatus(message, type) {
    if (statusMessage) {
        statusMessage.textContent = message;
        statusMessage.className = `alert-message ${type}`;
    }
}

// Handle user registration
if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;
        const role = document.getElementById("role").value;

        try {
            const response = await fetch("http://localhost:3000/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password, role }),
            });

            const result = await response.json();
            if (response.ok) {
                showStatus(result.message, 'success');
                setTimeout(() => {
                    window.location.href = "login.html";
                }, 2000);
            } else {
                showStatus(result.error || result.message, 'error');
            }
        } catch (e) {
            showStatus("Network error. Please try again.", 'error');
        }
    });
}

// Handle user login
if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;

        try {
            const response = await fetch("http://localhost:3000/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();
            if (response.ok) {
                localStorage.setItem("token", data.token);
                // Redirect based on user role
                // if (data.role === 'admin') {
                //     window.location.href = "index.html"; 
                // } else if (data.role === 'reviewer') {
                //     window.location.href = "reviewer-dashboard.html"; 
                // }
                // In auth.js, inside the `if (response.ok)` block of the login handler
if (data.role === 'admin') {
    window.location.href = "index.html"; 
} else if (data.role === 'reviewer') {
    window.location.href = "reviewer-dashboard.html"; 
} else if (data.role === 'publisher') {
    window.location.href = "publisher-dashboard.html"; 
} else if (data.role === 'student') {
    window.location.href = "student-dashboard.html"; // You will need to create this page
}
            } else {
                showStatus(data.message, 'error');
            }
        } catch (e) {
            showStatus("Network error. Please try again.", 'error');
        }
    });
}
// ... (Your existing auth.js code) ...

// // Handle user login
// if (loginForm) {
//     loginForm.addEventListener("submit", async (e) => {
//         e.preventDefault();
//         const username = document.getElementById("username").value;
//         const password = document.getElementById("password").value;

//         try {
//             const response = await fetch("http://localhost:3000/login", {
//                 method: "POST",
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify({ username, password }),
//             });

//             const data = await response.json();
//             if (response.ok) {
//                 localStorage.setItem("token", data.token);
//                 // Redirect based on user role
//                 if (data.role === 'admin') {
//                     window.location.href = "index.html"; 
//                 } else if (data.role === 'reviewer') {
//                     window.location.href = "reviewer-dashboard.html"; 
//                 } else if (data.role === 'publisher') {
//                     window.location.href = "publisher-dashboard.html"; 
//                 }
//             } else {
//                 showStatus(data.message, 'error');
//             }
//         } catch (e) {
//             showStatus("Network error. Please try again.", 'error');
//         }
//     });
// }

// ... (Rest of your auth.js file) ...
// ** NEW CODE BLOCK: Redirect to public.html if not logged in **
const token = localStorage.getItem('token');
if (!token && window.location.pathname === '/') {
    window.location.href = 'public.html';
}