// Generated by CoffeeScript 1.7.1
(function() {
  var checkCounter, jsonp, serialize, throttledCheck, vkApi,
    __slice = [].slice;

  serialize = function(object) {
    var key, pairs, value;
    pairs = (function() {
      var _results;
      _results = [];
      for (key in object) {
        value = object[key];
        _results.push("" + (encodeURIComponent(key)) + "=" + (encodeURIComponent(value)));
      }
      return _results;
    })();
    return pairs.join('&');
  };

  jsonp = (function() {
    var callbackList;
    callbackList = [];
    window.getCfCallback = function(idx) {
      return callbackList[idx];
    };
    return function(url, params, callback) {
      var idx, scriptElement;
      if (params == null) {
        params = {};
      }
      if (callback == null) {
        callback = function() {};
      }
      idx = 0;
      while (callbackList[idx] != null) {
        idx++;
      }
      callbackList[idx] = function() {
        console.log("res" + idx, _.now());
        callback.apply(this, arguments);
        window.document.body.removeChild(scriptElement);
        return delete callbackList[idx];
      };
      params.callback = "getCfCallback(" + idx + ")";
      scriptElement = window.document.createElement('script');
      scriptElement.src = "" + url + "?" + (serialize(params));
      console.log("req" + idx, _.now());
      window.document.body.appendChild(scriptElement);
    };
  })();

  vkApi = (function() {
    var apiUrl, token, v;
    token = localStorage.token;
    v = 5.23;
    apiUrl = 'https://api.vk.com/method/';
    return function(method, params, callback) {
      if (params == null) {
        params = {};
      }
      if (callback == null) {
        callback = function() {};
      }
      if (params.access_token == null) {
        params.access_token = token;
      }
      if (params.v == null) {
        params.v = v;
      }
      return jsonp(apiUrl + method, params, function(data) {
        var e, _ref;
        try {
          if (data == null) {
            throw new Error('no data');
          }
          if (data.response) {
            callback(data.response);
            if (method === 'execute' && data.execute_errors) {
              throw data.execute_errors;
            }
          } else {
            throw (_ref = data.error) != null ? _ref : new Error('wrong data format');
          }
        } catch (_error) {
          e = _error;
          return console.log(e);
        }
      });
    };
  })();

  checkCounter = function(callback) {
    if (callback == null) {
      callback = function() {};
    }
    return vkApi('execute.checkCounter', {}, function(response) {
      var arr, chatList;
      chatList = _.union((function() {
        var _i, _len, _ref, _results;
        _ref = response.unread;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          arr = _ref[_i];
          _results.push(_.compact(arr));
        }
        return _results;
      })());
      return callback(response.count - chatList.length);
    });
  };

  throttledCheck = _.throttle(checkCounter, 340);

  window.handlePageCount = _.wrap(handlePageCount, function() {
    var args, func;
    func = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    if (args[0] === 'msg') {
      return throttledCheck(function(count) {
        return func('msg', count);
      });
    } else {
      return func.apply(this, args);
    }
  });

  handlePageCount('msg', 0);

}).call(this);