// Grab form and create message container
const form = document.querySelector("form");
const messageDiv = document.createElement("div");
messageDiv.style.marginTop = "10px";
form.appendChild(messageDiv);

// Helper to display messages
function showMessage(msg, color = "red") {
    messageDiv.textContent = msg;
    messageDiv.style.color = color;
}

// Listen for form submission
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Get form values
    const full_name = document.getElementById("fullname")?.value.trim();
    const email = document.getElementById("email")?.value.trim();
    const username = document.getElementById("username")?.value.trim();
    const password = document.getElementById("password")?.value;
    const confirm_password = document.getElementById("confirm-password")?.value;
    const terms = document.getElementById("terms")?.checked;

    // Frontend validation
    if (!full_name || !email || !username || !password || !confirm_password) {
        return showMessage("All fields are required!");
    }

    if (!terms) {
        return showMessage("You must agree to the Terms & Conditions.");
    }

    if (password !== confirm_password) {
        return showMessage("Passwords do not match!");
    }

    try {
        // Send data to backend
        const res = await fetch((window.TECHCITY_API_BASE || '') + "/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ full_name, username, email, password })
        });

        let data;
        try {
            data = await res.json();
        } catch {
            return showMessage("Invalid response from server.");
        }

        if (res.ok) {
            showMessage(data.message || "Registration successful!", "green");
            form.reset();
        } else {
            showMessage(data.message || "Registration failed!");
        }

    } catch (err) {
        console.error("Fetch error:", err);
        showMessage("Error connecting to server.");
    }
});