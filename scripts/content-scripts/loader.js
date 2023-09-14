import { fetchGoGoAnime, fetchYoutubeMV, fetchMangaDex, fetchManganelo, fetchNovelUpdates, checkResponse } from "../modules/fetch.js";
import buildHTML from "../modules/build.js"

// Definitions
const manga = ["Manga", "Manhwa", "Manhua"]
const novel = ["Novel", "Light Novel"]
const music = ["Music"]
var NYA = false;
let sourceType;
let backupTitleJP;
let backupTitleEN;
let targetTitle;
let forumID;

// Grab backupTitle and If not aired, do not fetch
var countMax = 10
for (var infoTag of document.getElementsByClassName('spaceit_pad')) {
    if (countMax === 0) { break };
    if (infoTag.innerHTML.includes('Not yet aired')) { NYA = true; }
    if (infoTag.innerHTML.includes('Japanese:')) { backupTitleJP = infoTag.innerText.replace('Japanese: ', ''); }
    if (infoTag.innerHTML.includes('English:')) { backupTitleEN = infoTag.innerText.replace('English: ', ''); }
    countMax -= 1;
}
const baseSourceType = document.getElementsByClassName("type")[0];
sourceType = (baseSourceType.firstChild.hasChildNodes()) ? baseSourceType.children[0].textContent : baseSourceType.textContent;


// Top Level call
if (!NYA) {
    if (manga.includes(sourceType)) {
        // Manga sites: MangaDex
        targetTitle = document.getElementsByClassName('h1-title')[0].childNodes[0].childNodes[0].data;
        fetchMangaDex(targetTitle)
            .then((res) => checkResponse("MangaDex", res, backupTitleJP))
            .then((res) => buildHTML("MangaDex", res, targetTitle));
        fetchManganelo(targetTitle)
            .then((res) => checkResponse("Manganelo", res, backupTitleEN))
            .then((res) => buildHTML("Manganelo", res, targetTitle));
    } else if (novel.includes(sourceType)) {
        // Novel sites: NovelUpdates
        targetTitle =  document.getElementsByClassName('h1-title')[0].childNodes[0].childNodes[0].data;
        fetchNovelUpdates(targetTitle)
            .then((res) => buildHTML("NovelUpdates", res, targetTitle));
    } else if (music.includes(sourceType)) {
        // Youtube Music Videos for Anime
        const forumTopics = document.getElementById('forumTopics')
            .getElementsByClassName('ga-click');
        for (var i = 0; i < forumTopics.length; i ++) {
            if (forumTopics[i].textContent.includes("Episode 1")) {
                forumID = forumTopics[i].href.replace("https://myanimelist.net/forum/?topicid=", "")
            }
        }
        fetchYoutubeMV(forumID)
            .then((res) => buildHTML("YouTube", res, targetTitle));
    } else {
        // Anime/Movie sites: GoGoAnime
        targetTitle = document.getElementsByClassName('h1_bold_none')[0].textContent;
        // fetchGoGoAnime(targetTitle)
        //     .then((res) => buildHTML("GoGoAnime", res, targetTitle));
        buildHTML("GoGoAnime", null, targetTitle)
        buildHTML("9anime", null, targetTitle)
    }
}
