vkRegex = /^https?:\/\/.*vk\.com/

# serialize a simple one-level JSON object
serialize = (object) ->
  pairs = for key, value of object
    "#{encodeURIComponent key}=#{encodeURIComponent value}"
  pairs.join '&'
parse = (url) ->
  params = {}
  parsArray = url.split('#')[1].split('&')
  for pair in parsArray
    keyValue = pair.split('=')
    params[keyValue[0]] = [keyValue[1]]
  params

callbacks = []
authorize = do ->
  inProgress = no
  params =
    client_id: 4324791
    scope: 'messages,offline'
    redirect_uri: 'https://oauth.vk.com/blank.html'
    display: 'popup'
    v: 5.24,
    response_type: 'token'
  screenWidth = window.screen.width
  screenHeight = window.screen.height
  popup =
    url: "https://oauth.vk.com/authorize?#{serialize params}"
    type: 'popup'
    left: screenWidth / 4
    top: screenHeight / 4
    width: screenWidth / 2
    height: screenHeight / 2
  ->
    return if inProgress
    inProgress = yes
    chrome.windows.create popup, (window) ->
      authTabId = window.tabs[0].id
      chrome.tabs.onUpdated.addListener (tabId, changeInfo, tab) ->
        if tabId is authTabId and changeInfo.url
          response = parse changeInfo.url
          if response.access_token
            for callback in callbacks
              callback
                token: response.access_token
                id: response.user_id
            callbacks = []
          chrome.tabs.remove authTabId
      chrome.tabs.onRemoved.addListener (tabId, changeInfo, tab) ->
        inProgress = no if tabId is authTabId
           

chrome.runtime.onMessageExternal.addListener (request, sender, sendResponse) ->
  if vkRegex.test(sender.url) and request is 'auth'
    callbacks.push sendResponse
    authorize()

    # return true for async response
    true

    