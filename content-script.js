function loadPlugin() {
    const regex = {
        TR_INNER_TEXT_FOR_FILTER: /市場/g
    }

    const EL_ATTRIBUTES = {
        change: 'small-change-to-give',
    }

    const debounce = (cb, timeMs = 100) => {
        let timer;
        const fn = (...params) => {
            let res;
            if (timer) return;
            timer = setTimeout(() => {
                res = cb(...params);
                clearTimeout(timer);
                timer = undefined;
                // if (!timer) {
                // }
            }, timeMs);
            return res;
        };
        return fn;
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
                cursor: pointer;
            }

            #searchInputWrapper {
                z-index: 1000;
                position: sticky;
                top: 0;
                background: #fff;
                box-shadow: 0 6px 10px #00000010;
            }

            #searchInput {
                margin: 1rem;
                padding: 0.5rem;
                min-width: 300px;
                width: auto;
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

    const getTodayStr = () => {
        const today = new Date();
        return `${today.getMonth()}-${today.getDate()}`
    }

    const hideTrEl = (el = document.createElement('tr')) => {
        el.style.display = 'none';
        el.setAttribute('is-hidden', true);
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

        getStateByKey(key = '市場-ABC') {
            const state = this.getState();
            return state[key];
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

        const fadeCheckedTr = (trKey = '市場-aaa', trEl = document.createElement('tr')) => (checked = false) => {
            const smallChangeToGiveState = MoneyChangeLSState.getStateByKey(trKey);
            // console.log('smallChangeToGiveState: ', smallChangeToGiveState)
            if (checked && !smallChangeToGiveState) {
                trEl.style.opacity = 0.2
                return;
            }
            trEl.style.opacity = 1
        }

        [...trElList].forEach((el, idx) => {
            const isOurGroup = checkTrIsOurGroup(el);
            if (!isOurGroup) {
                return;
            }

            const checkboxEl = document.createElement('input');
            // checkboxEl.style.marginTop = '10px';
            
            const trKey = getTrKey(el);
            const checkedFromLSState = LSState[trKey];
            const fadeTrElFn = fadeCheckedTr(trKey, el)

            // console.log(trKey);
            checkboxEl.setAttribute('type', 'checkbox');
            setCheckboxChecked(checkboxEl, checkedFromLSState);
            fadeTrElFn(checkedFromLSState)

            checkboxEl.addEventListener('change', e => {
                const {
                    checked,
                } = e.target
                DinBenDanState.setState(trKey, checked);
                fadeTrElFn(checked)
            })
            const cell = document.createElement('td');
            const label = document.createElement('label');
            cell.appendChild(label);
            label.appendChild(checkboxEl)

            el.prepend(cell);
        })
    }

    const prependSearchInput = () => {
        const {
            trElList
        } = getEls();

        const trElListForShowAndHide = [...trElList].filter(el => {
            // console.log(el.getAttribute('is-hidden'))
            return !el.getAttribute('is-hidden')
        });

        function blurMatch(val = '', inputVal = '') {
            if (!inputVal) return true;

            const inputValLength = inputVal.length;
            let valArr = val.toLocaleLowerCase().split('').filter(s => !s.match(/\t|\n/g));
            const inputValArr = inputVal.toLocaleLowerCase().split('');
            let matchedIdxList = []
            let matchedCount = 0;

            for (let i = 0; i < inputValArr.length; i++) {
                const str = inputValArr[i];
                const matchedIdx = valArr.findIndex(v => v === str);
                if (matchedIdx !== -1) {
                    if (matchedIdxList.length === 0 || matchedIdx > matchedIdxList[matchedIdxList.length - 1]) {
                        matchedIdxList.push(matchedIdx);
                        matchedCount += 1;
                    }
                }
                // console.log(str, valArr)
            }

            return matchedCount === inputValLength;
        }

        function checkTrElShouldHide(trEl, val) {
            const elInnerTxt = trEl.innerText?.toLowerCase();
            const valTxt = val.toLowerCase()
            console.log(elInnerTxt, valTxt)
            const isElTextIncludesVal = blurMatch(elInnerTxt, valTxt);
            if (!isElTextIncludesVal) return true
            return false
        }

        const wrapperEl = document.createElement('div');
        wrapperEl.id = 'searchInputWrapper';

        const inputEl = document.createElement('input');
        inputEl.id = 'searchInput';
        inputEl.placeholder = '輸入關鍵字搜尋';
        inputEl.autofocus = true;

        const clearBtn = document.createElement('button');
        clearBtn.id = 'clearInputBtn';
        clearBtn.innerText = '清空搜尋'

        const handleSearch = (e) => {
            const val = e.target.value;
            if (!val) {
                trElListForShowAndHide.forEach(el => {
                    // el.style.visibility = 'visible';
                    el.style.display = null
                })
                return;
            }
            trElListForShowAndHide.forEach(el => {
                const shouldHide = checkTrElShouldHide(el, val);
                if (shouldHide) {
                    // 用collapse，會抓不到其中的innerText
                    // el.style.visibility = 'collapse';
                    el.style.display = 'none';
                } else {
                    // el.style.visibility = 'visible';
                    el.style.display = null;
                }
            })
        }

        inputEl.addEventListener('input', debounce(handleSearch, 100))
        clearBtn.addEventListener('click', () => {
            inputEl.value = '';
            handleSearch({
                target: {
                    value: '',
                }
            })
        })

        wrapperEl.appendChild(inputEl);
        wrapperEl.appendChild(clearBtn);

        document.body.prepend(wrapperEl);
    }

    const appendSingleMoneyChangeInput = (trEl) => {
        const inputEl = document.createElement('input');
        const trKey = getTrKey(trEl);
        const state = MoneyChangeLSState.getState();

        const setElHighlight = (el, color = '#bbb') => {
            el.style.background = color;
            el.setAttribute(EL_ATTRIBUTES.change, true)
        };
        const resetElHighlight = (el = document.createElement('tr')) => {
            el.style.background = null;
            el.removeAttribute(EL_ATTRIBUTES.change)
        }

        const inputtedValFromState = state[trKey];
        if (inputtedValFromState) {
            setElHighlight(trEl)
        }
        inputEl.value = state[trKey] || '';

        inputEl.type = 'number';
        inputEl.placeholder = '需找多少錢，找完直接清空即可';
        inputEl.addEventListener('input', (e) => {
            const val = e.target.value;
            MoneyChangeLSState.setState(trKey, val);
            if (val) {
                setElHighlight(trEl)
            } else {
                resetElHighlight(trEl);
            }
        })

        const clearBtn = document.createElement('button');
        clearBtn.innerText = '已找錢（清空）'
        clearBtn.addEventListener('click', () => {
            inputEl.value = '';
            MoneyChangeLSState.setState(trKey, '');
            resetElHighlight(trEl)
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
            const tdElList = trEl.getElementsByTagName('td')
            const priceTxt = tdElList[2]?.innerText;
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

    function clickTab() {
        const tabBtn = document.querySelector('a[aria-controls="by-buyer-tab"]');
        // console.log(tabBtn);
        tabBtn && tabBtn.click();
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
            prependSearchInput();
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
            if (document.getElementById('totalPrice')) return;
            loadPlugin();
            break;
        case MESSAGE.RELOAD_PAGE:
            window.location.reload()
        default:
            break;
    }
})