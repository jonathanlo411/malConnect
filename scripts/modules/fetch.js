// Fetching linking URLs from various websites

// --- Anine ---

function fetchGoGoAnime(targetTitle) {
    const query = targetTitle.replaceAll(' ', '+')
    const urlGoGoAnime = `https://gogoanimehd.to/search.html?keyword=${query}`

    // Send message to background runtime to fetch GoGoAnime
    return chrome.runtime.sendMessage(
        {
            requestType: "html",
            url: urlGoGoAnime
        }
    );
}

// Music

async function fetchYoutubeMV(forumID) {
    const forumMALURL = `https://api.myanimelist.net/v2/forum/topic/${forumID}`;
    const malData = await fetch(chrome.runtime.getURL("config.json"))
        .then((res) => (res.json()));

    // Send request to MAL forum API
    return chrome.runtime.sendMessage(
        {
            requestType: "json",
            url: forumMALURL,
            headers: {
                "X-MAL-CLIENT-ID": malData['malClientID']
            }
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
            requestType: "json",
            url: `${urlMangaDex}?${new URLSearchParams(params)}`
        }
    );
}

function fetchManganelo(targetTitle) {
    if ( targetTitle === undefined ) { return { msg: "invalid"} }
    const query = targetTitle.replaceAll(' ', '_').replaceAll(/\W/g, '')
    const urlManganelo = `https://m.manganelo.com/search/story/${query}`
    
    // Send messsage to background runtime to fetch manganelo
    return chrome.runtime.sendMessage(
        {
            requestType: "html",
            url: urlManganelo
        }
    );
}

// --- Novels ---

async function fetchNovelUpdates(targetTitle) {
    // Call MangaDex first to see if there is data
    const jsonMangaDex = await fetchMangaDex(targetTitle);
    const checkedResponse = await checkResponse("MangaDex", jsonMangaDex, "Final");
    if (Object.hasOwn(checkedResponse, 'msg') && checkResponse[msg] === "invalid") { return checkedResponse }

    // Parse NovelUpdates data from MangaDex links if NU exits
    const slugParent = checkedResponse['data'][0]['attributes']['links']
    if (!Object.hasOwn(slugParent, "nu")) { return { msg : "invalid"} }
    
    return slugParent["nu"]
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

export { fetchGoGoAnime, fetchYoutubeMV, fetchMangaDex, fetchManganelo, fetchNovelUpdates, checkResponse }