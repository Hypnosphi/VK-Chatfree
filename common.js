var settings = localStorage.settings ? JSON.parse(localStorage.settings) : {
  hideChats: true,
  whiteList: [],
  blackList: []
};
var params = {
  unread: 1,
  v: 5.21,
  access_token: localStorage.token
};
if (!params.access_token) {
  getToken();
}
var authInProcess = false;

function getToken(callback, args) {
  if (authInProcess) {
    return;
  }
  authInProcess = true;
  var pars = {
    client_id: 4324791,
    scope: 'messages,offline',
    redirect_uri: 'https://oauth.vk.com/blank.html',
    display: 'page',
    v: 5.21,
    response_type: 'token'
  };
  var url = 'https://oauth.vk.com/authorize?';
  var parsArr = [];
  for (var key in pars) {
    parsArr.push(key + '=' + pars[key]);
  }
  url += parsArr.join('&');
  chrome.tabs.query ({active: true, lastFocusedWindow: true},
    function(lastTab) {
      chrome.tabs.create({url: url, index: lastTab[0].index},
        function(authTab){
          chrome.tabs.onUpdated.addListener(
            function(tabId, changeInfo, tab) {
              if (tabId == authTab.id && changeInfo.url) {
                var regex = new RegExp(pars.redirect_uri + '#access_token=([0-9a-f]*)');
                params.access_token = changeInfo.url.match(regex)[1];
                chrome.tabs.remove(tabId);
                localStorage.token = params.access_token;
                if (callback) {
                  callback.apply(this, args);
                }
                authInProcess = false;
              }
            });
        });
    });
}

function vkapi(method, params, callback, errorHandler) {
  var args = arguments;
  var that = this;
  var url = 'https://api.vk.com/method/' + method + '?';
  var pars = [];
  for (var key in params) {
    pars.push(key + '=' + params[key]);
  }
  url += pars.join('&');
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.responseType = 'json';
  xhr.onload = function(e) {
  	if (xhr.response.error) {
  	  console.log(xhr.response.error);
  	  if (xhr.response.error.error_code == 5) {
        getToken(vkapi, args);
  	  } else if (xhr.response.error.error_code == 6) {
        var timeoutID = window.setTimeout(function() {
          vkapi.apply(that,args);
        }, 1000);
      }
  	  if (errorHandler) {
  	    errorHandler(xhr.response.error);
  	  }
      return;
  	}
  	if (callback) {
      callback(xhr.response.response);
    }
  }
  xhr.send();
}

function isOn(chat_id, list) {
  return settings[list].indexOf(chat_id) >= 0;
}
