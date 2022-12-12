
// Background service wroker to bypass CORS
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    // Obtain request information
    const url = request.url;
    const type = request.requestType;

    // Send request and forward to content script
    fetchData(url, type)
        .then((apiCallResponse) => { sendResponse(apiCallResponse) })
    return true
});

// API Call
async function fetchData(url, type) {
    let response = await fetch(
        url,
        {
            method: 'GET',
            cache: 'no-cache',
            mode: 'cors',
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': (type === 'json') ? 'application/json' : 'text/html'
            }
        }
    )
    return (type === 'json') ? response.json() : response.text()
}