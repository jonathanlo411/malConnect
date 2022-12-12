(async () => {
    const src = chrome.runtime.getURL('scripts/content-scripts/loader.js');
    const contentScript = await import(src);
    contentScript;
})();
