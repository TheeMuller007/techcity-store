// =============================================
// TECHCITY — Global API Configuration
// Detects environment and sets the API base URL.
// Include this script BEFORE all other scripts.
// =============================================

(function () {
  const isProduction =
    window.location.hostname !== "localhost" &&
    window.location.hostname !== "127.0.0.1";

  // In production (Netlify), point to the Render backend.
  // In local dev, use same-origin (empty string).
  window.TECHCITY_API_BASE = isProduction
    ? "https://techcity-backend.onrender.com"
    : "";
})();
