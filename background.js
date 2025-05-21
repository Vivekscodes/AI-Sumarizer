```javascript
chrome.runtime.onInstalled.addListener(() => {
    console.log("AI Summarizer Extension Installed");

    // Create context menu item for summarizing selected text
    chrome.contextMenus.create({
        id: "summarize-selection",
        title: "Summarize this text with AI",
        contexts: ["selection"], // Show option only when text is selected
    });
});

// Handle context menu item click
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "summarize-selection") {
        // Execute script to get the selected text
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: getSelectedText,
        }, (result) => {
            // Extract selected text from the result
            const selectedText = result?.[0]?.result;
            if (selectedText) {
                // Summarize the selected text
                summarizeText(selectedText, tab);
            } else {
                // Alert the user if no text is selected
                alert("Please select some text to summarize.");
            }
        });
    }
});

// Function to get the selected text from the page
function getSelectedText() {
    return window.getSelection().toString();
}

// Function to summarize the given text
async function summarizeText(text, tab) {
    const ainizeApiUrl = "https://api-inference.huggingface.co/models/ainize/bart-base-cnn";
    const facebookApiUrl = "https://api-inference.huggingface.co/models/facebook/bart-large-cnn";
    const apiKey = ""; // Replace with your API key

    try {
        // First try to summarize the text with ainize model
        let response = await fetch(ainizeApiUrl, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ inputs: text }),
        });

        // If the request was not successful, try with facebook model
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
                console.error("Error summarizing text from facebook:", error);
                return; // Exit the function if both APIs fail
            }
        }

        const data = await response.json();
        console.log("data from ainize", data?.[0]?.summary_text);

        // If summary is available, display it on the page
        if (data?.[0]?.summary_text) {
            const summary = data[0].summary_text;

            // Display the summary on the page
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: displaySummaryOnPage,
                args: [summary],
            });

            // Remove the loader after displaying the summary
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: () => {
                    displayLoaderOnPage(tab.id);
                },
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
        console.error("Error summarizing text:", error);
    }
}

// Function to display the summary on the page
function displaySummaryOnPage(summary) {
    // Create an element to display the summary on the page
    const summaryDiv = document.createElement('div');
    summaryDiv.style.position = 'fixed';
    summaryDiv.style.bottom = '20px';
    summaryDiv.style.top = '30px';
    summaryDiv.style.right = '40px';
    summaryDiv.style.backgroundColor = 'Black';
    summaryDiv.style.padding = '10px';
    summaryDiv.style.paddingTop = '20px';
    summaryDiv.style.boxShadow = 'rgba(223, 234, 15, 0.83) 0px 10px 15px';
    summaryDiv.style.zIndex = '9999';
    summaryDiv.style.color = 'white';
    summaryDiv.style.maxHeight = '300px';
    summaryDiv.style.overflowY = 'auto';
    summaryDiv.style.scrollbarWidth = 'thin';
    summaryDiv.style.webkitOverflowScrolling = 'touch';
    summaryDiv.style.fontFamily = 'Arial, sans-serif';
    summaryDiv.style.maxWidth = '300px';
    summaryDiv.innerHTML = `<h2 style="color: white; font-weight: bold;">Summary:</h2><p>${summary}</p>`;
    document.body.appendChild(summaryDiv);
}

// Function to display the loader on the page
function displayLoaderOnPage(tabId) { }
```