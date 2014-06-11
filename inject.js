var extId = 'jlajncbmdnffgomoaljificiinnfnjkg';
//var extId = 'gejhhknkbnikfefkpjobiifbmfcmmndl';
__handlePageCount = handlePageCount;
handlePageCount = function(id, value, lnk, add) {
  if (id == 'msg') {
    chrome.runtime.sendMessage(extId, {message: 'updateCounter', v: value},
      function(response) {
        __handlePageCount('msg', response);
      });
  } else {
    __handlePageCount.apply(this, arguments);
  }
}

handlePageCount('msg', 0);
