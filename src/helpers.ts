import { ChatUserstate } from "tmi.js";

export const maybePlaySound = (sound: string) => {
  if (sound !== "") {
    new Audio(sound).play();
  }
};

export const isMod = (context: ChatUserstate) => {
  return context.mod;
};

export const isBroadcaster = (context: ChatUserstate) => {
  return (
    context["badges-raw"] != null &&
    context["badges-raw"].startsWith("broadcaster")
  );
};

export const maybeGetFromStorage = (key: string, defaultValue: any) => {
  const item = localStorage.getItem(key);
  return item ? JSON.parse(item) : defaultValue;
}

