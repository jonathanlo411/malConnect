import Fuse from './fuse6.6.2.js'

function buildHTML(source, data, targetTitle) {

    // Obtain targets
    const domTarget = document.getElementsByClassName('leftside')[0];
    const referenceObject = domTarget.children[1];
    let malWatchButton = document.getElementById('broadcast-block')
    var htmlButton;
    
    // Check if d*ata is available
    if (!data || (data.msg && data.msg === 'invalid')) { source = "Unavailable" }

    // Selectively build buttons
    if (source === "MangaDex") {
        const mangaID = removeMDNonOfficial(data)[0].id //searchData(data, targetTitle, "json");
        htmlButton = createButton('MangaDex', `https://mangadex.org/title/${mangaID}`)
    } else if (source === "Manganelo"){
        const url = scrapeManganelo(data)
        htmlButton = createButton('Manganelo', url)
    } else if (source === "GoGoAnime") {
        const url = scrapeGoGoAnime(data)
        htmlButton = createButton('GoGoAnime', url)
    } else {
        htmlButton = createButton(null, null)
    }

    // Insertion
    domTarget.insertBefore(htmlButton, referenceObject);
    if (malWatchButton) { malWatchButton.remove() };
}

function createButton(context, url) {
    var template = document.createElement('template');
    var button;
    var html;
    if (context === 'MangaDex') {
        const mdCatLogo = chrome.runtime.getURL('assets/site-logos/md-cat-logo.svg')
        const mdLogo = chrome.runtime.getURL('assets/site-logos/md-logo.svg')
        html = `
        <a href="${url}" target="_blank" rel="noopener noreferrer" class="inj-a-tag">
            <button class="inj-btn-tag mdex">
                <p class="bt-text">Read on</p>
                <img src="${mdCatLogo}" id="md-cat" />
                <img src="${mdLogo}" id="md-logo" />
            </button>
        </a>`.trim();
    } else if (context === 'Manganelo') {
        const mgloLogo = chrome.runtime.getURL('assets/site-logos/manganelo-logo.png')
        html = `
        <a href="${url}" target="_blank" rel="noopener noreferrer" class="inj-a-tag">
            <button class="inj-btn-tag mglo">
                <p class="bt-text">Read on</p>
                <img src="${mgloLogo}" id="mglo-logo" />
            </button>
        </a>`.trim();
    } else if (context === "GoGoAnime") {
        html = `
        <a href="${url}" target="_blank" rel="noopener noreferrer" class="inj-a-tag">
            <button class="inj-btn-tag gogo">
                <p class="bt-text">Watch on</p>
            </button>
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

function scrapeManganelo(stringHTML) {
    // Load GoGoAnime DOM
    var parser = new DOMParser();
    var doc = parser.parseFromString(stringHTML, 'text/html');

    // Parse DOM for non dub results
    return doc.getElementsByClassName('item-title')[0].href;
}

// Searches through json to find optimal result; Uses Fuse
function searchData(data, targetTitle, dataType) {
    if (dataType === "json") {
        const constraints = { includeScore: true, keys: [ "attributes.title.en" ] }
        const fuse = new Fuse(data['data'], constraints)
        const result = fuse.search(targetTitle)
        return (result.length === 0) ? data['data'][0].id : result[0].item.id;
    }
}

// Removes any data that has one of the banned tags
function removeMDNonOfficial(data) {
    const bannedTags = ["Oneshot", "Doujinshi"];
    var approvedData = [];
    var i;
    for (i = 0; i < data['data'].length; i ++) {
        var j;
        var notBanned = true;
        var dataEntry = data['data'][i]
        for (j = 0; j < dataEntry["attributes"]["tags"].length; j ++) {
            if (bannedTags.includes(dataEntry["attributes"]["tags"][j]["attributes"]["name"]["en"])) {
                notBanned = false;
                break;
            }
        }
        if (notBanned) { approvedData.push(data['data'][i]) };
    }
    return approvedData;
}

export default buildHTML