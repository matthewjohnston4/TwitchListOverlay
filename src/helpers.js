const maybePlaySound = (sound) => {
  if (sound !== "") {
    new Audio(sound).play();
  }
};

const isMod = (context) => {
  return context.mod;
};

const isBroadcaster = (context) => {
  return (
    context["badges-raw"] != null &&
    context["badges-raw"].startsWith("broadcaster")
  );
};

const maybeGetFromStorage = (key, defaultValue) => {
  return localStorage.getItem(key) ? JSON.parse(localStorage.getItem(key)) : defaultValue;
}

