// Fetching linking URLs from various websites

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

function fetchMangaDex(targetTitle) {
    // Obtain Manga data
    const urlMangaDex ="https://api.mangadex.org/manga"
    const params={"title": targetTitle}

    // Send message to background runtime to fetch MangaDex
    return chrome.runtime.sendMessage(
        {
            sourceType: "getMangaDex",
            requestType: "json",
            url: `${urlMangaDex}?${new URLSearchParams(params)}`
        }
    );
}

function fetchNovelUpdates(targetTitle) {
    // Not implemented
    console.log("Not Implemented")
    return null
}

export { fetchGoGoAnime, fetchMangaDex, fetchNovelUpdates }