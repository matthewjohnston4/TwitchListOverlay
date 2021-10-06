# TwitchListOverlay

A simple OBS overlay to allow a Twitch channel's broadcaster or mods to add a list of items, with a title.

Ideal for objective lists, todo lists, schedules or whatever else comes in list form.

This overlay includes use of local browser storage — lists are saved and can be re-used on subsequent streams on the same channel.

<img width="966" src="https://user-images.githubusercontent.com/986185/123448347-ba471080-d5d2-11eb-8065-73154500c126.png">

## Installation

If you want to use this overlay, you'll need OBS or similar and be comfortable editing a settings file for configuration.

1. Download the ZIP archive here and extract to your local machine or just clone this repo.
2. In the extracted files, rename `config-local.js.sample` to `config-local.js`.
3. Fill in `twitchUser` in `config-local.js` with your Twitch channel username.
4. _Optional_ Fill in `password` and `botUsername` in `config-local.js` to enable chat-based errors for command users (see the comments in `config-local.js.sample` for a longer explanation).
4. Open OBS or whatever you're using, and add `twitchOverlays.html` as a Browser Source. Set `height` and `width` to the same dimensions as the resolution of your stream.
5. _Optional:_ Enable "Shutdown source when not visible" to reload the overlay when you toggle its visibility — this is useful if you're making adjustments to the CSS or color variables.
6. Position the overlay by dragging it to your preferred vertical location within OBS. Check out the `fillDirection` setting below for more on how you can customise how the overlay will expand vertically.

You're done! Now you can test this out by typing `!list:new Hello, World!` in your Twitch channel chat.

## Usage

All these subcommands can vary based on the value of `commandNameBase` in `config-general.js`:

* `!list:new <title>` creates a new list with the specified title. Overwrites any stored list.
* `!list:add <text>` adds an item to the list with the specified text.
* `!list:complete <itemNumber>` completes an item using its numbered position in the list (this number is 1-based, not array-like 0-based).
* `!list:delete` deletes all content from the overlay and hides it — you may want to just hide it with `!list:hide` as below.
* `!list:remove <identifier>` removes an item from the list, by specifying some identifier. The default identifier is to type the exact string of text of the item you want to remove, but you can customise this as shown below (in "Handler Options").
* `!list:clear` or `!list:empty` empties a list of all items, while keeping the title and leaving the overlay active.
* `!list:title <title>` sets a new title for the list using the specified text.
* `!list:hide` hides the overlay, but retains all of the entered items and titles. Useful if you want to come back to the same list later in a stream.
* `!list:show` shows the overlay, if it was previously hidden, with any previous values for title and items retained.

### Advanced commands

* `!list:removeIndex <itemNumber>` removes an item from the list, by specifying a 1-based index.
* `!list:addSilent <text>` adds an item to the list with the specified text, but doesn't 'show' the overlay if it is hidden.

## Customising

There are a few common settings to edit in `config-general.js` in order to adjust how the overlay looks and sounds:

* `commandNameBase`: The base command name that all the subcommands are derived from
* `handlerOptions`:
    * `removalMethod`: Determines how users use the `:remove` command, [see below](#remove-methods) for more details. One of "fullText", "startsWithText", or "index".
    * `removalDebounce`: How many seconds to wait between allowing `index`-based `:remove` commands.
    * `useListSymbols`: Change this setting if you want to enable or disable the display of list item bullets.
    * `listSymbol`: Adjust to modify what symbol gets used as the 'bullet'. You can use any unicode symbol (https://www.toptal.com/designers/htmlarrows/punctuation/) or standard emoji (not Twitch emotes).
* `position`:
    * `horizontal`: Where to put the list item within the entire overlay bounds. One of `left`, `right`, or `middle`. You can also ignore this setting and drag the position of the overlay in OBS, but if you want to quickly flip the list from one side of the stream to another, this setting will help you do that.
    * `fillMethod`: Determines how the list will expand as you add items. You can still position your overlay manually by dragging it in OBS, but the `fillMethod` will ensure your list will expand in the right direction for where you place it.
        * `fromCentre` means the height will expand vertically in equal amounts for each added items.
        * `downwards` means the height will always expand downwards.
        * `upwards` means the height will always expand upwards.
    * `hMargin`: Horizontal margins around the list (include CSS units). Margins are useful if you want to snap the overlay, but still have a gap from the edge of your stream video.
    * `vMargin`: Vertical margins around list (include CSS units).
    * `padding`: Padding inside the list, around the content (include CSS units).
    * `width`: Width that the list should fill within the overlay bounds. Can be a static value like `400px` or a proportional one like `25vw`.
* `font`:
    * `baseSize`: Base font size. Include a CSS unit.
    * `titleSize`: Title font size. Include a CSS unit.
    * `textAlign`: One of `left` or `right`
    * `family`: A valid font-family string.
* `colors`:
    * `foreground`: RGB value of the text and line colors within the list.
    * `foregroundOpacity`: Decimal value (to one place) between 0 and 1.0 of the opacity of the text.
    * `background`: RGB value of the background of the list.
    * `backgroundOpacity`: Decimal value (to one place) between 0 and 1.0 of the opacity of the background of the list.
* `twitchEmotes`: Set to false to leave emote text as text, true to try and convert it to an image (GIFs do not work yet).
* `sounds`: All sound options can be left as a blank string (`""`) if you don't want any sounds to play.
    * `activate`: Sound that plays when the commands `:new` or `:show` are used.
    * `newItem`: Sound that plays when an item is added to the list using `:add`.
    * `completeItem`: Sound that plays when an item is completed using `:complete` (does not play for `:remove` commands).

You can also replace the sound files in `assets/sounds` with your own files to customise the alert sounds.

### Custom CSS

If you want to customise further, please add a file in `assets/styles_extra.css` and add CSS rules to it. This file is included in the `.gitignore`, so it will not be overwritten when you want to upgrade your version of the overlay.

### Removal methods

The `removalMethod` setting determines how the `:remove` subcommand works:

* `fullText` - anyone using the command will need to type the exact text of an item to remove it.
* `startsWithText` - a best attempt will be made to pick an item that starts with the string used. If more than one item matches, none will be removed and an error message will be sent back to the command user.
* `index` - uses a one-based index (ie. starts from 1) to identify the item to remove. When this setting is used, `removalDebounce` is active - this disables additional use of the `:remove` command for a number of seconds. This can be useful to prevent collisions between multiple users calling the same command, but using `index` is still riskier.

----

## ADVANCED: Add custom handles

If you want to add your own handlers, you will need to understand JavaScript, React, and the tmi.js library. We'll also use Babel, but you don't really need to understand what it does (processes React's JSX format into plain, browser-compatible JavaScript), as I've included the necessary steps below in "Preprocessing after making code changes".

There are a few extra things to consider.
1. Do you want it to fire based on a !command?
2. Do you want it to fire on every chat?
3. What security should prevent the handler being fired? e.g mod only, broadcaster only etc.
4. What should the handler do?

Once you have answered those questions you are ready to add the handler.

1. Navigate to `src/app.js`
2. Add a new entry to the `actionHandlers` constant using this format:
``` javascript
":subcommand": {
    security: (context, textContent) => {
        return true; // This should return a boolean, true will fire the handler
    },
    handle: (context, textContent) => {
        // Place handle script here
        // If you want to send a message response in-channel, your handler should return
        // the message as a string. If not, you can leave it as a void function.
    }
}
```
3. Complete your handler and don't forget to add a description to this README.

`src/app.js` and `src/helpers.js` contain a few handy functions that you can reuse in your custom handlers.

## Preprocessing after making code changes

After you've made changes to any `src/*` files, you'll need to re-preprocess them into compatible JavaScript using Babel. It's pretty simple, if you have Node (v12.13.0 was used to create this) and NPM (v6.13.4) installed:

1. Run `npm i` from the project root.
2. Run `npx babel --watch src --out-dir bin --presets react-app/prod`

The second command will launch an auto-watcher which will look for changes in `src/` and process them into `bin/` where `twitchOverlays.htm` expects them to be.

## Upgrading

To upgrade, you can backup your `config-general.js` and `config-local.js` files, delete the overlay directory, and then re-download. Copy relevant configuration settings back in again afterwards. And make sure OBS has refreshed your updates.

## Credits

This project was originally based on the great [TwitchPopups project](https://github.com/DaftLimmy/TwitchPopups). If you like this one, check that one out too.

Included sounds used under Creative Commons license from https://freesound.org/people/rhodesmas/
