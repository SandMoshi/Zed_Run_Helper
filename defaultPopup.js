const handleHoverSettingToggle = (toggleContainer, target) => {
    const toggleInput = toggleContainer.children[0].firstElementChild;
    if(event.target.tagName === 'P'){
        toggleInput.checked = !toggleInput.checked
    }
    const checked = toggleInput.checked || false;
    console.log('Hover Hidden is checked:', checked);
    localStorage.setItem('hideWalletBalanceOnHover', JSON.stringify(checked));
    // send message to zed.run tab (if active tab) to update blur
    sendWalletBlurMessageToZedRun(checked);
} 

const sendWalletBlurMessageToZedRun = (blurEnabled) => {
    getCurrentTab().then( currentTab => {
        if(currentTab.url.indexOf('https://zed.run') > -1){
            const currentTabId = currentTab.id;
            chrome.tabs.sendMessage( currentTabId, {
                message: 'walletBlur_changed',
                blurEnabled: blurEnabled
            })
        }
    })
}

const sendHighlightRaceMessageToZedRunCS = (args) => {
    // highlightRacesByDistance_changed
    getCurrentTab().then( currentTab => {
        if(currentTab.url.indexOf('https://zed.run') > -1){
            const currentTabId = currentTab.id;
            const message = args.byDistance ? 'highlightRacesByDistance_changed' : args.byCost ? 'highlightRacesByCost_changed' : '';
            const data = args.byDistance || args.byCost || null;
            chrome.tabs.sendMessage( currentTabId, {
                message,
                data
            })
        }
    })
}

const hoverSettingToggleButton = document.getElementsByClassName('hoverSettingInput')[0];
const hoverSettingToggleContainer = document.getElementsByClassName('hoverSettingContainer')[0];

hoverSettingToggleContainer.addEventListener('click', (event) => {
    handleHoverSettingToggle(event.currentTarget, event.target);
});

function loadPreviousSettings(){
    console.log('load previous settings');
    const hideWalletBalance = JSON.parse(localStorage.getItem('hideWalletBalanceOnHover')) || false;
    hoverSettingToggleButton.checked = hideWalletBalance;
    sendWalletBlurMessageToZedRun(hideWalletBalance);
    const highlightRaceByDistanceSavedData = JSON.parse(localStorage.getItem('highlightedRacesByDistance')) || false;
    highlightRaceByDistance.updateUi(highlightRaceByDistanceSavedData);
    sendHighlightRaceMessageToZedRunCS({byDistance: highlightRaceByDistanceSavedData})
}

window.onload = function() {
    loadPreviousSettings();
};

async function getCurrentTab() {
    let queryOptions = { active: true, currentWindow: true };
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab;
}

class highlightRaceByDistanceClass {
    constructor(){
        this.distances = ['1000m', '1200m', '1400m','1600m','1800m','2000m','2200m','2400m']
        this.data = {
            '1000m': false,
            '1200m': false, 
            '1400m': false,
            '1600m': false,
            '1800m': false,
            '2000m': false,
            '2200m': false,
            '2400m': false,
        };
    }
    toggleButton = (element) => {
        const distance = element && element.innerText;
        let newValue = !this.data[distance];
        if(distance){ this.data[distance] = newValue};
        localStorage.setItem('highlightedRacesByDistance', JSON.stringify(this.data));
        this.updateSingleButton(element, newValue);
        sendHighlightRaceMessageToZedRunCS({byDistance: this.data})
    };
    updateSingleButton = (element, newValue) => {
        if(element){
            newValue ? element.classList.add('on'): element.classList.remove('on')
        }
    };
    updateUi = (highlightRaceByDistanceSavedData) => {
        if(!highlightRaceByDistanceSavedData){ return }
        this.data = highlightRaceByDistanceSavedData;
        this.distances.forEach( (distance, index) => {
            const container = document.getElementById('ditanceToggleBtnGroup');
            const element = container.getElementsByClassName('distanceToggleBtn')[index];
            if(element.innerText !== distance){
                console.log(distance, ' vs ', element);
                throw Error('did not select correct item')
            }
            // If enabled for this distance, change appearance of the button
            if(highlightRaceByDistanceSavedData[distance] == true){
                element.classList.add('on');
            }
        })
    };
}

// Initialize class
const highlightRaceByDistance = new highlightRaceByDistanceClass();

const highlightRacesByDistanceButtons = document.getElementsByClassName('distanceToggleBtn');
console.log('highlightRacesByDistanceButtons', highlightRacesByDistanceButtons);
for( let button of highlightRacesByDistanceButtons){
    console.log('button', button);
    button.addEventListener('click', () => {
        console.log('button clicked', button);
        highlightRaceByDistance.toggleButton(button);
    })
};