
// Top Level call
fetchMangaDex()

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
        (runtimeResponse) => { handleMangaDex(runtimeResponse) }
    );
}

function handleMangaDex(mangaJson) {
    // Obtain page data
    const mangaID = mangaJson['data'][0]['id'];
    const domTarget = document.getElementsByClassName('leftside')[0];
    const referenceObject = domTarget.children[1];

    // Generate button and insert into target
    const htmlButton = createButton('MangaDex', `https://mangadex.org/title/${mangaID}`)
    domTarget.insertBefore(htmlButton, referenceObject)
}

function createButton(context, url) {
    var template = document.createElement('template');
    var button;
    var html;
    if (context === 'MangaDex') {
        html = `
        <a href="${url}" target="_blank" rel="noopener noreferrer" class="inj-a-tag">
            <button class="inj-btn-tag">Read on MangaDex</button>
        </a>`.trim();
    } else {
        html = `
        <a href="" target="_blank" rel="noopener noreferrer" class="inj-a-tag">
            <button class="inj-btn-tag">Content Unavailable</button>
        </a>`.trim();
    }
    template.innerHTML = html;
    button = template.content.firstChild;
    return button;
}