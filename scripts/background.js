
// Background process to bypass MAL CORS
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {    
        if (request.sourceType == "getMangaDex") {
            const url = request.url;
            return fetchData(url)
        }
});

async function fetchData(url) {
    let response = await fetch(
        url,
        {
            method: 'GET',
            cache: 'no-cache',
            mode: 'cors',
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            }
        }
    )
    return response
}