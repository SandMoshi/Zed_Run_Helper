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
}

window.onload = function() {
    loadPreviousSettings();
};

async function getCurrentTab() {
    let queryOptions = { active: true, currentWindow: true };
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab;
}