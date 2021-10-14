import { ChatUserstate } from "tmi.js";
import { Item } from "./app";

export const maybePlaySound = (sound: string) => {
  if (sound !== "") {
      new Audio(sound).play().catch(() => {
        console.log("Couldn't play sound");
      });
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

export const maybeGetFromStorage = (key: string, defaultValue: string | boolean | Item[]) => {
  const item = localStorage.getItem(key);
  return item ? JSON.parse(item) : defaultValue;
}

export const deleteIcon = "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjxzdmcgaGVpZ2h0PSI0OCIgdmlld0JveD0iMCAwIDQ4IDQ4IiB3aWR0aD0iNDgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTM4IDEyLjgzTDM1LjE3IDEwIDI0IDIxLjE3IDEyLjgzIDEwIDEwIDEyLjgzIDIxLjE3IDI0IDEwIDM1LjE3IDEyLjgzIDM4IDI0IDI2LjgzIDM1LjE3IDM4IDM4IDM1LjE3IDI2LjgzIDI0eiIvPjxwYXRoIGQ9Ik0wIDBoNDh2NDhIMHoiIGZpbGw9Im5vbmUiLz48L3N2Zz4=";
export const completeIcon = "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjxzdmcgaGVpZ2h0PSI0OCIgdmlld0JveD0iMCAwIDQ4IDQ4IiB3aWR0aD0iNDgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTAgMGg0OHY0OEgweiIgZmlsbD0ibm9uZSIvPjxwYXRoIGQ9Ik0xOCAzMi4zNEw5LjY2IDI0bC0yLjgzIDIuODNMMTggMzhsMjQtMjQtMi44My0yLjgzeiIvPjwvc3ZnPg==";
export const clearIcon = "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjxzdmcgaGVpZ2h0PSI0OCIgdmlld0JveD0iMCAwIDQ4IDQ4IiB3aWR0aD0iNDgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTAgMGg0OHY0OEgwVjB6IiBmaWxsPSJub25lIi8+PHBhdGggZD0iTTEyIDM4YzAgMi4yIDEuOCA0IDQgNGgxNmMyLjIgMCA0LTEuOCA0LTRWMTRIMTJ2MjR6bTQuOTMtMTQuMjRsMi44My0yLjgzTDI0IDI1LjE3bDQuMjQtNC4yNCAyLjgzIDIuODNMMjYuODMgMjhsNC4yNCA0LjI0LTIuODMgMi44M0wyNCAzMC44M2wtNC4yNCA0LjI0LTIuODMtMi44M0wyMS4xNyAyOGwtNC4yNC00LjI0ek0zMSA4bC0yLTJIMTlsLTIgMmgtN3Y0aDI4Vjh6Ii8+PHBhdGggZD0iTTAgMGg0OHY0OEgweiIgZmlsbD0ibm9uZSIvPjwvc3ZnPg==";
export const showIcon = "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjxzdmcgaGVpZ2h0PSI0OCIgdmlld0JveD0iMCAwIDQ4IDQ4IiB3aWR0aD0iNDgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTAgMGg0OHY0OEgweiIgZmlsbD0ibm9uZSIvPjxwYXRoIGQ9Ik0yNCA5QzE0IDkgNS40NiAxNS4yMiAyIDI0YzMuNDYgOC43OCAxMiAxNSAyMiAxNSAxMC4wMSAwIDE4LjU0LTYuMjIgMjItMTUtMy40Ni04Ljc4LTExLjk5LTE1LTIyLTE1em0wIDI1Yy01LjUyIDAtMTAtNC40OC0xMC0xMHM0LjQ4LTEwIDEwLTEwIDEwIDQuNDggMTAgMTAtNC40OCAxMC0xMCAxMHptMC0xNmMtMy4zMSAwLTYgMi42OS02IDZzMi42OSA2IDYgNiA2LTIuNjkgNi02LTIuNjktNi02LTZ6Ii8+PC9zdmc+";
export const addIcon = "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjxzdmcgaGVpZ2h0PSI0OCIgdmlld0JveD0iMCAwIDQ4IDQ4IiB3aWR0aD0iNDgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTM4IDI2SDI2djEyaC00VjI2SDEwdi00aDEyVjEwaDR2MTJoMTJ2NHoiLz48cGF0aCBkPSJNMCAwaDQ4djQ4SDB6IiBmaWxsPSJub25lIi8+PC9zdmc+";