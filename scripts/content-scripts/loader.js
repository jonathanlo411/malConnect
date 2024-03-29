import {
    fetchSource,
    checkResponse
} from "../modules/fetch.js";
import buildHTML from "../modules/build.js"

// Definitions
const manga = ["Manga", "Manhwa", "Manhua"]
const novel = ["Novel", "Light Novel"]
const music = ["Music"]
let notYetAired = false;
let sourceType;
let backupTitleJP;
let backupTitleEN;
let targetTitle;
let USER_EPISODE_COUNT;
let DISPLAY_LINK_SETTINGS;

// Grab backupTitle and airing status
let countMax = 10
for (let infoTag of document.getElementsByClassName('spaceit_pad')) {
    if (countMax === 0) { break };
    if (infoTag.innerHTML.includes('Not yet aired')) { notYetAired = true; }
    if (infoTag.innerHTML.includes('Japanese:')) { backupTitleJP = infoTag.innerText.replace('Japanese: ', ''); }
    if (infoTag.innerHTML.includes('English:')) { backupTitleEN = infoTag.innerText.replace('English: ', ''); }
    countMax -= 1;
}

// Fetch Source type
const baseSourceType = document.getElementsByClassName("type")[0];
if (baseSourceType.firstChild.hasChildNodes()) {
    sourceType = baseSourceType.children[0].textContent 
} else {
    sourceType = baseSourceType.textContent
}

// Proccess user's episode count for redirection
function collectUserEpisode() {
    USER_EPISODE_COUNT = document.getElementById('myinfo_watchedeps').value
    const totalEpisodes = document.getElementById('curEps').innerHTML
    if (USER_EPISODE_COUNT === totalEpisodes) {
        USER_EPISODE_COUNT = 0
    }
}

// Load button settings
async function loadSettings() {
    DISPLAY_LINK_SETTINGS = (await chrome.storage.sync.get(["settingDL"])).settingDL
    if (!DISPLAY_LINK_SETTINGS) DISPLAY_LINK_SETTINGS = false
}

// Handle all button generations
async function handleButtonGeneration(targetTile, backupTitle, sourceTarget) {
    if (DISPLAY_LINK_SETTINGS && (!DISPLAY_LINK_SETTINGS[sourceTarget])) return
    let initialData = await fetchSource(targetTile, sourceTarget)
    let rawData = await checkResponse(sourceTarget, initialData, backupTitle)
    buildHTML(sourceTarget, rawData, targetTile, parseInt(USER_EPISODE_COUNT))
}

// Top Level call
( async () => {
if (!notYetAired) {
    await loadSettings()
    if (manga.includes(sourceType)) {
        // Manga sites: MangaDex, Manganelo
        targetTitle = document.getElementsByClassName('h1-title')[0].childNodes[0].childNodes[0].data;
        handleButtonGeneration(targetTitle, backupTitleJP, "MangaDex")
        handleButtonGeneration(targetTitle, backupTitleEN, "Manganelo")
    } else if (novel.includes(sourceType)) {
        // Novel sites: NovelUpdates
        targetTitle =  document.getElementsByClassName('h1-title')[0].childNodes[0].childNodes[0].data;
        handleButtonGeneration(targetTitle, backupTitleJP, "NovelUpdates")
    } else if (music.includes(sourceType)) {
        // Music Video sites: Youtube
        let forumID;
        const forumTopics = document.querySelectorAll("#forumTopics .ga-click")
        for (let topic of forumTopics) { if (topic.innerHTML.includes("Episode 1")) {
                forumID = topic.href.replace("https://myanimelist.net/forum/?topicid=", "")
                break
            }
        }
        handleButtonGeneration(forumID, null, "YouTube")
    } else {
        // Anime/Movie sites: GoGoAnime, Anix, Aniwave
        targetTitle = document.getElementsByClassName('h1_bold_none')[0].textContent;
        collectUserEpisode()
        handleButtonGeneration(targetTitle, backupTitleJP, "Aniwave")
        handleButtonGeneration(targetTitle, backupTitleJP, "Anix")
        handleButtonGeneration(targetTitle, backupTitleJP, "GoGoAnime")
    }
}
})()
