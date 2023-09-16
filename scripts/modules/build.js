
const READ_TAG = ['MangaDex', 'Manganelo', 'NovelUpdates']
const SOURCE_ASSETS = {
    MangaDex: {
        imgSrc: chrome.runtime.getURL('assets/site-logos/md-logo.svg'),
        cssCode: 'mdex',
        parser: parseMangaDex
    },
    Manganelo: {
        imgSrc: chrome.runtime.getURL('assets/site-logos/manganelo-logo.png'),
        cssCode: 'mglo',
        parser: parseManganelo
    },
    NovelUpdates: {
        imgSrc: chrome.runtime.getURL('assets/site-logos/novelupdates-logo.png'),
        cssCode: 'nu',
        parser: parseNovelUpdates
    },
    Anix: {
        imgSrc: chrome.runtime.getURL('assets/site-logos/anix-logo.png'),
        cssCode: 'anix',
        parser: parseAnix,
        episodeConvert: (url, epCount) => `${url}/ep-${epCount + 1}`
    },
    Aniwave: {
        imgSrc: chrome.runtime.getURL('assets/site-logos/9anime-logo.png'),
        cssCode: 'na',
        parser: parseAniwave,
        episodeConvert: (url, epCount) => `${url}/ep-${epCount + 1}`
    },
    GoGoAnime: {
        imgSrc: chrome.runtime.getURL('assets/site-logos/gogoanime-logo.png'),
        cssCode: 'gogo',
        parser: parseGoGoAnime,
        episodeConvert: (url, epCount) => `${url.replace('category/', '')}-episode-${epCount + 1}`
    },
    YouTube: {
        imgSrc: chrome.runtime.getURL('assets/site-logos/youtube-logo.svg'),
        cssCode: 'yt',
        parser: parseYouTube
    }
}

function buildHTML(sourceTarget, data, targetTitle, episodeNumber) {

    // Obtain targets
    const domTarget = document.getElementsByClassName('leftside')[0];
    const referenceObject = domTarget.children[1];
    const malWatchButton = document.getElementById('broadcast-block')
    let htmlButton;
    
    // Build buttons
    if ((!data) || (data && data.msg && data.msg === 'invalid')) { 
        htmlButton = createButton(sourceTarget, "", null)
    } else {
        const url = SOURCE_ASSETS[sourceTarget].parser(data)
        htmlButton = createButton(sourceTarget, url, episodeNumber)
    }

    // Insertion
    domTarget.insertBefore(htmlButton, referenceObject);
    if (malWatchButton) { malWatchButton.remove() };
}

function createButton(sourceTarget, url, episodeNumber) {
    const template = document.createElement('template');
    const source = SOURCE_ASSETS[sourceTarget]
    const dataError = url === "";
    url = (episodeNumber) ? source.episodeConvert(url, episodeNumber) : url
    let html;

    if (!source) {  // General error 
        html = `
        <a class="inj-a-tag">
            <button class="inj-btn-tag err blocked">
            <p class="bt-text">Content Unavailable</p>
            <span class="block-pop">Feature not Currently Supported</span>
            </button>
        </a>`.trim();
    } else if (!dataError) {  // Good response 
        html = `
        <a href="${url}" target="_blank" rel="noopener noreferrer" class="inj-a-tag">
            <button class="inj-btn-tag ${source.cssCode} unblocked">
                <p class="bt-text">${(READ_TAG.includes(sourceTarget) ? "Read" : "Watch")} on</p>
                <img src="${source.imgSrc}" id="${source.cssCode}-logo" />
            </button>
        </a>`.trim()
    } else {  // Source does not contain target
        html = `
        <a class="inj-a-tag">
            <button class="inj-btn-tag ${source.cssCode} blocked">
                <p class="bt-text">Watch on</p>
                <img src="${source.imgSrc}" id="na-logo" />
                <span class="block-pop">No Data on ${sourceTarget}</span>
            </button>
        </a>`.trim();
    }

    template.innerHTML = html;
    return template.content.firstChild;
}


// ------ Parsers ------


// --- Anime Parsers --- 

function parseAnix(doc) {
    // Parse Anix DOM
    const animeList = doc.getElementsByClassName('ani-name');
    if (animeList.length !== 0) {
        return animeList[0].children[0].href
    } else {
        return ''
    }
}

function parseAniwave(doc) {
    // Parse Aniwave DOM
    const animeList = doc.getElementsByClassName('d-title');
    if (animeList.length !== 0) {
        return animeList[0].href
    } else {
        return ''
    }
}

function parseGoGoAnime(doc) {
    // Parse DOM for non dub results
    const animeList = doc.getElementsByClassName('name')
    let animeLink;
    for (let i = 0; i < animeList.length; i ++) {
        let anime = animeList[i];
        if (!(anime.innerText.includes("Dub") || anime.innerText.includes("dub"))) {
            animeLink = anime.children[0].href;
            break
        }
    }
    return (animeLink) ? 
        `https://gogoanimehd.io/${animeLink.replace("https://myanimelist.net/", "")}`
        : ''
}

// --- Manga Parsers ---

function parseMangaDex(data) {
    // Removes any data that has one of the banned tags
    const bannedTags = ["Oneshot", "Doujinshi"];
    let approvedData = [];
    for (let i = 0; i < data['data'].length; i ++) {
        let notBanned = true;
        let dataEntry = data['data'][i]
        for (let j = 0; j < dataEntry["attributes"]["tags"].length; j ++) {
            if (bannedTags.includes(dataEntry["attributes"]["tags"][j]["attributes"]["name"]["en"])) {
                notBanned = false;
                break;
            }
        }
        if (notBanned) { approvedData.push(data['data'][i]) };
    }

    // Builds URL if there are any remaining results
    return (approvedData) ?
        `https://mangadex.org/title/${approvedData[0].id}`
        : ''
}

function parseManganelo(doc) {
    const mangaItems = doc.getElementsByClassName('item-title');
    return (mangaItems) ?
        mangaItems[0].href
        : ''
}

// --- Novel Parsers ---

function parseNovelUpdates(data) {
    // (From MD parser)
    const bannedTags = ["Oneshot", "Doujinshi"];
    let approvedData = [];
    for (let i = 0; i < data['data'].length; i ++) {
        let notBanned = true;
        let dataEntry = data['data'][i]
        for (let j = 0; j < dataEntry["attributes"]["tags"].length; j ++) {
            if (bannedTags.includes(dataEntry["attributes"]["tags"][j]["attributes"]["name"]["en"])) {
                notBanned = false;
                break;
            }
        }
        if (notBanned) { approvedData.push(data['data'][i]) };
    }

    // Obtain NovelUpdates link from MD page
    if (approvedData) {
        const primarySlugs = approvedData[0]['attributes']['links']
        const novelUpdatesSlug = (Object.hasOwn(primarySlugs, "nu")) ?
            primarySlugs['nu']
            : ''
        return (novelUpdatesSlug) ?
            `https://www.novelupdates.com/series/${novelUpdatesSlug}`
            : ''
    }
    return ''
}

// --- Music Parsers ---

function parseYouTube(jsonData) {
    let youtubeVID;
    for (let i = 0; i < jsonData['data']['posts'].length; i ++) {
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

export default buildHTML