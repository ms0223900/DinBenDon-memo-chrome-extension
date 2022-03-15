const MESSAGE = {
    INIT: 'INIT',
    RELOAD_PAGE: 'RELOAD_PAGE',
}

const makeActionMessage = (mes) => ({
    action: mes,
})

const sendMessageCurrentTab = (messageObj) => {
    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, messageObj, (response) => {

        });
    });
} 

const loadPluginBtn = document.getElementById('loadPluginBtn');
loadPluginBtn.addEventListener('click', () => {
    const message = makeActionMessage(MESSAGE.INIT)
    sendMessageCurrentTab(message)
})

const reloadPageBtn = document.getElementById('reloadPage');
reloadPageBtn.addEventListener('click', () => {
    const message = makeActionMessage(MESSAGE.RELOAD_PAGE)
    sendMessageCurrentTab(message)
})