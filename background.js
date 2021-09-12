// This file runs in the background of the chrome extension
chrome.tabs.onUpdated.addListener(
    function(tabId, changeInfo, tab){
        console.log('onUpdated', changeInfo, changeInfo.url)
        console.log(tab.url)
        if(changeInfo.url || (tab.url && changeInfo.title)){
            console.log('about to send message')
            setTimeout(() => {
                chrome.tabs.sendMessage( tabId, {
                    message: 'url_changed',
                    url: changeInfo.url || tab.url
                }, response => console.log('response', response))
            }, 500)
        }
    }
)

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if(message === 'openGssTab'){
        chrome.tabs.create({
            url: 'https://knowyourhorses.com/speed-statistics',
        }, scrapeGSS)
        sendResponse('success');
    }
    else if(message === 'closeCurrentTab'){
        getCurrentTab().then( currentTab => {
            const currentTabId = currentTab.id;
            chrome.tabs.remove(currentTabId);
            sendResponse('success');
        })
    }
})

const scrapeGSS = async (tab) => {
    if (!tab.url) await onTabUrlUpdated(tab.id);
    console.log('go!');
    const results = await chrome.scripting.executeScript(
        {
            target: {
                tabId: tab.id
            },
            files: ['scrapeGlobalSpeedStats.js']
        }
    );
    console.warn('results', results);
}

function onTabUrlUpdated(tabId) {
    return new Promise((resolve, reject) => {
      const onUpdated = (id, info) => id === tabId && info.url && done(true);
      const onRemoved = id => id === tabId && done(false);
      chrome.tabs.onUpdated.addListener(onUpdated);
      chrome.tabs.onRemoved.addListener(onRemoved);
      function done(ok) {
        chrome.tabs.onUpdated.removeListener(onUpdated);
        chrome.tabs.onRemoved.removeListener(onRemoved);
        (ok ? resolve : reject)();
      }
    });
}

async function getCurrentTab() {
    console.log(chrome.tabs);
    let queryOptions = { active: true, currentWindow: true };
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab;
}