
let DISPLAY_LINK_SETTINGS = {}
const toggleInputs = document.getElementsByTagName('input')

async function loadSettings() {

    // Load display link settings; init if not done
    DISPLAY_LINK_SETTINGS =  (await chrome.storage.sync.get(["settingDL"])).settingDL
    if (DISPLAY_LINK_SETTINGS) {
        for (let i = 0; i < toggleInputs.length; i ++) {
            const input = toggleInputs[i]
            input.checked = DISPLAY_LINK_SETTINGS[input.id]
        }
    } else {
        DISPLAY_LINK_SETTINGS = {}
        _ = [...toggleInputs].map((d) => DISPLAY_LINK_SETTINGS[d.id] = true)
        console.log(DISPLAY_LINK_SETTINGS)
        await chrome.storage.sync.set({ settingDL: DISPLAY_LINK_SETTINGS })
    }

    // Save display link changes
    for (let i = 0; i < toggleInputs.length; i ++) {
        const input = toggleInputs[i]
        input.addEventListener("change", async () => {
            DISPLAY_LINK_SETTINGS[input.id] = input.checked
            await chrome.storage.sync.set({ settingDL: DISPLAY_LINK_SETTINGS })
            console.log(DISPLAY_LINK_SETTINGS)
        })
    }
}

loadSettings()
