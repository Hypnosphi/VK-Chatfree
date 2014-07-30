
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
      console.log "res#{idx}", _.now() 
      callback.apply this, arguments

      # remove the jsonp injection as we no longer need one
      window.document.body.removeChild scriptElement
      delete callbackList[idx]

    params.callback = "getCfCallback(#{idx})"

    # make an injection
    scriptElement = window.document.createElement 'script'
    scriptElement.src = "#{url}?#{serialize params}"
    console.log "req#{idx}", _.now()
    window.document.body.appendChild scriptElement
    return

# vk API request
vkApi = do ->
  token = localStorage.token
  v = 5.23
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

# call stored checkCounter function, then filter the chats
checkCounter = (callback = ->) ->
  vkApi 'execute.checkCounter', {}, (response) ->
    chatList = _.union (_.compact arr for arr in response.unread)
    callback response.count - chatList.length

# limit request rate
throttledCheck = _.throttle(checkCounter, 340)

# wrap the global handlePageCount function into count checker
window.handlePageCount = _.wrap handlePageCount, (func, args...) ->
  if args[0] is 'msg'
    throttledCheck (count) ->
        func 'msg', count
  else 
    # default behaviour
    func.apply this, args

# initialize
handlePageCount 'msg', 0
