# TwitchListOverlay

A simple OBS overlay to allow a Twitch channel's broadcaster or mods to add a list of items, with a title.

Ideal for objective lists, todo lists, schedules or whatever else comes in list form.

This overlay includes use of local browser storage — lists are saved and can be re-used on subsequent streams on the same channel.

<img width="966" src="https://user-images.githubusercontent.com/986185/123448347-ba471080-d5d2-11eb-8065-73154500c126.png">

## Installation

If you want to use this overlay, you'll need OBS or similar and be comfortable editing a settings file for configuration.

1. Download the ZIP archive here and extract to your local machine or just clone this repo.
2. In the extracted files, rename `config-local.js.sample` to `config-local.js`.
3. Fill in `twitchUser` in `config-local.js` with your Twitch channel username. You can also optionally fill in `password` and `botUsername` in that config to enable in-channel error notifications (see the config file for a longer explanation).
4. Open OBS or whatever you're using, and add `twitchOverlays.html` as a Browser Source. Make sure you choose a width and height that match whatever your stream resolution is.
5. _Optional:_ Enable "Shutdown source when not visible" to reload the overlay when you toggle its visibility — this is useful if you're making adjustments to the CSS or color variables.

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
* `!list:removeIndex <itemNumber>` removes an item from the list, by specifying a 1-based index.

## Customising

There are a few common settings to edit in `config-general.js` in order to adjust how the overlay looks and sounds.

You can also modify `assets/styles.css` if you know how to use CSS, and replace the sound files in `assets/sounds` with your own files to customise the alert sounds.

If you don't want to use sounds, leave the filenames as empty strings `""` in `config-general.js`.

### Handler Options

The `removalMethod` setting determines how the `:remove` subcommand works:

* `fullText` - anyone using the command will need to type the exact text of an item to remove it.
* `startsWithText` - a best attempt will be made to pick an item that starts with the string used. If more than one item matches, none will be removed and an error message will be sent back to the command user.
* `index` - uses a one-based index (ie. starts from 1) to identify the item to remove. When this setting is used, `removalDebounce` is active - this disables additional use of the `:remove` command for a number of seconds. This can be useful to prevent collisions between multiple users calling the same command, but using `index` is still riskier.

### Customising list symbols

Change the `useListSymbols` config-general setting if you want to enable or disable the display of list item markers.

Adjust the CSS property for `.overlayList__list--listSymbolsActive li::before` to modify what symbol gets used as the item marker. You can use the CSS code for any HTML character entity, as listed here: https://www.toptal.com/designers/htmlarrows/punctuation/


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

No need to credit me, but if you want to chuck me a donation, [go to my Ko-fi](https://ko-fi.com/matthewathome)

Included sounds used under Creative Commons license from https://freesound.org/people/rhodesmas/
