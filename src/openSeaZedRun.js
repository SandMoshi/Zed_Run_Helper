console.log('openSea page');

// global
let isDarkMode = false;

const addKYHButton = (horseTokenId) => {
    if(!horseTokenId){ return }
    const kyhAnchorTag = document.createElement('a');
    kyhAnchorTag.classList.add('szrh_openInKyh');
    if(isDarkMode){
        kyhAnchorTag.classList.add('szrh_openInKyh_dark');
    }
    kyhAnchorTag.setAttribute('href', `https://knowyourhorses.com/horses/${horseTokenId}`);
    kyhAnchorTag.setAttribute('target', '_blank');
    kyhAnchorTag.innerText = chrome.i18n.getMessage("openInKYH");
    const buttonGroup = document.getElementsByClassName('item--collection-toolbar-wrapper')[0];
    // buttonGroup.appendChild(kyhAnchorTag);
    buttonGroup.parentElement.insertBefore(kyhAnchorTag, buttonGroup);
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

function onContentScriptLoad(){
    isDarkMode = detectIfDarkMode();
    console.log('loaded. isDark', isDarkMode)
    console.log()
    if(location.href.indexOf('https://opensea.io/assets/matic/0xa5f1ea7df861952863df2e8d1312f7305dabf215/') > -1){
        const firstParthOfUrl = 'https://opensea.io/assets/matic/0xa5f1ea7df861952863df2e8d1312f7305dabf215/';
        const lastPartOfUrl = location.href.substring(firstParthOfUrl.length - 1,  location.href.length);
        const horseTokenId = lastPartOfUrl.split('/')[1];
        console.log('go');
        addKYHButton(horseTokenId);
    }
}

onContentScriptLoad();