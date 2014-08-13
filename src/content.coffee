# this tiny content script makes an injection to *://vk.com/*
# and loads Underscore.js library
addScript = (src, script, onload) ->
  scriptElement = document.createElement 'script'
  if src?
  	scriptElement.src = src
  else
  	scriptElement.innerText = script
  if onload?
	  scriptElement.addEventListener 'load', (e) ->
  		onload e
  		document.body.removeChild scriptElement
  document.body.appendChild scriptElement
addScript '//cdnjs.cloudflare.com/ajax/libs/underscore.js/1.6.0/\
	underscore-min.js', null, ->
  
  # get full path to inject.js
	addScript chrome.extension.getURL('js/inject.js'), null, ->

		# send extId for enabling authentification
		addScript null, "chatfree.auth('#{chrome.runtime.id}')"
