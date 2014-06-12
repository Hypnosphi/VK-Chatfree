function sendUpdateSettings() {}
function sendUpdateCounter() {}
chrome.runtime.onMessageExternal.addListener(
  function(request, sender, sendResponse) {
    if (request.message == 'updateCounter') {
      sendUpdateCounter = sendResponse;
      var v = request.v
      params.count = Math.min(v + 5, 200);
      vkapi('messages.getDialogs', params, recalc);
    } else if (request.message == 'waitForSettings') {
      sendUpdateSettings = sendResponse;
    }
    return true;
  });

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.message == 'updateSettings') {
      settings = request.settings;
      sendUpdateSettings();
    }
  });

function recalc(data) {
  var unread = data.count;
  if (unread > params.count && unread <= 200) {
    params.count = Math.min(unread + 5, 200);
    vkapi('messages.getDialogs', params, recalc);
    return;
  }
  for (var i = 0, l = data.items.length; i < l; i++) {
    var chat_id = data.items[i].message.chat_id;
    if (chat_id && settings.hideChats ? !isOn(chat_id, 'whiteList') : isOn(chat_id, 'blackList')) {
      unread--;
    }
  }
  sendUpdateCounter(unread);
};

chrome.runtime.onInstalled.addListener(
  function(details) {
    chrome.tabs.create({url: 'settings.html'});
  });