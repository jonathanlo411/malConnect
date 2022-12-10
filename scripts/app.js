
const url="https://api.mangadex.org/manga"
const params={"title": "Kaguya-sama wa Kokurasetai: Tensai-tachi no Renai Zunousen"}


// Top Level call
fetchMangaDex(url, params)
    .then((data) => handleMangaDex(data))
    .then((data) => console.log(data))





// ##########################
// #    Helper Functions    #
// ##########################

async function fetchMangaDex(url = '', params = {}) {
    const response = await fetch(
        `${url}?${new URLSearchParams(params)}`,
        {
            method: 'GET',
            cache: 'no-cache',
            mode: 'cors',
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            }
        }
    )
    return response.json()
}

function handleMangaDex(mangaJson) {
    const mangaID = mangaJson['data'][0]['id']
    return `https://mangadex.org/title/${mangaID}`
}