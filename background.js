chrome.runtime.onInstalled.addListener(() => {
    console.log("AI Summarizer Extension Installed");

    // Create context menu when user selects text
    chrome.contextMenus.create({
        id: "summarize-selection",
        title: "Summarize this text with AI",
        contexts: ["selection"], // This allows the option when text is selected
    });
});

// Listener for the context menu click
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "summarize-selection") {
        chrome.scripting.executeScript(
            {
                target: { tabId: tab.id },
                func: getSelectedText,
            },
            (result) => {
                const selectedText = result[0].result;
                if (selectedText) {
                    // displayLoaderOnPage(tab.id);
                    summarizeText(selectedText, tab);
                } else {
                    alert("Please select some text to summarize.");
                }
            }
        );
    }
});

// Get selected text from the page
function getSelectedText() {
    return window.getSelection().toString();
}

async function summarizeText(text, tab) {
    const apiUrl = "https://api-inference.huggingface.co/models/facebook/bart-large-cnn";
    const apiUrl2 = "https://api-inference.huggingface.co/models/ainize/bart-base-cnn";
    // Replace with your endpoint
    const apiKey = "";

    try {
        let response = await fetch(apiUrl2, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ inputs: text }),

        });

        if (!response.ok) {
            try {
                response = await fetch(apiUrl, {
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
            }
            console.error("Error summarizing text:", response.status);

        }
        const data = await response.json();
        console.log("data from ainize", data[0].summary_text);


        if (data && data[0] && data[0].summary_text) {
            const summary = data[0].summary_text;
            // Ensure we use the tabs variable inside the chrome.tabs.query callback
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

// Function to display the loader on the page
// function displayLoaderOnPage(tabId) {
// Create an element to display the loader on the page
//     console.log("Displaying loader on page");
//     const loaderDiv = document.createElement('dia');
//     loaderDiv.style.position = 'fixed';
//     loaderDiv.style.top = '20px';
//     loaderDiv.style.right = '0px';
//     loaderDiv.style.bottom = '0px';
//     loaderDiv.style.left = '0px';
//     loaderDiv.style.backgroundColor = 'rgba(0,0,0,0.5)';
//     loaderDiv.style.display = 'flex';
//     loaderDiv.style.justifyContent = 'center';
//     loaderDiv.style.alignItems = 'center';
//     loaderDiv.innerHTML = `<div class="loader"></div>`;
//     document.body.appendChild(loaderDiv);
// }

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

