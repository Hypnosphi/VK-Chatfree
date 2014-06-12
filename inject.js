//var cf_extId = 'jlajncbmdnffgomoaljificiinnfnjkg';
var cf_extId = 'gejhhknkbnikfefkpjobiifbmfcmmndl';
__handlePageCount = handlePageCount;
handlePageCount = function(id, value, lnk, add) {
  if (id == 'msg') {
    chrome.runtime.sendMessage(cf_extId, {message: 'updateCounter', v: value},
      function(response) {
        __handlePageCount('msg', response);
      });
  } else {
    __handlePageCount.apply(this, arguments);
  }
}

function waitForSettings() {
  chrome.runtime.sendMessage(cf_extId, {message: 'waitForSettings'},
    function() {
      handlePageCount('msg', 0);
      waitForSettings();
    });
}

window.addEventListener('load', function() {handlePageCount('msg', 0);}, false);
waitForSettings();