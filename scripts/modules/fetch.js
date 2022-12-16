// Fetching linking URLs from various websites

// --- Anine ---

function fetchGoGoAnime(targetTitle) {
    const query = targetTitle.replaceAll(' ', '+')
    const urlGoGoAnime = `https://ww3.gogoanime2.org/search/${query}`

    // Send message to background runtime to fetch GoGoAnime
    return chrome.runtime.sendMessage(
        {
            sourceType: "getGoGoAnime",
            requestType: "html",
            url: urlGoGoAnime
        }
    );
}

// --- Manga ---

function fetchMangaDex(targetTitle) {
    // Obtain Manga data
    const urlMangaDex ="https://api.mangadex.org/manga"
    const params={"title": targetTitle, "order[followedCount]": "desc"}

    // Send message to background runtime to fetch MangaDex
    return chrome.runtime.sendMessage(
        {
            sourceType: "getMangaDex",
            requestType: "json",
            url: `${urlMangaDex}?${new URLSearchParams(params)}`
        }
    );
}

function fetchManganelo(targetTitle) {
    const query = targetTitle.replaceAll(' ', '_').replaceAll(/\W/g, '')
    const urlManganelo = `https://m.manganelo.com/search/story/${query}`
    
    // Send messsage to background runtime to fetch manganelo
    return chrome.runtime.sendMessage(
        {
            sourceType: "getManganelo",
            requestType: "html",
            url: urlManganelo
        }
    );
}

// --- Novels ---

async function fetchNovelUpdates(targetTitle) {
    // Not implemented
    console.log("Not Implemented")
    return { msg : "invalid" }
}

// Checks the response to see if there are results; If not, re attempt API call with alt title
async function checkResponse(sourceType, res, backupTitle) {
    if (sourceType === "MangaDex") {
        if (res['data'].length === 0) {
            // If second attempt, return unavailable button
            if (backupTitle === "Final") { return { msg : "invalid" } }
            var backupRes = await fetchMangaDex(backupTitle)
            return checkResponse("MangaDex", backupRes, "Final");
        } else { return res };
    } else if (sourceType === "Manganelo") {
        // Load Manganelo DOM
        var parser = new DOMParser();
        var doc = parser.parseFromString(res, 'text/html');

        // Checking issues
        if (doc.getElementsByClassName('item-title').length === 0) {
            // If second attempt, return unavailable button
            if (backupTitle === "Final") { return { msg : "invalid" } }
            var backupRes = await fetchManganelo(backupTitle)
            return checkResponse("Manganelo", backupRes, "Final");
        } else { return res };
    }
}

export { fetchGoGoAnime, fetchMangaDex, fetchManganelo, fetchNovelUpdates, checkResponse }