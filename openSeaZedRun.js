console.log('openSea page');

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if(request.message === 'url_changed'){
            const url = request.url;
            if(url.indexOf('https://opensea.io/assets/matic/0xa5f1ea7df861952863df2e8d1312f7305dabf215/') > -1){
                const firstParthOfUrl = 'https://opensea.io/assets/matic/0xa5f1ea7df861952863df2e8d1312f7305dabf215/';
                const lastPartOfUrl = url.substring(firstParthOfUrl.length - 1, url.length);
                const horseTokenId = lastPartOfUrl.split('/')[1];
                addKYHButton(horseTokenId);
            }
        }
        sendResponse('thanks')
    }
)

const addKYHButton = (horseTokenId) => {
    if(!horseTokenId){ return }
    const kyhAnchorTag = document.createElement('a');
    kyhAnchorTag.classList.add('szrh_openInKyh');
    kyhAnchorTag.setAttribute('href', `https://knowyourhorses.com/horses/${horseTokenId}`);
    kyhAnchorTag.setAttribute('target', '_blank');
    kyhAnchorTag.innerText = chrome.i18n.getMessage("openInKYH");
    const buttonGroup = document.getElementsByClassName('item--collection-toolbar-wrapper')[0];
    // buttonGroup.appendChild(kyhAnchorTag);
    buttonGroup.parentElement.insertBefore(kyhAnchorTag, buttonGroup);

}