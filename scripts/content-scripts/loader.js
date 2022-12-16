import { fetchGoGoAnime, fetchMangaDex, fetchNovelUpdates, checkResponse } from "../modules/fetch.js";
import buildHTML from "../modules/build.js"

// Definitions
const manga = ["Manga", "Manhwa", "Manhua"]
const novel = ["Novel", "Light Novel"]
var NYA = false;
let sourceType = document.getElementsByClassName("type")[0].children[0].textContent;
let backupTitle;
let targetTitle;

// Grab backupTitle and If not aired, do not fetch
var countMax = 10
for (var infoTag of document.getElementsByClassName('spaceit_pad')) {
    if (countMax === 0) { break };
    if (infoTag.innerHTML.includes('Not yet aired')) { NYA = true; }
    if (infoTag.innerHTML.includes('Japanese:')) { backupTitle = infoTag.innerText.replace('Japanese: ', ''); }
    countMax -= 1;
}

// Top Level call
if (!NYA) {
    if (manga.includes(sourceType)) {
        // Manga sites: MangaDex
        targetTitle = document.getElementsByClassName('h1-title')[0].childNodes[0].childNodes[0].data;
        fetchMangaDex(targetTitle)
            .then((res) => checkResponse("MangaDex", res, backupTitle))
            .then((res) => buildHTML("MangaDex", res, targetTitle));
    } else if (novel.includes(sourceType)) {
        // Novel sites: NovelUpdates
        targetTitle =  document.getElementsByClassName('h1-title')[0].childNodes[0].childNodes[0].data;
        fetchNovelUpdates(targetTitle)
            .then((res) => buildHTML("NovelUpdates", res, targetTitle));
    } else {
        // Anime/Movie sites: GoGoAnime
        targetTitle = document.getElementsByClassName('h1_bold_none')[0].textContent;
        fetchGoGoAnime(targetTitle)
            .then((res) => buildHTML("GoGoAnime", res, targetTitle));
    }
}
