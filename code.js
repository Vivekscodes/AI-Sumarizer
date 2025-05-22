```javascript
// Listen for messages from the background script
chrome.runtime.onMessage.addListener((message) => {
    // Check if the message is to show the loader
    if (message.action === 'showLoader') {
        // Display the loader on the page
        displayLoaderOnPage();
    }
});

// Function to create and display a loader overlay on the page
function displayLoaderOnPage() {
    // Create the loader div
    const loaderDiv = document.createElement('div');
    
    // Style the loader div to cover the entire page
    loaderDiv.style.position = 'fixed';
    loaderDiv.style.top = '0';
    loaderDiv.style.right = '0';
    loaderDiv.style.bottom = '0';
    loaderDiv.style.left = '0';
    loaderDiv.style.backgroundColor = 'rgba(0,0,0,0.5)'; // Semi-transparent background
    loaderDiv.style.display = 'flex';
    loaderDiv.style.justifyContent = 'center'; // Center horizontally
    loaderDiv.style.alignItems = 'center'; // Center vertically
    loaderDiv.style.zIndex = '9999'; // Ensure it's on top of everything

    // Add the actual loader HTML (replace with your loader)
    loaderDiv.innerHTML = `<div class="loader"></div>`;

    // Add the loader to the page
    document.body.appendChild(loaderDiv);
}
```