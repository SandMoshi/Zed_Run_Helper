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

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        console.log('message recevied 1')
        if(request.message === 'url_changed'){;
            const url = request.url;
            if(url.indexOf('https://zed.run/racehorse/') > -1){
                showFatigue();
            }
        }
    }
)