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

// Show/hide reviewer fields based on role selection
const roleSelect = document.getElementById("role");
const reviewerFields = document.getElementById("reviewerFields");

if (roleSelect && reviewerFields) {
    roleSelect.addEventListener("change", (e) => {
        if (e.target.value === "reviewer") {
            reviewerFields.style.display = "block";
            // Make reviewer fields required
            document.getElementById("educationalQualification").required = true;
            document.getElementById("specialization").required = true;
            document.getElementById("yearsExperience").required = true;
            document.getElementById("currentDesignation").required = true;
            document.getElementById("currentInstitution").required = true;
            document.getElementById("reviewerType").required = true;
        } else {
            reviewerFields.style.display = "none";
            // Remove required attribute from reviewer fields
            document.getElementById("educationalQualification").required = false;
            document.getElementById("specialization").required = false;
            document.getElementById("yearsExperience").required = false;
            document.getElementById("currentDesignation").required = false;
            document.getElementById("currentInstitution").required = false;
            document.getElementById("reviewerType").required = false;
        }
    });
}

// Handle user registration
if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const username = document.getElementById("username").value;
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const role = document.getElementById("role").value;
        const mobileNumber = document.getElementById("mobileNumber").value;

        const formData = new FormData();
        formData.append('username', username);
        formData.append('email', email);
        formData.append('password', password);
        formData.append('role', role);
        formData.append('mobileNumber', mobileNumber);

        // Add reviewer-specific fields if role is reviewer
        if (role === 'reviewer') {
            formData.append('educationalQualification', document.getElementById("educationalQualification").value);
            formData.append('specialization', document.getElementById("specialization").value);
            formData.append('yearsExperience', document.getElementById("yearsExperience").value);
            formData.append('currentDesignation', document.getElementById("currentDesignation").value);
            formData.append('currentInstitution', document.getElementById("currentInstitution").value);
            formData.append('publications', document.getElementById("publications").value);
            formData.append('reviewerType', document.getElementById("reviewerType").value);
            
            // Add uploaded files
            const proofFiles = document.getElementById("proofDocuments").files;
            for (let i = 0; i < proofFiles.length; i++) {
                formData.append('proofDocuments', proofFiles[i]);
            }
        }

        try {
            const response = await fetch("http://localhost:3000/register", {
                method: "POST",
                body: formData,
            });

            const result = await response.json();
            if (response.ok) {
                if (role === 'reviewer') {
                    showStatus('Reviewer application submitted successfully! Please wait for admin approval.', 'success');
                } else {
                    showStatus(result.message, 'success');
                }
                setTimeout(() => {
                    window.location.href = "login.html";
                }, 3000);
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