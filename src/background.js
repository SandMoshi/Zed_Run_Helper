// This file runs in the background of the chrome extension
chrome.tabs.onUpdated.addListener(
  (tabId, changeInfo, tab) => {
    if (changeInfo.status == 'complete' && tab.active) {
      console.log('about to send message');
      setTimeout(() => {
        chrome.tabs.sendMessage(tabId, {
          message: 'url_changed',
          url: changeInfo.url || tab.url,
        }, (response) => console.log('response', response));
      }, 500);
    }
  },
);

async function getCurrentTab() {
  const queryOptions = { active: true, currentWindow: true };
  const [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message === 'closeCurrentTab') {
    getCurrentTab().then((currentTab) => {
      const currentTabId = currentTab.id;
      chrome.tabs.remove(currentTabId);
      sendResponse('success');
    });
  }
});
