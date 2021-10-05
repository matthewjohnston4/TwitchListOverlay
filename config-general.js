const config = {
  "commandNameBase": "!list", // the base command name that all the subcommands are derived from
  "handlerOptions" : {
    "removalMethod": "fullText", // one of "fullText", "startsWithText", or "index"
    "removalDebounce": 3, // how many seconds to wait between allowing index removal use
  },
  "position": {
    "horizontal": "right", // one of left, right, middle
    "vertical": "middle", // one of top, bottom, middle
    "hMargin": "50px", // horizontal margins of list
    "vMargin": "50px", // vertical margins of list
  },
  "font": {
    "baseSize": "20px", // include size unit value, px, rem, or whatever
    "titleSize": "28px",
    "textAlign": "left", // one of left or right
  },
  "colors": {
    "foreground": "255, 255, 255", // RGB value
    "foregroundOpacity": "1", // Decimal value (to one place) between 0 and 1.0
    "background": "230, 11, 124", // RGB value
    "backgroundOpacity": "0.8", // Decimal value (to one place) between 0 and 1.0
  },
  "twitchEmotes": true, // set to false to leave emote text as text
  "sounds": {
    "activate": "assets/sounds/addition.wav",
    "newItem": "assets/sounds/addition.wav",
    "completeItem": "assets/sounds/success.wav",
  }
}