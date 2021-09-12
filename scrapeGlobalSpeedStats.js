const scrapeGeneralSpeedStats = async () => {
    console.log('scrapeGeneralSpeedStats()');
    const rows = document.getElementsByTagName('tr');
    const headers = rows[0];
    const DistanceColIndex = headers.innerText.split('\t').indexOf('Distance');
    const top25ColIndex = headers.innerText.split('\t').indexOf('25%');
    const medianColIndex = headers.innerText.split('\t').indexOf('Median');
    const top75ColIndex = headers.innerText.split('\t').indexOf('75%');
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

    // Close the tab
    chrome.runtime.sendMessage('closeCurrentTab', async function(response){
        console.log(response)
    });
    chrome.runtime.sendMessage('gssUpdated', async function(response){
        console.log(response)
    });
}

scrapeGeneralSpeedStats();