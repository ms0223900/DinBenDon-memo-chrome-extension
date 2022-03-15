function loadPlugin() {
    const regex = {
        TR_INNER_TEXT_FOR_FILTER: /市場/g
    }

    const appendStyle = () => {
        const styleTxt = `
            tr:hover { background-color: #eee; }
            td {
                position: relative; 
                padding-bottom: 1rem; 
            }
            input { width: 100%; padding: 0.25rem; }
            td label {
                position: absolute;
                top: 0;
                bottom: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                width: 100%;
                height: 100%;
            }
        `;
        const head = document.getElementsByTagName('head')[0];
        const style = document.createElement('style');
        style.innerHTML = styleTxt;
        head.appendChild(style)
    }
    // window.location.reload();
    const checkTrIsOurGroup = (el) => {
        if (el.innerText.match(regex.TR_INNER_TEXT_FOR_FILTER)) return true;
        return false;
    }
    const getEls = () => {
        const tableEl = document.querySelector('section#by-buyer-tab table');
        const trElList = [...tableEl.getElementsByTagName('tr')];
        return ({
            tableEl,
            trElList,
        })
    }

    const clickTab = () => {
        const tabBtn = document.querySelector('a[aria-controls="by-buyer-tab"]');
        // console.log(tabBtn);
        tabBtn && tabBtn.click();
    }

    const getTodayStr = () => {
        const today = new Date();
        return `${today.getMonth()}-${today.getDate()}`
    }

    const hideTrEl = (el) => {
        el.style.display = 'none';
    }
    const hideUselessComponents = () => {
        const header = document.getElementById('header');
        header.style.display = 'none';
        const titles = document.getElementsByTagName('h3');
        console.log(titles);
        titles && [...titles].forEach(el => el.style.display = 'none');
        const tabList = document.querySelector('ul[role="tablist"]');
        tabList.style.display = 'none';
        const adPartElList = document.querySelectorAll('div.d-print-none');
        adPartElList.forEach(adPart => {
            adPart.style.display = 'none'
        });
    }
    const hideNotOurGroupTrList = (trElList = []) => {
        trElList.forEach(el => {
            if (!checkTrIsOurGroup(el)) {
                hideTrEl(el)
            }
        })
    }

    const getOrderIdFromUrl = () => {
        const url = window.location.href;
        const params = new URLSearchParams(url);
        const id = params.get('id');
        return id;
    }
    const DinBenDanState = {
        todayLSKey: 'DinBenDan-Date' + '-' + getOrderIdFromUrl(),
        LSKey: 'DinBenDan-State' + '-' + getOrderIdFromUrl(),

        init() {
            const todayStr = getTodayStr();
            const state = this.getState();
            const LSDate = localStorage.getItem(this.todayLSKey);

            if (LSDate && LSDate !== todayStr) {
                localStorage.removeItem(this.LSKey);
                // return;
            }
            localStorage.setItem(this.todayLSKey, todayStr);

        },

        getState() {
            const res = localStorage.getItem(this.LSKey);
            if (!res) return {};
            return JSON.parse(res);
        },

        setState(key = '市場-ABC', checked = true) {
            const state = this.getState();
            state[key] = checked;
            if (!checked) {
                delete state[key];
            }
            localStorage.setItem(this.LSKey, JSON.stringify(state));
        },
    }
    const MoneyChangeLSState = {
        LSKey: 'DinBenDan-MoneyChange-State' + '-' + getOrderIdFromUrl(),

        getState() {
            const res = localStorage.getItem(this.LSKey);
            if (!res) return {};
            return JSON.parse(res);
        },

        setState(key = '市場-ABC', val = '') {
            const state = this.getState();
            state[key] = val;
            localStorage.setItem(this.LSKey, JSON.stringify(state));
        }
    }

    const getTrKey = (el) => {
        // prettier-ignore
        return el.querySelector('div.merged-key')?.innerText
    }
    const setCheckboxChecked = (el, checked) => {
        if (checked) {
            el.setAttribute('checked', true);
            return;
        }
        el.removeAttribute('checked');
    }


    const prependCheckbox = () => {
        const {
            trElList
        } = getEls();
        const LSState = DinBenDanState.getState();

        [...trElList].forEach((el, idx) => {
            const isOurGroup = checkTrIsOurGroup(el);
            if (!isOurGroup) {
                return;
            }

            const checkboxEl = document.createElement('input');
            // checkboxEl.style.marginTop = '10px';

            const trKey = getTrKey(el);
            const checked = LSState[trKey];

            // console.log(trKey);
            checkboxEl.setAttribute('type', 'checkbox');
            setCheckboxChecked(checkboxEl, checked)

            checkboxEl.addEventListener('change', e => {
                DinBenDanState.setState(trKey, e.target.checked);
            })
            const cell = document.createElement('td');
            const label = document.createElement('label');
            cell.appendChild(label);
            label.appendChild(checkboxEl)

            el.prepend(cell);
        })
    }

    const appendSingleMoneyChangeInput = (trEl) => {
        const inputEl = document.createElement('input');
        const trKey = getTrKey(trEl);
        const state = MoneyChangeLSState.getState();

        const setElBGColor = (el, color='#bbb') => {
            el.style.background = color;
        };
        const resetElBGColor = (el) => {
            el.style.background = null;
        }

        inputEl.value = state[trKey] || '';
        inputEl.type = 'number';
        inputEl.placeholder = '需找多少錢，找完直接清空即可';
        inputEl.addEventListener('input', (e) => {
            const val = e.target.value;
            MoneyChangeLSState.setState(trKey, val);
            if(val) {
                setElBGColor(trEl)
            } else {
                resetElBGColor(trEl);
            }
        })

        const clearBtn = document.createElement('button');
        clearBtn.innerText = '已找錢（清空）'
        clearBtn.addEventListener('click', () => {
            inputEl.value = '';
            MoneyChangeLSState.setState(trKey, '');
            resetElBGColor(trEl)
        })
        const cell = document.createElement('td');

        cell.appendChild(inputEl);
        cell.appendChild(clearBtn);
        trEl.appendChild(cell);
    }
    const appendMoneyChangeInputListToTrList = () => {
        const {
            trElList
        } = getEls();
        trElList.forEach(trEl => {
            const isOurGroup = checkTrIsOurGroup(trEl);
            if (!isOurGroup) {
                return;
            }
            appendSingleMoneyChangeInput(trEl);
        })
    }

    const appendTotalPrices = () => {
        const {
            tableEl,
            trElList
        } = getEls();
        const filteredTrElList = [...trElList].filter(el => checkTrIsOurGroup(el));

        const getSinglePrice = (trEl) => {
            const priceTxt = trEl.getElementsByTagName('td')[2]?.innerText;
            // console.log(priceTxt);
            return Number(priceTxt);
        }
        let total = 0;
        filteredTrElList.forEach(el => {
            total += getSinglePrice(el);
        });

        const totalEl = document.createElement('h2');
        tableEl.setAttribute('id', 'totalPrice');
        totalEl.innerText = `Total: $${total}`;
        tableEl.appendChild(totalEl);
    }

    function main() {
        clickTab();
        DinBenDanState.init();

        setTimeout(() => {
            const {
                trElList,
                tableEl,
            } = getEls()
            appendStyle();
            hideUselessComponents();
            hideNotOurGroupTrList(trElList)
            appendTotalPrices();

            prependCheckbox();
            appendMoneyChangeInputListToTrList();
        }, 300);
    }

    main();
}

const MESSAGE = {
    INIT: 'INIT',
    RELOAD_PAGE: 'RELOAD_PAGE',
}

chrome.runtime.onMessage.addListener((mes, sender, sendRes) => {
    switch (mes.action) {
        case MESSAGE.INIT:
            if(document.getElementById('totalPrice')) return;
            loadPlugin();
            break;
        case MESSAGE.RELOAD_PAGE:
            window.location.reload()
        default:
            break;
    }
})