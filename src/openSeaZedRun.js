// This script runs on the open seas pages, specifically on the zed run horse page

// global
let isDarkMode = false;

const addThirdPartyButtons = (horseTokenId) => {
    if(!horseTokenId){ return }

    const sitesToSupport = [
      "kyh",
      "hawku"
    ]

    function createButton(site){
      // site can be 'kyh' or 'hawku'
      let hyperlink = '';
      let textVariable = null;
      switch(site){
        case('kyh'): {
          hyperlink = `https://knowyourhorses.com/horses/${horseTokenId}`;
          textVariable = 'openInKYH';
          break;
        }
        case('hawku'): {
          hyperlink = `https://www.hawku.com/horse/${horseTokenId}`
          textVariable = 'openInHawku';
        }
      }
      const AnchorTag = document.createElement('a');
      AnchorTag.classList.add('szrh_openInKyh');
      if(isDarkMode){
          AnchorTag.classList.add('szrh_openInKyh_dark');
      }
      AnchorTag.setAttribute('href', hyperlink);
      AnchorTag.setAttribute('target', '_blank');
      AnchorTag.innerText = chrome.i18n.getMessage(textVariable);
      // Add Horse Icon
      const horseIcon = document.createElement('img');
      horseIcon.src= chrome.runtime.getURL('icons/icon_32x32.png');
      AnchorTag.appendChild(horseIcon);
      return AnchorTag;
    }

    let buttonGroup = document.getElementsByClassName('item--collection-toolbar-wrapper')[0];
    sitesToSupport.forEach(site => {
      const anchorElement = createButton(site);
      if(!buttonGroup){
        let counter = 0;
        let maxCount = 10;
        let intervalID = setInterval( () => {
          buttonGroup = document.getElementsByClassName('item--collection-toolbar-wrapper')[0];
          console.log(buttonGroup);
          if(buttonGroup){
            clearInterval(intervalID);
            addThirdPartyButtons(horseTokenId);
          }
          counter >= maxCount && clearInterval(intervalID);
          counter++;
        },1000);
      }
      buttonGroup.parentElement.insertBefore(anchorElement, buttonGroup);
    });
}

function isColorDark(color) {

    // Check the format of the color, HEX or RGB?
    if (color.match(/^rgb/)) {
  
      // If HEX --> store the red, green, blue values in separate variables
      color = color.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/);
  
      r = color[1];
      g = color[2];
      b = color[3];
    } 
    else {
  
      // If RGB --> Convert it to HEX: http://gist.github.com/983661
      color = +("0x" + color.slice(1).replace( 
        color.length < 5 && /./g, '$&$&'
      )
               );
  
      r = color >> 16;
      g = color >> 8 & 255;
      b = color & 255;
    }
  
    // HSP (Highly Sensitive Poo) equation from http://alienryderflex.com/hsp.html
    hsp = Math.sqrt(
      0.299 * (r * r) +
      0.587 * (g * g) +
      0.114 * (b * b)
    );
  
    // Using the HSP value, determine whether the color is light or dark
    if (hsp>127.5) {
  
      return false;
    } 
    else {
  
      return true;
    }
  }

const detectIfDarkMode = () => {
    const backgroundColor = window.getComputedStyle(document.getElementsByTagName('html')[0]).backgroundColor;
   return isColorDark(backgroundColor)
}

const listenForUrlChange = () => {
  let lastUrl = location.href;
  const urlChangeObserver = () => {
    const url = location.href;
    if (url !== lastUrl) {
      lastUrl = url;
      console.log('new url')
      showThirdPartyButtons()
    }
  }
  const observer = new MutationObserver(urlChangeObserver);
  observer.observe(document, { childList:true, attributes: false, subtree: true })
}

const showThirdPartyButtons = () => {
  if(location.href.indexOf('https://opensea.io/assets/matic/0xa5f1ea7df861952863df2e8d1312f7305dabf215/') > -1){
    const firstParthOfUrl = 'https://opensea.io/assets/matic/0xa5f1ea7df861952863df2e8d1312f7305dabf215/';
    const lastPartOfUrl = location.href.substring(firstParthOfUrl.length - 1,  location.href.length);
    const horseTokenId = lastPartOfUrl.split('/')[1];
    console.log('go');
    addThirdPartyButtons(horseTokenId);
  }
}

function onContentScriptLoad(){
    isDarkMode = detectIfDarkMode();
    console.log('isDark', isDarkMode);
    showThirdPartyButtons();
    listenForUrlChange();
}

onContentScriptLoad();