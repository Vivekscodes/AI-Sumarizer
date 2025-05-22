```javascript
// Listen for when the extension is installed or updated.
chrome.runtime.onInstalled.addListener(() => {
    console.log("AI Summarizer Extension Installed");

    // Create a context menu item that will appear when the user selects text.
    chrome.contextMenus.create({
        id: "summarize-selection", // Unique identifier for the context menu item.
        title: "Summarize this text with AI", // The text that will appear in the context menu.
        contexts: ["selection"], // Specifies when this context menu item should be displayed (when text is selected).
    });
});

// Listen for clicks on context menu items.
chrome.contextMenus.onClicked.addListener((info: chrome.contextMenus.OnClickData, tab?: chrome.tabs.Tab) => {
    // Check if the clicked context menu item is our "summarize-selection" item.
    if (info.menuItemId === "summarize-selection") {
        // Execute a script in the current tab to retrieve the selected text.
        if (tab?.id) {
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: getSelectedText, // The function to execute in the tab.
            }, (result) => {
                // After the script is executed, this callback function is called with the result.
                const selectedText = result?.[0]?.result; // Extract the selected text from the result.

                if (selectedText) {
                    // If selected text exists, call the summarizeText function to summarize it.
                    summarizeText(selectedText, tab);
                } else {
                    // If no text is selected, display an alert to the user.
                    alert("Please select some text to summarize.");
                }
            });
        }
    }
});

// A function that retrieves the selected text from the current page.
function getSelectedText(): string {
    return window.getSelection()?.toString() || ""; // Get the selected text and convert it to a string.
}

// A function that sends the selected text to a summarization API and displays the summary on the page.
async function summarizeText(text: string, tab: chrome.tabs.Tab) {
    const ainizeApiUrl: string = "https://api-inference.huggingface.co/models/ainize/bart-base-cnn"; // API endpoint for the Ainize summarization model.
    const facebookApiUrl: string = "https://api-inference.huggingface.co/models/facebook/bart-large-cnn"; // API endpoint for the Facebook summarization model.
    const apiKey: string = ""; // Replace with your actual API key for authentication.

    try {
        // Attempt to summarize the text using the Ainize API.
        let response: Response = await fetch(ainizeApiUrl, {
            method: "POST", // Use the POST method to send the text to the API.
            headers: {
                "Authorization": `Bearer ${apiKey}`, // Include the API key in the Authorization header.
                "Content-Type": "application/json", // Specify that the request body is in JSON format.
            },
            body: JSON.stringify({ inputs: text }), // Serialize the text as a JSON string and include it in the request body.
        });

        // If the Ainize API request fails, try the Facebook API.
        if (!response.ok) {
            console.error("Error summarizing text from ainize, trying facebook model:", response.status);
            try {
                response = await fetch(facebookApiUrl, {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${apiKey}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ inputs: text }),
                });
            }
            catch (error) {
                // If the Facebook API request also fails, log the error and exit the function.
                console.error("Error summarizing text from facebook:", error);
                return; // Exit the function if both APIs fail
            }
        }

        // Parse the JSON response from the API.
        const data = await response.json();
        console.log("data from ainize", data?.[0]?.summary_text);

        // If a summary is available in the response, display it on the page.
        if (data?.[0]?.summary_text) {
            const summary: string = data[0].summary_text;

            // Execute a script in the current tab to display the summary on the page.
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: displaySummaryOnPage, // The function to execute in the tab.
                args: [summary], // Pass the summary as an argument to the function.
            });
        }

        // Remove the summary after 10 seconds
        setTimeout(() => {
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: () => {
                    const summaryDiv = document.querySelector('div[style*="position: fixed"]');
                    if (summaryDiv) {
                        summaryDiv.remove();
                    }
                },
            });
        }, 10000);

    } catch (error) {
        // If any error occurs during the API request or processing, log the error.
        console.error("Error summarizing text:", error);
    }
}

// A function that displays the summary on the page.
function displaySummaryOnPage(summary: string) {
    // Create a div element to hold the summary.
    const summaryDiv = document.createElement('div');
    summaryDiv.style.position = 'fixed'; // Position the div fixed on the page.
    summaryDiv.style.bottom = '20px'; // Position it 20px from the bottom.
    summaryDiv.style.top = '30px';
    summaryDiv.style.right = '40px'; // Position it 40px from the right.
    summaryDiv.style.backgroundColor = 'Black'; // Set the background color to black.
    summaryDiv.style.padding = '10px'; // Add some padding around the content.
    summaryDiv.style.paddingTop = '20px';
    summaryDiv.style.boxShadow = 'rgba(223, 234, 15, 0.83) 0px 10px 15px'; // Add a shadow to make it stand out.
    summaryDiv.style.zIndex = '9999'; // Ensure it's on top of other elements.
    summaryDiv.style.color = 'white'; // Set the text color to white.
    summaryDiv.style.maxHeight = '300px'; // Set a maximum height and enable scrolling.
    summaryDiv.style.overflowY = 'auto';
    summaryDiv.style.scrollbarWidth = 'thin'; // For Firefox
    summaryDiv.style.webkitOverflowScrolling = 'touch'; // For iOS Safari
    summaryDiv.style.fontFamily = 'Arial, sans-serif'; // Use a readable font.
    summaryDiv.style.maxWidth = '300px'; // Set a maximum width for the summary box.
    summaryDiv.innerHTML = `<h2 style="color: white; font-weight: bold;">Summary:</h2><p>${summary}</p>`; // Add the summary to the div.
    document.body.appendChild(summaryDiv); // Add the div to the page.
}

// Placeholder function for displaying a loader on the page (implementation not provided).
function displayLoaderOnPage(tabId: number) {
    // This function is intended to display a loading indicator while the summary is being fetched.
    // You can add code here to create and display a loader element on the page.
}
```