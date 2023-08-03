
// Background service wroker to make requests
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    // Obtain request information
    const url = request.url;
    const type = request.requestType;
    const headers = (Object.hasOwn(request, "headers")) ? request.headers : null

    // Send request and forward to content script
    fetchData(url, type, headers)
        .then((apiCallResponse) => { sendResponse(apiCallResponse) })
    return true
});

// API Call
async function fetchData(url, type, headers) {
    const headersReq = {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': (type === 'json') ? 'application/json' : 'text/html'
    }
    if (headers) {for (const prop in headers) { headersReq[prop] = headers[prop]; }};
    let response = await fetch(
        url,
        {
            method: 'GET',
            cache: 'no-cache',
            mode: 'cors',
            headers: headersReq
        }
    )
    return (type === 'json') ? response.json() : response.text()
}