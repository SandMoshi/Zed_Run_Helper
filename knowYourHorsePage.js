// Meant to run on https://knowyourhorses.com

const ENUM_FINISH_TIME_MESSAGE = {
    top25: chrome.i18n.getMessage("top25"),
    secondQuartile: chrome.i18n.getMessage("secondQuartile"),
    thirdQuartile: chrome.i18n.getMessage("thirdQuartile"),
    bottomQuartile: chrome.i18n.getMessage("bottomQuartile"),
}

const ENUM_GSS_LABELS = {
    top25: '25%',
    median: 'Median',
    top75: '75%'
}

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        console.log('message received by content script: ', request.message);
        if(request.message === 'url_changed'){
            const url = request.url;
        }
        sendResponse('thanks')
    }
)

const enableFinishTimeTooltip = (gss) => {
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

const loadGeneralSpeedStats = async () => {
    const gssLast = JSON.parse(localStorage.getItem('gssLast'));
    const today = new Date();
    const staleTimestamp = today.setDate(today.getDate() - 4);
    // Check if data is recent
    if(!gssLast || gssLast < staleTimestamp){
        // Get new data
        console.log('Scrape new gss')
        const gss = await fetchGeneralSpeedStatPage();
        enableFinishTimeTooltip(gss);
    }else{
        // Use cached data
        console.log('Use cached data')
        loadGssFromLocalStorage();
    }
}

const loadGssFromLocalStorage = () => {
    const gss = JSON.parse(localStorage.getItem('gss'));
    enableFinishTimeTooltip(gss);
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
    legendElement.innerHTML = `<div></div>${chrome.i18n.getMessage("yourHorse")}<br/><div class='szrh-greenLine'></div>${chrome.i18n.getMessage("allHorses")}`;
        cardHeader.parentElement.insertBefore(legendElement, cardHeader.nextSibling);
    }
}

const fetchGeneralSpeedStatPage = async () => {
    const response = await fetch('https://knowyourhorses.com/speed-statistics')
    const data = await response.text()
    return scrapeGeneralSpeedStats(parseHTMLString(data))
}

const parseHTMLString = (htmlStringData) => {
    const htmlElement = document.createElement('html');
    htmlElement.innerHTML = htmlStringData;
    return htmlElement;
}

const scrapeGeneralSpeedStats = async (DOM) => {
    const rows = DOM.getElementsByTagName('tr');
    const headers = rows[0];
    let splitHeaders = headers.innerText.split('\n')
    splitHeaders.forEach((item, index) => splitHeaders[index] = item.trim()) 
    if(splitHeaders[0] === ''){
        splitHeaders.splice(0, 1);
    }
    const DistanceColIndex =splitHeaders.indexOf('Distance');
    const top25ColIndex = splitHeaders.indexOf('25%');
    const medianColIndex = splitHeaders.indexOf('Median');
    const top75ColIndex = splitHeaders.indexOf('75%');
    const stats = {}
    
    for (let index = 1; index < rows.length; index++){
        const headerRow = rows[0];
        const row = rows[index];
        const distance = row.children[0].innerText;
        const top25Time = row.children[top25ColIndex].innerText;
        const medianTime = row.children[medianColIndex].innerText;
        const top75Time = row.children[top75ColIndex].innerText;
        stats[distance] = {
            [headerRow.children[top25ColIndex].innerText] : top25Time,
            [headerRow.children[medianColIndex].innerText]: medianTime,
            [headerRow.children[top75ColIndex].innerText]: top75Time
        }
    }
    
    localStorage.setItem('gssLast', JSON.stringify(Date.now()));
    localStorage.setItem('gss', JSON.stringify(stats));
    return stats;
}

function onContentScriptLoad(){
    // Runs on KYH page load, and enables features depending on page
    if(location.href.indexOf('https://knowyourhorses.com/horses/') > -1){
        console.log('on horse page!');
        loadGeneralSpeedStats();
    }
    else{
        console.log(location.href.indexOf('https://knowyourhorses.com/horses/'))
    }
    if(location.href.indexOf('https://knowyourhorses.com/horses/' > -1) && location.href.indexOf('/speed_analysis') > -1){
        document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', function(event) {
            addLegendToSpeedAnalysis();
        }) : addLegendToSpeedAnalysis();
    }
}

// Run these functions immediately
onContentScriptLoad();