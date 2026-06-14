// ==============================
// Admin Login Script
// ==============================

// Grab the login form and create a message container
const loginForm = document.querySelector("form");
const messageDiv = document.createElement("div");
loginForm.appendChild(messageDiv);

// Listen for form submission
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Get values from form inputs
  const username = document.getElementById("user").value.trim();
  const password = document.getElementById("pass").value;

  // Basic validation
  if (!username || !password) {
    messageDiv.textContent = "Please enter both username and password.";
    messageDiv.style.color = "red";
    return;
  }

  try {
    // Send login data to backend admin login route
    const res = await fetch((window.TECHCITY_API_BASE || '') + "/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (res.ok && data.success) {
      // Correct admin credentials
      messageDiv.textContent = "Login successful! Redirecting...";
      messageDiv.style.color = "green";

      // Redirect to admin dashboard page
      window.location.href = "/dashboards/admin/index.html";
    } else {
      // Wrong credentials
      messageDiv.textContent = data.message || "Invalid credentials";
      messageDiv.style.color = "red";
    }

    // Optional: reset form
    loginForm.reset();

  } catch (err) {
    console.error(err);
    messageDiv.textContent = "Error connecting to server.";
    messageDiv.style.color = "red";
  }
});