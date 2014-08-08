
# serialize a simple one-level JSON object
serialize = (object) ->
  pairs = for key, value of object
    "#{encodeURIComponent key}=#{encodeURIComponent value}"
  pairs.join '&'


# jsonp request implementation
jsonp = do ->
  callbackList = []

  # a global interface for callbacks
  window.getCfCallback = (idx) -> callbackList[idx]
  (url, params = {}, callback = ->) ->

    # assign callback to first empty index
    idx = 0
    idx++ while callbackList[idx]?
    callbackList[idx] = ->
      callback.apply this, arguments

      # remove the jsonp injection as we no longer need one
      window.document.body.removeChild scriptElement
      delete callbackList[idx]

    params.callback = "getCfCallback(#{idx})"

    # make an injection
    scriptElement = window.document.createElement 'script'
    scriptElement.src = "#{url}?#{serialize params}"
    window.document.body.appendChild scriptElement
    return

# vk API request
vkApi = do ->
  v = 5.24
  apiUrl = 'https://api.vk.com/method/'
  (method, params = {}, callback = ->) ->
    params.access_token ?= token
    params.v ?= v
    jsonp apiUrl + method, params, (data) ->
      try
        throw new Error 'no data' unless data?
        if data.response
          callback data.response
          if method is 'execute' and data.execute_errors
            throw data.execute_errors
        else
          throw (data.error ? new Error 'wrong data format')
      catch e
        console.log e

# check if chat is muted 
isMuted = (disabledUntil) ->
  disabledUntil and (disabledUntil is -1 or disabledUntil > _.now())

# call stored getDialogProperties function, then filter the muted chats
checkCounter = (callback = ->) ->
  vkApi 'execute.getDialogProperties', {unread: 1, muted: 1}, (response) ->
    muted = _.flatten(response.result).filter(isMuted)
    callback response.count - muted.length

# limit request rate
throttledCheck = _.throttle(checkCounter, 340)

init = ->
  
  # wrap the global handlePageCount function into count checker
  window.handlePageCount = _.wrap handlePageCount, (func, args...) ->
    if args[0] is 'msg'
      throttledCheck (count) ->
        func 'msg', count
    else 

      # default behaviour
      func.apply this, args
  handlePageCount 'msg', 0

init() if token = localStorage.getItem 'token'




