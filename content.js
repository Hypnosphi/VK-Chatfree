var inj = document.createElement('script');
inj.src = chrome.extension.getURL('inject.js');
document.body.appendChild(inj);