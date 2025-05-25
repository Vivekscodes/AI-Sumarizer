```javascript
// Listen for messages from the background script
chrome.runtime.onMessage.addListener((message: any) => {
  // Check if the message is to show the loader
  if (message.action === "showLoader") {
    // Display the loader on the page
    showLoader();
  }
});

// Function to create and display a loader overlay on the page
function showLoader() {
  // Create the loader overlay div
  const loaderOverlay: HTMLDivElement = document.createElement("div");

  // Style the loader overlay to cover the entire page
  Object.assign(loaderOverlay.style, {
    position: "fixed",
    top: "0",
    right: "0",
    bottom: "0",
    left: "0",
    backgroundColor: "rgba(0,0,0,0.5)", // Semi-transparent background
    display: "flex",
    justifyContent: "center", // Center horizontally
    alignItems: "center", // Center vertically
    zIndex: "9999", // Ensure it's on top of everything
  });

  // Add the actual loader HTML (replace with your loader's HTML)
  loaderOverlay.innerHTML = `<div class="loader"></div>`;

  // Add the loader overlay to the page
  document.body.appendChild(loaderOverlay);
}
```