// =============================================
// TECHCITY — Global API Configuration
// Detects environment and sets the API base URL.
// Include this script BEFORE all other scripts.
// =============================================

(function () {
  const isProduction =
    window.location.hostname !== "localhost" &&
    window.location.hostname !== "127.0.0.1";

  // Use same-origin API paths so Netlify can proxy /api/* to the Render backend.
  window.TECHCITY_API_BASE = "";
})();
