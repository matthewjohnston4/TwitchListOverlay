var maybePlaySound = function maybePlaySound(sound) {
  if (sound !== "") {
    new Audio(sound).play();
  }
};

var isMod = function isMod(context) {
  return context.mod;
};

var isBroadcaster = function isBroadcaster(context) {
  return context["badges-raw"] != null && context["badges-raw"].startsWith("broadcaster");
};

var maybeGetFromStorage = function maybeGetFromStorage(key, defaultValue) {
  return localStorage.getItem(key) ? JSON.parse(localStorage.getItem(key)) : defaultValue;
};