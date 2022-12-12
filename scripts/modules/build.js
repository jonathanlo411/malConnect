
function buildHTML(source, data) {
    const domTarget = document.getElementsByClassName('leftside')[0];
    const referenceObject = domTarget.children[1];
    let malWatchButton = document.getElementById('broadcast-block')
    var htmlButton;
    if (source === "MangaDex") {
        const mangaID = data['data'][0]['id'];
        htmlButton = createButton('MangaDex', `https://mangadex.org/title/${mangaID}`)
    } else if (source === "GoGoAnime") {
        const url = scrapeGoGoAnime(data)
        htmlButton = createButton('GoGoAnime', url)
    } else {
        htmlButton = createButton(null, null)
    }
    domTarget.insertBefore(htmlButton, referenceObject);
    if (malWatchButton) { malWatchButton.remove() };
}

function createButton(context, url) {
    var template = document.createElement('template');
    var button;
    var html;
    if (context === 'MangaDex') {
        html = `
        <a href="${url}" target="_blank" rel="noopener noreferrer" class="inj-a-tag">
            <button class="inj-btn-tag mdex">Read on MangaDex</button>
        </a>`.trim();
    } else if (context === "GoGoAnime") {
        html = `
        <a href="${url}" target="_blank" rel="noopener noreferrer" class="inj-a-tag">
            <button class="inj-btn-tag gogo">Watch on GoGoAnime</button>
        </a>`.trim();
    } else {
        html = `
        <a href="" target="_blank" rel="noopener noreferrer" class="inj-a-tag">
            <button class="inj-btn-tag err">Content Unavailable</button>
        </a>`.trim();
    }
    template.innerHTML = html;
    button = template.content.firstChild;
    return button;
}

function scrapeGoGoAnime(stringHTML) {
    // Load GoGoAnime DOM
    var parser = new DOMParser();
    var doc = parser.parseFromString(stringHTML, 'text/html');

    // Parse DOM for non dub results
    const animeList = doc.getElementsByClassName('name')
    var animeLink;
    for (var i = 0; i < animeList.length; i ++) {
        var anime = animeList[i];
        if (!(anime.innerText.includes("Dub") || anime.innerText.includes("dub"))) {
            animeLink = anime.children[0].href;
            break
        }
    }
    return `https://ww3.gogoanime2.org/${animeLink.replace("https://myanimelist.net/", "")}`
}

export default buildHTML