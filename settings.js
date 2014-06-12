params.unread = 0;
params.count = 200;
var isChat = [];
var chParams = {
  v: 5.21,
  access_token: localStorage.token
};
vkapi('messages.getDialogs', params,
  function(data) {
    for (var i = 0, l = data.items.length; i < l; i++) {
      var item = data.items[i].message;
      if (item.chat_id) {
        var chat = {
          id: item.chat_id,
          title: item.title
        };
        isChat[chat.id - 1] = true;
        append(chat, 'whiteList');
        append(chat, 'blackList');
      }
    }
    var chats = [];
    for (var i = isChat.length - 1; i >= 0; i--) {
      if (!isChat[i]) {
        chats.push(i + 1);
      }
    }
    oldChats(chats);
  });
if (!settings.hideChats) {
  ge('hide_false').checked = true;
}
ge('hide_true').onclick = function() {
  settings.hideChats = true;
  updateSettings();
}
ge('hide_false').onclick = function() {
  settings.hideChats = false;
  updateSettings();
}
ge('whiteList').onchange = function() {
  var selected = this.selectedOptions;
  settings.whiteList = [];
  for (var i = 0; i < selected.length; i++) {
    settings.whiteList.push(parseInt(selected[i].value));
  }
  updateSettings();
}
ge('whiteList').onclick = function() {
  if (!settings.hideChats) {
    ge('hide_true').checked = true;
    settings.hideChats = true;
    updateSettings();
  }
}
ge('blackList').onchange = function() {
  var selected = this.selectedOptions;
  settings.blackList = [];
  for (var i = 0; i < selected.length; i++) {
    settings.blackList.push(parseInt(selected[i].value));
  }
  updateSettings();
}
ge('blackList').onclick = function() {
  if (settings.hideChats) {
    ge('hide_false').checked = true;
    settings.hideChats = false;
    updateSettings();
  }
}

function ge(id) {
  return document.getElementById(id);
}

function append(chat, list) {
  var select = ge(list);
  var option = document.createElement('option');
  option.id = 'chat' + chat.id;
  option.value = chat.id;
  option.innerText = chat.title;
  //option.onmousedown = toggleSelection;
  if (isOn(chat.id, list)) {
    option.selected = true;
  }
  select.appendChild(option);
}

function oldChats(chats) {
  if (!chats.length) return;
  chParams.chat_ids = chats.join(',');
  vkapi('messages.getChat', chParams, 
    function(data) {
      for (var i = 0, l = data.length; i < l; i++) {
        var chat = {
          id: data[i].id,
          title: data[i].title
        }
        append(chat, 'whiteList');
        append(chat, 'blackList');
      }
    }, function(error) {
      if (error.error_code == 100) {
        var badChat = error.error_msg.slice(77);
        chats = chats.filter(function(e) {
          return e != badChat;
        });
        oldChats(chats);
      }
    });
}

function updateSettings() {
  localStorage.settings = JSON.stringify(settings);
  chrome.runtime.sendMessage({message: 'updateSettings', settings: settings});
}

/*function toggleSelection(e) {
  if (!e.shiftKey && !e.ctrlKey) {
    if (this.selected) {
      this.selected = false;
    } else {
      this.selected = true;
    }
    this.parentElement.focus();
    return false;
  }
}*/