const MESSAGE = {
    INIT: 'INIT',
    RELOAD_PAGE: 'RELOAD_PAGE',
    UPDATE_CHECK_CONDITION: 'UPDATE_CHECK_CONDITION',
}

const makeActionMessage = (mes, payload = {}) => ({
    action: mes,
    payload,
})
const InitCheckConditionHandler = {
    key: 'INIT_CHECK_CONDITION',

    setToLS(inputVal) {
        localStorage.setItem(this.key, inputVal)
    },

    getValueFromLS() {
        const res = localStorage.getItem(this.key);
        return res ?? '市場'
    },

    // sendMessage(el, ) {},

    setInitMessage(el = document.createElement('input')) {
        const valFromLS = this.getValueFromLS();
        if(el) {
            el.value = valFromLS;
        }
        const message = makeActionMessage(MESSAGE.UPDATE_CHECK_CONDITION, {
            value: valFromLS,
        })
        sendMessageCurrentTab(message);
    }
}

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
    InitCheckConditionHandler.setInitMessage();
})


const initCheckConditionInput = document.getElementById('initCheckConditionInput');
InitCheckConditionHandler.setInitMessage(initCheckConditionInput);
initCheckConditionInput.addEventListener('input', (e) => {
    const inputVal = e.target.value
    const message = makeActionMessage(MESSAGE.UPDATE_CHECK_CONDITION, {
        value: inputVal,
    })
    InitCheckConditionHandler.setToLS(inputVal);
    sendMessageCurrentTab(message);
})