// Meant to run on https://knowyourhorses.com

// https://knowyourhorses.com/horses/92815
const ENUM_FINISH_TIME_MESSAGE = {
    top25: "Top 25%",
    secondQuartile: "Average",
    thirdQuartile: "Below Average",
    bottomQuartile: "Bottom 25%",
}

const ENUM_GSS_LABELS = {
    top25: '25%',
    median: 'Median',
    top75: '75%'
}

let gss = null;
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if(request.message === 'url_changed'){
            const url = request.url;
            if(url.indexOf('https://knowyourhorses.com/horses/' > -1) && url.indexOf('/speed_analysis') > -1){
                document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', function(event) {
                    addLegendToSpeedAnalysis();
                }) : addLegendToSpeedAnalysis();
            }
            else if(url.indexOf('https://knowyourhorses.com/horses/') > -1){
                loadGeneralSpeedStats();
                enableFinishTimeTooltip();
            }
        }
        else if(request.message === 'gssUpdated'){
            loadGssFromLocalStorage();
        }
        sendResponse('thanks')
    }
)

const enableFinishTimeTooltip = () => {
    const table = document.getElementsByTagName('tbody')[0];
    if(table){
        const eventCells = document.getElementsByClassName('event');
        for(let currentNode of eventCells){
            const raceDistance = currentNode.textContent.substring(currentNode.textContent.indexOf('m)')-4, (currentNode.textContent.indexOf('m)')+1));
            const finishTimeCell = currentNode.parentElement.nextElementSibling
            const finishTime = Number(currentNode.parentElement.nextElementSibling.innerText)
            const gssTime = gss[raceDistance];
            const overlay = document.createElement('div');
            overlay.classList.add('finishTimePopup');
            if(finishTime && finishTime <= gssTime[ENUM_GSS_LABELS.top25] && finishTime > 0){
                overlay.innerText = ENUM_FINISH_TIME_MESSAGE.top25;
                overlay.classList.add('greenText');
            }
            else if(gssTime[ENUM_GSS_LABELS.top25] < finishTime && finishTime <= gssTime[ENUM_GSS_LABELS.median] ){
                overlay.innerText = ENUM_FINISH_TIME_MESSAGE.secondQuartile;
            }
            else if(gssTime[ENUM_GSS_LABELS.median] < finishTime && finishTime <= gssTime[ENUM_GSS_LABELS.top75] ){
                overlay.innerText = ENUM_FINISH_TIME_MESSAGE.thirdQuartile;
            }
            else if(gssTime[ENUM_GSS_LABELS.top75] < finishTime){
                overlay.innerText = ENUM_FINISH_TIME_MESSAGE.bottomQuartile;
                overlay.classList.add('redText');
            }
            finishTimeCell.appendChild(overlay);
        }
    }
}

const loadGeneralSpeedStats = () => {
    const gssLast = JSON.parse(localStorage.getItem('gssLast'));
    const today = new Date();
    const staleTimestamp = today.setDate(today.getDate() - 4);
    // Check if data is recent
    if(!gssLast || gssLast < staleTimestamp){
        // Get new data
        console.log('Scrape new gss')
        requestScrapeGeneralSpeedStats();
    }else{
        // Use cached data
        console.log('Use cached data')
        loadGssFromLocalStorage();
    }
}

const requestScrapeGeneralSpeedStats = async () => {
    // open new tab, scrape data, close tab
    chrome.runtime.sendMessage('openGssTab', async function(response){
        console.log(response)
    });
}

const loadGssFromLocalStorage = () => {
    gss = JSON.parse(localStorage.getItem('gss'));
}

async function getCurrentTab() {
    let queryOptions = { active: true, currentWindow: true };
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab;
  }

const addLegendToSpeedAnalysis = async () => {
    // Check for existing elements
    if(document.getElementsByClassName('szrh-legend').length > 0){
        return;
    }
    const chartHeaderElements = document.getElementsByClassName('card-header');
    for( let cardHeader of chartHeaderElements){
        const legendElement = document.createElement('div');
        legendElement.classList.add('szrh-legend');
        legendElement.innerHTML = "<div></div>Your Horse<br/><div class='szrh-greenLine'></div>All Horses";
        cardHeader.parentElement.insertBefore(legendElement, cardHeader.nextSibling);
    }
}