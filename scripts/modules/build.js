import Fuse from './fuse6.6.2.js'

function buildHTML(source, data, targetTitle) {

    // Obtain targets
    const domTarget = document.getElementsByClassName('leftside')[0];
    const referenceObject = domTarget.children[1];
    let malWatchButton = document.getElementById('broadcast-block')
    var htmlButton;
    
    // Check if d*ata is available
    if (!data || (data.msg && data.msg === 'invalid')) { 
        htmlButton = createButton(source, "")
    } else {
        // Selectively build buttons
        if (source === "MangaDex") {
            const mangaID = removeMDNonOfficial(data)[0].id //searchData(data, targetTitle, "json");
            htmlButton = createButton('MangaDex', `https://mangadex.org/title/${mangaID}`)
        } else if (source === "Manganelo"){
            const url = scrapeManganelo(data)
            htmlButton = createButton('Manganelo', url)
        } else if (source === "NovelUpdates") {
            const url = `https://www.novelupdates.com/series/${data}/`
            htmlButton = createButton('NovelUpdates', url)
        } else if (source === "GoGoAnime") {
            const url = scrapeGoGoAnime(data)
            htmlButton = createButton('GoGoAnime', url)
        } else if (source === "YouTube") {
            const url = parseMALForumJSON(data)
            htmlButton = createButton("YouTube", url)
        } else {
            htmlButton = createButton(null, null)
        }
    }

    // Insertion
    domTarget.insertBefore(htmlButton, referenceObject);
    if (malWatchButton) { malWatchButton.remove() };
}

function createButton(context, url) {
    const dataError = url === "";
    var template = document.createElement('template');
    var button;
    var html;
    if (context === 'MangaDex') {
        const mdCatLogo = chrome.runtime.getURL('assets/site-logos/md-cat-logo.svg')
        const mdLogo = chrome.runtime.getURL('assets/site-logos/md-logo.svg')
        html = (!dataError) ? `
        <a href="${url}" target="_blank" rel="noopener noreferrer" class="inj-a-tag">
            <button class="inj-btn-tag mdex unblocked">
                <p class="bt-text">Read on</p>
                <img src="${mdCatLogo}" id="md-cat" />
                <img src="${mdLogo}" id="md-logo" />
            </button>
        </a>`.trim() : `
        <aclass="inj-a-tag">
            <button class="inj-btn-tag mdex blocked">
                <p class="bt-text">Read on</p>
                <img src="${mdCatLogo}" id="md-cat" />
                <img src="${mdLogo}" id="md-logo" />
                <span class="block-pop">No Data on MangaDex</span>
            </button>
        </a>`.trim();
    } else if (context === 'Manganelo') {
        const mgloLogo = chrome.runtime.getURL('assets/site-logos/manganelo-logo.png')
        html = (!dataError) ? `
        <a href="${url}" target="_blank" rel="noopener noreferrer" class="inj-a-tag">
            <button class="inj-btn-tag mglo unblocked">
                <p class="bt-text">Read on</p>
                <img src="${mgloLogo}" id="mglo-logo" />
            </button>
        </a>`.trim() : `
        <a class="inj-a-tag">
            <button class="inj-btn-tag mglo blocked">
                <p class="bt-text">Read on</p>
                <img src="${mgloLogo}" id="mglo-logo" />
                <span class="block-pop">No Data on Manganelo</span>
            </button>
        </a>`.trim();
    } else if (context === 'NovelUpdates') {
        const nuLogo = chrome.runtime.getURL('assets/site-logos/novelupdates-logo.png')
        html = (!dataError) ? `
        <a href="${url}" target="_blank" rel="noopener noreferrer" class="inj-a-tag">
            <button class="inj-btn-tag nu unblocked">
                <p class="bt-text">Read on</p>
                <img src="${nuLogo}" id="nu-logo" />
            </button>
        </a>`.trim() : `
        <a class="inj-a-tag">
            <button class="inj-btn-tag nu blocked">
                <p class="bt-text">Read on</p>
                <img src="${nuLogo}" id="nu-logo" />
                <span class="block-pop">No Data on NovelUpdates</span>
            </button>
        </a>`.trim();

    } else if (context === "GoGoAnime") {
        const ggALogo = chrome.runtime.getURL('assets/site-logos/gogoanime-logo.png')
        html = (!dataError) ? `
        <a href="${url}" target="_blank" rel="noopener noreferrer" class="inj-a-tag">
            <button class="inj-btn-tag gogo unblocked">
                <p class="bt-text">Watch on</p>
                <img src="${ggALogo}" id="gga-logo"/>
            </button>
        </a>`.trim() : `
        <a class="inj-a-tag">
            <button class="inj-btn-tag gogo blocked">
                <p class="bt-text">Watch on</p>
                <img src="${ggALogo}" id="gga-logo"/>
                <span class="block-pop">No Data on GoGoAnime</span>
            </button>
        </a>`.trim();
    } else if (context === "YouTube") {
        const ytLogo = chrome.runtime.getURL('assets/site-logos/youtube-logo.svg')
        html = (!dataError) ? `
        <a href="${url}" target="_blank" rel="noopener noreferrer" class="inj-a-tag">
            <button class="inj-btn-tag yt unblocked">
                <p class="bt-text">Watch on</p>
                <img src="${ytLogo}" id="yt-logo"/>
            </button>
        </a>`.trim() : `
        <a class="inj-a-tag">
            <button class="inj-btn-tag yt blocked">
                <p class="bt-text">Watch on</p>
                <img src="${ytLogo}" id="yt-logo"/>
                <span class="block-pop">No Data on YouTube</span>
            </button>
        </a>`.trim();

    } else {
        html = `
        <a class="inj-a-tag">
            <button class="inj-btn-tag err blocked">
            <p class="bt-text">Content Unavailable</p>
            <span class="block-pop">Feature not Currently Supported</span>
            </button>
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

function parseMALForumJSON(jsonData) {
    let youtubeVID;
    for (var i = 0; i < jsonData['data']['posts'].length; i ++) {
        const textBody = jsonData['data']['posts'][i]['body'];
        if (textBody.includes('[yt]') && textBody.includes('[/yt]')) {
            youtubeVID = textBody.match(/\[yt\](.+)\[\/yt\]/gm)[0]
                .replace("[yt]", "").replace("[/yt]", "");
            return `https://www.youtube.com/watch?v=${youtubeVID}`
        } else if (textBody.includes('[YT]') && textBody.includes('[/YT]')) {
            youtubeVID = textBody.match(/\[YT\](.+)\[\/YT\]/gm)[0]
                .replace("[YT]", "").replace("[/YT]", "");
            return `https://www.youtube.com/watch?v=${youtubeVID}`
        } else if (textBody.includes('https://www.youtube.com/watch?v=')) {
            return textBody.match(/https:\/\/www\.youtube\.com\/watch\?v=.{11}/gm)
        }
    };
    return "";
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