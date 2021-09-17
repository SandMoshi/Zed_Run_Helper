// Meant to run on Zed.Run Pages
const showFatigue = () => {
    const intervalID = setInterval(() => {
        const rectElements = document.getElementsByTagName('rect');
        if(rectElements.length > 0){
            clearInterval(intervalID);
            addFatigueValueToDom(rectElements);
        }
    }, 500)
}

const addFatigueValueToDom = (rectElements) => {
    const element = rectElements[0];
    const fillAttribue = element.getAttribute('fill');
    const fatigueValue = fillAttribue.length === 20 ? fillAttribue.substring(16,19) : fillAttribue.substring(16,18)
    const fatigueText = document.createElement('h1');
    fatigueText.innerText = fatigueValue;
    fatigueText.style.color = 'white';
    const fatigueContainer = document.getElementsByClassName('fatigue-meter-lg')[0];
    fatigueContainer.appendChild(fatigueText);
}

const updateWalletBlur = (blurEnabled) => {
    const root = document.querySelector(':root');
    console.log('blurEnabled', blurEnabled);
    localStorage.setItem('hideWalletBalanceOnHover', JSON.stringify(blurEnabled));
    if(blurEnabled){
        root.style.setProperty('--walletBlur', '3px');
    }
    else{
        root.style.setProperty('--walletBlur', '0px');
    }
}

// As soon as possible, retrieve the recent wallet blur settings and update css
(() => {
    const hideWalletBalance = JSON.parse(localStorage.getItem('hideWalletBalanceOnHover')) || false;
    updateWalletBlur(hideWalletBalance);
})();



chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        console.log('message recevied 1')
        if(request.message === 'url_changed'){;
            const url = request.url;
            if(url.indexOf('https://zed.run/racehorse/') > -1){
                showFatigue();
            }
        }
        if(request.message === 'walletBlur_changed'){
            updateWalletBlur(request.blurEnabled || false);
        }
    }
)