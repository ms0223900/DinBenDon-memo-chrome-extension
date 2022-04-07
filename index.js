const MESSAGE = {
    INIT: 'INIT',
    RELOAD_PAGE: 'RELOAD_PAGE',
    UPDATE_CHECK_CONDITION: 'UPDATE_CHECK_CONDITION',
}

const makeActionMessage = (mes, payload = {}) => ({
    action: mes,
    payload,
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

const initCheckConditionInput = document.getElementById('initCheckConditionInput');
initCheckConditionInput.addEventListener('change', (e) => {
    const message = makeActionMessage(MESSAGE.UPDATE_CHECK_CONDITION, {
        value: e.target.value,
    })
    sendMessageCurrentTab(message);
})