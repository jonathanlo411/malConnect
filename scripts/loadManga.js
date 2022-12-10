
// Top Level call
fetchMangaDex().then((data) => handleMangaDex(data))

// ##########################
// #    Helper Functions    #
// ##########################

function fetchMangaDex() {
    // Obtain Manga title data
    const urlMangaDex ="https://api.mangadex.org/manga"
    const targetTitle =  document.getElementsByClassName('h1-title')[0]
        .childNodes[0].childNodes[0].data
    const params={"title": targetTitle}

    // Send message to background runtime to fetch MangaDex
    chrome.runtime.sendMessage(
        {
            sourceType: "getMangaDex",
            url: `${urlMangaDex}?${new URLSearchParams(params)}`
        }, 
        (res) => { return (res != undefined && res != "") ? response : null }
    );
    return false
}

function handleMangaDex(mangaJson) {
    const mangaID = mangaJson['data'][0]['id']
    const domTarget = document.getElementsByClassName('leftside')[0]
    const referenceObject = domTarget.children[1]
    let htmlButton = `<a href="https://mangadex.org/title/${mangaID}"><button>Read on MangaDex</button></a>`
    domTarget.insertBefore(htmlButton, referenceObject)
}