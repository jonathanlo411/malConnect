import { fetchGoGoAnime, fetchMangaDex, fetchNovelUpdates } from "../modules/fetch.js";
import buildHTML from "../modules/build.js"

// Top Level call
let sourceType = document.getElementsByClassName("type")[0].children[0].textContent;
let targetTitle;
if (sourceType === 'Manga') {
    // Manga sites: MangaDex
    targetTitle =  document.getElementsByClassName('h1-title')[0].childNodes[0].childNodes[0].data;
    fetchMangaDex(targetTitle)
        .then((res) => buildHTML("MangaDex", res))
} else if (sourceType === 'Light Novel') {
    // Novel sites: NovelUpdates
    targetTitle =  document.getElementsByClassName('h1-title')[0].childNodes[0].childNodes[0].data;
    fetchNovelUpdates(targetTitle)
        .then((res) => buildHTML(res))
} else {
    // Anime/Movie sites: GoGoAnime
    targetTitle = document.getElementsByClassName('h1_bold_none')[0].textContent;
    fetchGoGoAnime(targetTitle)
        .then((res) => buildHTML("GoGoAnime", res))
}
