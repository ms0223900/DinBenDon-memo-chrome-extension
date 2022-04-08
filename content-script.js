const regex = {
    TR_INNER_TEXT_FOR_FILTER: /市場/g
}

function loadPlugin() {

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

    const libs = {
        updateElStyleByStyleObj: (el = document.createElement('div'), styleObj = {}) => {
            for (const styleKey of Object.keys(styleObj)) {
                el.style[styleKey.toString()] = styleObj[styleKey.toString()]
            }
        }
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

            #toggleHiddenCheckedLabel {
                display: flex;
                align-items: center;
                width: 200px;
                margin: 0.5rem;
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
    let _trElList = [];
    const getEls = () => {
        const tableEl = document.querySelector('section#by-buyer-tab table');
        const trElList = _trElList.length > 0 ? _trElList : [...tableEl.getElementsByTagName('tr')];
        _trElList = trElList;
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
        // console.log(titles);
        titles && [...titles].forEach(el => el.style.display = 'none');

        const tabList = document.querySelector('ul[role="tablist"]');
        tabList.style.display = 'none';

        const adPartElList = document.querySelectorAll('div.d-print-none');
        adPartElList.forEach(adPart => {
            adPart.style.display = 'none'
        });

        const thead = document.querySelector('.tiles.merge-table')?.querySelector('thead')
        if(thead) {
            thead.style.display = 'none'
        };
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

        setState(key = '市場-ABC', checked) {
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

    const actions = {
        UPDATE_CHECKED_BY_KEY: 'UPDATE_CHECKED_BY_KEY',
        UPDATE_CHANGE_VAL_BY_KEY: 'UPDATE_CHANGE_VAL_BY_KEY',
        RESET_CHANGE_VAL_BY_KEY: 'RESET_CHANGE_VAL_BY_KEY',
        UPDATE_HIDE_CHECKED: 'UPDATE_HIDE_CHECKED',
    }
    const CtxState = (() => {
        const listeners = [];
        let state = {
            checkedKeyVal: {},
            moneyChangesKeyVal: {},
            toggleHideCheckedTrList: true,
        }
        let prevState = {
            ...state,
        }

        const addListener = (listener = (s = state) => {}, watchDependenciesFn = [(s = state) => s.checkedKeyVal]) => {
            listeners.push(listener);
        }

        const updateAllListeners = () => {
            if (JSON.stringify(state) === JSON.stringify(prevState)) return;
            listeners.forEach(l => l(state))
        }

        const getState = () => {
            return state;
        }

        const setState = (newS = state) => {
            const _newS = typeof newS === 'function' ? newS(state) : newS;
            state = {
                ...state,
                ..._newS
            }
            updateAllListeners();
            prevState = JSON.parse(JSON.stringify(state)); // deep clone
            return state;
        }

        const dispatch = (action, payload) => {
            switch (action) {
                case actions.UPDATE_CHANGE_VAL_BY_KEY: {
                    const {
                        key,
                        val,
                    } = payload;
                    setState((s) => ({
                        ...s,
                        moneyChangesKeyVal: {
                            ...s.moneyChangesKeyVal,
                            [key]: val,
                        }
                    }))
                    break;
                }

                case actions.RESET_CHANGE_VAL_BY_KEY: {
                    const {
                        key,
                    } = payload;
                    setState((s) => ({
                        ...s,
                        moneyChangesKeyVal: {
                            ...s.moneyChangesKeyVal,
                            [key]: '',
                        }
                    }))
                    break;
                }

                case actions.UPDATE_CHECKED_BY_KEY: {
                    const {
                        key,
                        checked,
                    } = payload;
                    setState((s) => ({
                        ...s,
                        checkedKeyVal: {
                            ...s.checkedKeyVal,
                            [key]: checked,
                        }
                    }))
                    break;
                }

                case actions.UPDATE_HIDE_CHECKED: {
                    const {
                        checked,
                    } = payload
                    setState({
                        toggleHideCheckedTrList: checked,
                    })
                    break;
                }

                default:
                    break;
            }
        }

        const initByLSState = (checkedLSState, changeLSState) => {
            // console.log(checkedLSState)
            setState({
                checkedKeyVal: checkedLSState,
                moneyChangesKeyVal: changeLSState
            });
        }

        return ({
            getState,
            addListener,
            dispatch,
            initByLSState,
        })
    })()

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
            const checkedFromLSState = LSState[trKey];

            // console.log(trKey);
            checkboxEl.setAttribute('type', 'checkbox');
            setCheckboxChecked(checkboxEl, checkedFromLSState);

            checkboxEl.addEventListener('change', e => {
                const {
                    checked,
                } = e.target;
                CtxState.dispatch(actions.UPDATE_CHECKED_BY_KEY, {
                    key: trKey,
                    checked,
                })
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
            // console.log(elInnerTxt, valTxt)
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

    const prependListToggleInput = () => {
        const label = document.createElement('label');
        label.id = 'toggleHiddenCheckedLabel'
        const txt = document.createElement('span');
        txt.innerText = '隱藏已勾選的清單'

        const toggleCheckboxEl = document.createElement('input');
        toggleCheckboxEl.type = 'checkbox';
        toggleCheckboxEl.checked = CtxState.getState().toggleHideCheckedTrList;
        toggleCheckboxEl.addEventListener('change', (e) => {
            CtxState.dispatch(actions.UPDATE_HIDE_CHECKED, {
                checked: e.target.checked,
            })
        })

        label.appendChild(toggleCheckboxEl);
        label.appendChild(txt);

        document.body.prepend(label)
    }

    const appendSingleMoneyChangeInput = (trEl) => {
        const inputEl = document.createElement('input');
        const trKey = getTrKey(trEl);

        inputEl.type = 'number';
        inputEl.placeholder = '需找多少錢，找完直接清空即可';
        inputEl.addEventListener('input', (e) => {
            const val = e.target.value;
            // console.log(val);
            CtxState.dispatch(actions.UPDATE_CHANGE_VAL_BY_KEY, {
                key: trKey,
                val,
            })
        })

        const clearBtn = document.createElement('button');
        clearBtn.innerText = '已找錢（清空）'
        clearBtn.addEventListener('click', () => {
            CtxState.dispatch(actions.RESET_CHANGE_VAL_BY_KEY, {
                key: trKey,
            })
        })
        const cell = document.createElement('td');

        cell.appendChild(inputEl);
        cell.appendChild(clearBtn);
        trEl.appendChild(cell);

        CtxState.addListener((s) => {
            const {
                moneyChangesKeyVal
            } = s
            const val = moneyChangesKeyVal[trKey];

            inputEl.value = val || '';
        })
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

    const updateSingleTrEl = (trEl) => {
        const trKey = getTrKey(trEl);

        CtxState.addListener((s) => {
            const {
                moneyChangesKeyVal,
                checkedKeyVal,
            } = s;
            const checked = checkedKeyVal[trKey];
            const moneyChangeVal = moneyChangesKeyVal[trKey];
            // console.log(trKey, moneyChangeVal)

            const styleObj = {
                opacity: (checked && !moneyChangeVal) ? 0.2 : 1,
                background: moneyChangeVal ? '#bbb' : null,
            }
            libs.updateElStyleByStyleObj(trEl, styleObj);
        })

        CtxState.addListener((s) => {
            const {
                moneyChangesKeyVal,
                checkedKeyVal,
            } = s;
            const checked = checkedKeyVal[trKey];
            // console.log(checked)
            const moneyChangeVal = moneyChangesKeyVal[trKey];

            DinBenDanState.setState(trKey, checked);
            MoneyChangeLSState.setState(trKey, moneyChangeVal);
        })

        CtxState.addListener((s) => {
            const {
                toggleHideCheckedTrList,
                checkedKeyVal,
                moneyChangesKeyVal
            } = s;
            const checked = checkedKeyVal[trKey];
            const moneyChangeVal = moneyChangesKeyVal[trKey];

            const shouldHidden = checked && toggleHideCheckedTrList && !moneyChangeVal
            const styleObj = {
                visibility: shouldHidden ? 'collapse' : null
            }
            libs.updateElStyleByStyleObj(trEl, styleObj)
        })
    }
    const initTrElList = () => {
        const {
            trElList
        } = getEls();
        trElList.filter(checkTrIsOurGroup).forEach(el => updateSingleTrEl(el))
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
            initTrElList()

            prependCheckbox();
            appendMoneyChangeInputListToTrList();
            prependListToggleInput();
            prependSearchInput();
            CtxState.initByLSState(
                DinBenDanState.getState(),
                MoneyChangeLSState.getState()
            )
        }, 300);
    }

    main();
}

function updateInitCheckConditionRegEx(input) {
    regex.TR_INNER_TEXT_FOR_FILTER = new RegExp(input, 'g');
}

const MESSAGE = {
    INIT: 'INIT',
    RELOAD_PAGE: 'RELOAD_PAGE',
    UPDATE_CHECK_CONDITION: 'UPDATE_CHECK_CONDITION',
}

chrome.runtime.onMessage.addListener((mes, sender, sendRes) => {
    switch (mes.action) {
        case MESSAGE.INIT:
            if (document.getElementById('totalPrice')) return;
            loadPlugin();
            break;
        case MESSAGE.RELOAD_PAGE:
            window.location.reload();
        case MESSAGE.UPDATE_CHECK_CONDITION:
            updateInitCheckConditionRegEx(mes.payload.value);
        default:
            break;
    }
})