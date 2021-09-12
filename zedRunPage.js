// Meant to run on Zed.Run Pages

const showFatigue = () => {
    console.log('show Fatigue');
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
    console.log(fillAttribue);
    const fatigueValue = fillAttribue.length === 20 ? fillAttribue.substring(16,19) : fillAttribue.substring(16,18)
    console.log(fatigueValue);
    const fatigueText = document.createElement('h1');
    fatigueText.innerText = fatigueValue;
    fatigueText.style.color = 'white';
    const fatigueContainer = document.getElementsByClassName('fatigue-meter-lg')[0];
    fatigueContainer.appendChild(fatigueText);
}

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        console.log('message recevied 1')
        if(request.message === 'url_changed'){
            console.log(request.url);
            const url = request.url;
            if(url.indexOf('https://zed.run/racehorse/') > -1){
                showFatigue();
            }
        }
    }
)

const hideBalances = () => {
    // Blue the eth balances
    const balanceElements = document.getElementsByClassName('primary-caption secondary d-block');
    console.log('hiding');
    for(let element of balanceElements){
        element.classList.add('blurredOffHover');
    }
}

hideBalances();

let observer = new MutationObserver(mutations => {
    for(let mutation of mutations) {
         for(let addedNode of mutation.addedNodes) {
             console.log('sand', addedNode.classList.includes('primary-caption secondary d-block'));
          }
     }
 });
 observer.observe(document, { childList: true, subtree: true });