chrome.runtime.onMessage.addListener((message) => {
    if (message.action === 'showLoader') {
        displayLoaderOnPage(tab.id);
    }
});

// Function to create and display the loader on the page
function displayLoaderOnPage(tabId) {
    const loaderDiv = document.createElement('div');
    loaderDiv.style.position = 'fixed';
    loaderDiv.style.top = '0';
    loaderDiv.style.right = '0';
    loaderDiv.style.bottom = '0';
    loaderDiv.style.left = '0';
    loaderDiv.style.backgroundColor = 'rgba(0,0,0,0.5)';
    loaderDiv.style.display = 'flex';
    loaderDiv.style.justifyContent = 'center';
    loaderDiv.style.alignItems = 'center';
    loaderDiv.style.zIndex = '9999'; // Ensure loader is on top
    loaderDiv.innerHTML = `<div class="loader"></div>`; // Replace with your actual loader HTML
    document.body.appendChild(loaderDiv);
}