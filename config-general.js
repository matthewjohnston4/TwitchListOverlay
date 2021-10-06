const config = {
  commandNameBase: "!list", // the base command name that all the subcommands are derived from
  handlerOptions: {
    removalMethod: "startsWithText", // one of "fullText", "startsWithText", or "index"
    removalDebounce: 3, // how many seconds to wait between allowing index removal use
  },
  useListSymbols: true, // Should a bullet symbol be added to each item?
  listSymbol: "•", // the bullet symbol you want to use. Can be any unicode symbol or standard emoji
  position: {
    horizontal: "left", // one of `left`, `right`, or `middle`
    fillMethod: "upwards", // one of `fromCentre`, `upwards`, or `downwards`
    hMargin: "50px", // horizontal margins of list
    vMargin: "50px", // vertical margins of list
    padding: "20px", // padding on the overlay list
    width: "400px",
  },
  font: {
    baseSize: "24px", // include size unit value, px, rem, or whatever
    titleSize: "28px",
    textAlign: "left", // one of left or right
    family: "Open Sans Condensed, sans-serif",
  },
  colors: {
    foreground: "255, 255, 255", // RGB value
    foregroundOpacity: "1", // Decimal value (to one place) between 0 and 1.0
    background: "230, 11, 124", // RGB value
    backgroundOpacity: "0.9", // Decimal value (to one place) between 0 and 1.0
  },
  twitchEmotes: true, // set to false to leave emote text as text
  sounds: {
    activate: "assets/sounds/addition.wav",
    newItem: "assets/sounds/addition.wav",
    completeItem: "assets/sounds/success.wav",
  },
};
