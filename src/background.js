// This file runs in the background of the chrome extension
chrome.tabs.onUpdated.addListener(
    function(tabId, changeInfo, tab){
        if(changeInfo.status == 'complete' && tab.active){
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
    if(message === 'closeCurrentTab'){
        getCurrentTab().then( currentTab => {
            const currentTabId = currentTab.id;
            chrome.tabs.remove(currentTabId);
            sendResponse('success');
        })
    }
})

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
    let queryOptions = { active: true, currentWindow: true };
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab;
}