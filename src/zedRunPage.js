// Meant to run on Zed.Run Pages

const addFatigueValueToDom = (rectElements) => {
  const element = rectElements[0];
  const fillAttribue = element.getAttribute('fill');
  const fatigueValue = fillAttribue.length === 20 ? fillAttribue.substring(16, 19) : fillAttribue.substring(16, 18);
  const fatigueText = document.createElement('h1');
  fatigueText.innerText = fatigueValue;
  fatigueText.style.color = 'white';
  const fatigueContainer = document.getElementsByClassName('fatigue-meter-lg')[0];
  fatigueContainer.appendChild(fatigueText);
};

const showFatigue = () => {
  const intervalID = setInterval(() => {
    const rectElements = document.getElementsByTagName('rect');
    if (rectElements.length > 0) {
      clearInterval(intervalID);
      addFatigueValueToDom(rectElements);
    }
  }, 500);
};

const updateWalletBlur = (blurEnabled) => {
  const root = document.querySelector(':root');
  console.log('blurEnabled', blurEnabled);
  localStorage.setItem('hideWalletBalanceOnHover', JSON.stringify(blurEnabled));
  if (blurEnabled) {
    root.style.setProperty('--walletBlur', '3px');
  } else {
    root.style.setProperty('--walletBlur', '0px');
  }
};

const updateHighlightRaces = (args) => {
  if (args.byDistance) {
    localStorage.setItem('highlightedRacesByDistance', JSON.stringify(args.byDistance));
    highlightRaces({ byDistance: args.byDistance });
  }
};

const highlightRaces = (args) => {
  if (args.byDistance) {
    const raceRows = document.getElementsByClassName('panel');
    for (const race of raceRows) {
      const raceDistance = race.getElementsByClassName('distance')[0].innerText;
      // Check if this distance is to be highlighted
      if (args.byDistance[raceDistance]) {
        race.classList.add('highlightRaceRow');
      } else {
        race.classList.remove('highlightRaceRow');
      }
    }
  }
};

const loadPreviousWalletBlurSetting = () => {
  const hideWalletBalance = JSON.parse(localStorage.getItem('hideWalletBalanceOnHover')) || false;
  updateWalletBlur(hideWalletBalance);
};

const loadPreviousSettings = () => {
  loadPreviousWalletBlurSetting();
};

const loadHightlightRaceByDistanceSettingsandRace = () => {
  console.log('loadHightlightRaceByDistanceSettingsandRace()');
  const highlightRaceByDistanceSavedData = JSON.parse(localStorage.getItem('highlightedRacesByDistance')) || false;
  highlightRaces({ byDistance: highlightRaceByDistanceSavedData });
};

chrome.runtime.onMessage.addListener(
  (request, sender, sendResponse) => {
    console.log('message recevied', request.message);
    if (request.message === 'url_changed') {
      onContentScriptLoad();
    }
    if (request.message === 'walletBlur_changed') {
      updateWalletBlur(request.blurEnabled || false);
    }
    if (request.message === 'highlightRacesByDistance_changed') {
      updateHighlightRaces({ byDistance: request.data });
    }
  },
);

function onContentScriptLoad() {
  // Runs on Zed Run page load, and enables features depending on page
  loadPreviousWalletBlurSetting();
  loadPreviousSettings();
  if (location.href.indexOf('https://zed.run/racehorse/') > -1) {
    showFatigue();
  }
  if (location.href.indexOf('https://zed.run/racing/events') > -1) {
    loadHightlightRaceByDistanceSettingsandRace();
    // Listen to changes in DOM
    const targetNode = document.getElementsByClassName('accordion')[0];
    const raceMutationObserver = ((mutationList, observerInstance) => {
      // Try to get the rows
      for (const mutation of mutationList) {
        if (mutation.type === 'childList' || mutation.type === 'subtree') {
          loadHightlightRaceByDistanceSettingsandRace();
        }
      }
    });
    const observer = new MutationObserver(raceMutationObserver);
    targetNode && observer.observe(targetNode, { childList: true, attributes: false, subtree: true });
  }
}

// Run these functions immediately
onContentScriptLoad();
