```javascript
// Constants
const AINIZE_API_URL: string = "https://api-inference.huggingface.co/models/ainize/bart-base-cnn";
const FACEBOOK_API_URL: string = "https://api-inference.huggingface.co/models/facebook/bart-large-cnn";
const API_KEY: string = ""; // Replace with your actual API key
const SUMMARY_DISPLAY_DURATION: number = 10000; // Duration in milliseconds to display the summary

// Listen for when the extension is installed or updated.
chrome.runtime.onInstalled.addListener(() => {
    console.log("AI Summarizer Extension Installed");

    // Create a context menu item that appears when the user selects text.
    chrome.contextMenus.create({
        id: "summarize-selection", // Unique identifier
        title: "Summarize this text with AI",
        contexts: ["selection"], // Display only when text is selected
    });
});

// Listen for clicks on context menu items.
chrome.contextMenus.onClicked.addListener((info: chrome.contextMenus.OnClickData, tab?: chrome.tabs.Tab) => {
    if (info.menuItemId === "summarize-selection") {
        // Execute a script in the current tab to retrieve the selected text.
        if (tab?.id) {
            const tabId: number = tab.id;

            chrome.scripting.executeScript({
                target: { tabId: tabId },
                func: getSelectedText,
            }, (injectionResults) => {
                // After execution, this callback is called with the result.
                if (chrome.runtime.lastError) {
                    console.error("Error executing script:", chrome.runtime.lastError);
                    return;
                }

                const selectedText: string | undefined = injectionResults?.[0]?.result;

                if (selectedText) {
                    summarizeText(selectedText, tab);
                } else {
                    alert("Please select some text to summarize.");
                }
            });
        }
    }
});

// Retrieves the selected text from the current page.
function getSelectedText(): string {
    return window.getSelection()?.toString() || "";
}

// Sends the selected text to a summarization API and displays the summary on the page.
async function summarizeText(text: string, tab: chrome.tabs.Tab) {
    if (!tab?.id) {
        console.error("Tab ID is not available.");
        return;
    }

    try {
        let summary: string | null = null;

        // Attempt to summarize the text using the Ainize API.
        try {
            summary = await fetchSummary(AINIZE_API_URL, text);
        } catch (ainizeError) {
            console.error("Error summarizing text from Ainize, trying Facebook model:", ainizeError);
            // If the Ainize API request fails, try the Facebook API.
            try {
                summary = await fetchSummary(FACEBOOK_API_URL, text);
            } catch (facebookError) {
                // If the Facebook API request also fails, log the error and exit.
                console.error("Error summarizing text from Facebook:", facebookError);
                return; // Exit if both APIs fail
            }
        }

        // If a summary is available, display it on the page.
        if (summary) {
            displaySummaryOnPage(summary, tab.id);
            // Remove the summary after a certain duration.
            setTimeout(() => {
                removeSummaryFromPage(tab.id);
            }, SUMMARY_DISPLAY_DURATION);
        }

    } catch (error) {
        // If any error occurs during the API request or processing, log it.
        console.error("Error summarizing text:", error);
    }
}

// Function to fetch summary from a given API URL
async function fetchSummary(apiUrl: string, text: string): Promise<string> {
    const response: Response = await fetch(apiUrl, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${API_KEY}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs: text }),
    });

    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    const summaryText: string | undefined = data?.[0]?.summary_text;

    if (!summaryText) {
        throw new Error("Summary text not found in API response.");
    }

    return summaryText;
}

// Displays the summary on the page.
function displaySummaryOnPage(summary: string, tabId: number) {
    chrome.scripting.executeScript({
        target: { tabId: tabId },
        func: (summaryText: string) => {
            // Create a div element to hold the summary.
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
            summaryDiv.style.scrollbarWidth = 'thin'; // For Firefox
            summaryDiv.style.webkitOverflowScrolling = 'touch'; // For iOS Safari
            summaryDiv.style.fontFamily = 'Arial, sans-serif';
            summaryDiv.style.maxWidth = '300px';
            summaryDiv.innerHTML = `<h2 style="color: white; font-weight: bold;">Summary:</h2><p>${summaryText}</p>`;
            document.body.appendChild(summaryDiv);
        },
        args: [summary],
    });
}

// Removes the summary from the page.
function removeSummaryFromPage(tabId: number) {
    chrome.scripting.executeScript({
        target: { tabId: tabId },
        func: () => {
            const summaryDiv = document.querySelector('div[style*="position: fixed"]');
            if (summaryDiv) {
                summaryDiv.remove();
            }
        },
    });
}
```