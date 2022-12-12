
// Top level control
getMALTabs()
    .then((chromeTabData) => loader(chromeTabData))


// ##########################
// #    Helper Functions    #
// ##########################

async function getMALTabs() {
    let queryOptions = { url: ['https://myanimelist.net/anime/*','https://myanimelist.net/manga/*'] };
    let tab = await chrome.tabs.query(queryOptions);
    return tab;
}

function loader(chromeTabData) {
    for (i = 0; i < chromeTabData.length; i ++) {
        let tabData = chromeTabData[i]
        if (tabData.url.startsWith('https://myanimelist.net/anime')) {
            launchScript('anime', tabData.id)
        } else if (tabData.url.startsWith('https://myanimelist.net/manga')) {
            launchScript('manga', tabData.id)
        } else {
            alert("An error has occured")
            console.log(tabData)
        }
    }
}

function launchScript(type, id) {
    chrome.scripting.executeScript(
        {
            target: {tabId: id},
            files: (type === 'anime') ? ['scripts/loadAnime.js'] : ['scripts/loadMangaDex.js']
        }
    )
}
    