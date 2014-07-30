# this tiny content script makes an injection to *://vk.com/*
# and loads Underscore.js library

addScript = (src, onload) ->
  scriptElement = window.document.createElement 'script'
  scriptElement.src = src
  scriptElement.onload = onload
  window.document.body.appendChild scriptElement
  return
addScript '//cdnjs.cloudflare.com/ajax/libs/underscore.js/1.6.0/\
	underscore-min.js', ->
  
  # get full path to inject.js
	addScript window.chrome.extension.getURL 'js/inject.js'
