
const SOURCE_INFORMATION = {
    GoGoAnime: {
        url: (t) => `https://gogoanimehd.io/search.html?keyword=${t.replaceAll(' ', '%20')}`,
        requestType: 'html'
    },
    Anix: {
        url: (t) => `https://anix.to/filter?keyword=${t.replaceAll(' ', '%20')}`,
        requestType: 'html'
    },
    Aniwave: {
        url: (t) => `https://aniwave.to/filter?keyword=${t.replaceAll(' ', '+')}`,
        requestType: 'html'
    },
    YouTube: {
        url: (t) => `https://api.myanimelist.net/v2/forum/topic/${t}`,
        requestType: 'json',
        headers: {
            "X-MAL-CLIENT-ID": async () => {
                let apiCreds = await fetch(chrome.runtime.getURL("config.json"))
                const cleaned = await apiCreds.json()
                return cleaned['malClientID']
            }
        }
    },
    MangaDex: {
        url: (t) => {
            const params = {"title": t, "order[followedCount]": "desc"}
            return `https://api.mangadex.org/manga?${new URLSearchParams(params)}`
        },
        requestType: 'json'
    },
    Manganelo: {
        url: (t) => {
            const strip = t.replaceAll(' ', '_').replaceAll(/\W/g, '')
            return `https://m.manganelo.com/search/story/${strip}`
        },
        requestType: 'html'
    },
    NovelUpdates: {
        url: (t) => {
            const params = {"title": t, "order[followedCount]": "desc"}
            return `https://api.mangadex.org/manga?${new URLSearchParams(params)}`
        },
        requestType: 'json'
    }
}

// Where all fetch requests pass through
async function fetchSource(target, sourceTarget) {
    try {
        const source = SOURCE_INFORMATION[sourceTarget]
        if (sourceTarget === 'YouTube') {source.headers = {
            "X-MAL-CLIENT-ID": await source.headers['X-MAL-CLIENT-ID']()
        }} 
        return chrome.runtime.sendMessage(
            {
                url: source.url(target),
                requestType: source.requestType,
                headers: source.headers
            }
        )
    } catch {
        return { msg: "invalid" }
    }
}

// Validates results; Attempts retry if not valid
async function checkResponse(sourceType, res, backupTitle) {
    const failConditions = {
        Anix: (d) => d.getElementsByClassName('piece').length === 0,
        Aniwave: (d) => d.getElementsByClassName('d-title').length === 0,
        GoGoAnime: (d) => d.getElementsByClassName('name').length === 0,
        Manganelo: (d) => d.getElementsByClassName('item-title').length === 0,
        MangaDex: (d) => d['data'].length === 0,
        YouTube: (d) => false,
        NovelUpdates: (d) => false,
    }

    // Load DOM parser for HTML res
    if (SOURCE_INFORMATION[sourceType].requestType === 'html') {
        let parser = new DOMParser();
        res = parser.parseFromString(res, 'text/html');
    }

    // Ensure there are results to process
    if (failConditions[sourceType](res)) {
        if (backupTitle === "Final") {
            return { msg: "invalid" }
        } else {
            let backupRes = await fetchSource(backupTitle, sourceType)
            return checkResponse(sourceType, backupRes, "Final")
        }
    } else { return res }
}

export {
    fetchSource,
    checkResponse
}
