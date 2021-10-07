var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var App = function App() {
  // Create a client with our channel from the configLocal file
  var opts = {
    channels: [configLocal.twitchUser]
  };
  if (configLocal.botUsername && configLocal.password && configLocal.botUsername !== "" && configLocal.password !== "") {
    opts["identity"] = {
      username: configLocal.botUsername,
      password: configLocal.password
    };
  }
  var client = new tmi.client(opts);

  var _React$useState = React.useState(maybeGetFromStorage("overlayListTitle", "")),
      _React$useState2 = _slicedToArray(_React$useState, 2),
      title = _React$useState2[0],
      setTitle = _React$useState2[1];

  var _React$useState3 = React.useState(maybeGetFromStorage("overlayListItems", [])),
      _React$useState4 = _slicedToArray(_React$useState3, 2),
      items = _React$useState4[0],
      setItems = _React$useState4[1];

  var _React$useState5 = React.useState(maybeGetFromStorage("overlayListActive", false)),
      _React$useState6 = _slicedToArray(_React$useState5, 2),
      active = _React$useState6[0],
      setActive = _React$useState6[1];

  var _React$useState7 = React.useState(false),
      _React$useState8 = _slicedToArray(_React$useState7, 2),
      removalPaused = _React$useState8[0],
      _setRemovalPaused = _React$useState8[1];

  var removalPausedRef = React.useRef(removalPaused);
  var setRemovalPaused = function setRemovalPaused(data) {
    removalPausedRef.current = data;
    _setRemovalPaused(data);
  };

  var formatText = function formatText(message, emotes) {
    var makeUpperCase = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

    // parse the message for html and remove any tags
    if (makeUpperCase) {
      message = message.toUpperCase();
    }
    var newMessage = message.split("");
    // replace any twitch emotes in the message with img tags for those emotes
    if (config.twitchEmotes) {
      for (var emoteIndex in emotes) {
        var emote = emotes[emoteIndex];
        for (var charIndexes in emote) {
          var emoteIndexes = emote[charIndexes];
          if (typeof emoteIndexes == "string") {
            emoteIndexes = emoteIndexes.split("-");
            emoteIndexes = [parseInt(emoteIndexes[0]), parseInt(emoteIndexes[1])];
            for (var i = emoteIndexes[0]; i <= emoteIndexes[1]; ++i) {
              newMessage[i] = "";
            }
            newMessage[emoteIndexes[0]] = "<img class=\"emoticon\" src=\"https://static-cdn.jtvnw.net/emoticons/v1/" + emoteIndex + "/3.0\"/>";
          }
        }
      }
    }

    return newMessage.join("");
  };

  var actionHandlers = {
    // =======================================
    // Command: !list:new <text>
    // Description: Creates a new list with the specified title. Overwrites any stored list.
    // =======================================
    ":new": {
      security: function security(context, _textContent) {
        return isMod(context) || isBroadcaster(context);
      },
      handle: function handle(context, textContent) {
        var formattedText = formatText(textContent, context.emotes).split(config.commandNameBase + ":new ")[1];
        if (formattedText && formattedText !== "") {
          createList(formattedText);
        }
      }
    },
    // =======================================
    // Command: !list:title <text>
    // Description: sets a new title for the list
    // =======================================
    ":title": {
      security: function security(context, _textContent) {
        return isMod(context) || isBroadcaster(context);
      },
      handle: function handle(context, textContent) {
        var formattedText = formatText(textContent, context.emotes).split(config.commandNameBase + ":title ")[1];
        if (formattedText && formattedText !== "") {
          updateTitle(formattedText);
        }
      }
    },
    // =======================================
    // Command: !list:hide <text>
    // Description: hides the overlay without deleting any of the contents
    // =======================================
    ":hide": {
      security: function security(context, _textContent) {
        return isMod(context) || isBroadcaster(context);
      },
      handle: function handle(_context, _textContent) {
        setActive(false);
      }
    },
    // =======================================
    // Command: !list:show <text>
    // Description: shows the overlay as it was previously set
    // =======================================
    ":show": {
      security: function security(context, _textContent) {
        return isMod(context) || isBroadcaster(context);
      },
      handle: function handle(_context, _textContent) {
        if (!active) {
          maybePlaySound(config.sounds.activate);
        }
        setActive(true);
      }
    },
    // =======================================
    // Command: !list:delete
    // Description: hides the overlay and deletes all content
    // =======================================
    ":delete": {
      security: function security(context, _textContent) {
        return isMod(context) || isBroadcaster(context);
      },
      handle: function handle(context, textContent) {
        deleteOverlay();
      }
    },
    // =======================================
    // Command: !list:add <text>
    // Description: adds an item to the list
    // =======================================
    ":add": {
      security: function security(context, _textContent) {
        return isMod(context) || isBroadcaster(context);
      },
      handle: function handle(context, textContent) {
        var formattedText = formatText(textContent, context.emotes).split(config.commandNameBase + ":add ")[1];
        if (formattedText && formattedText !== "") {
          return addTask(formattedText);
        }
      }
    },
    // =======================================
    // Command: !list:addSilent <text>
    // Description: adds an item to the list without effecting list visibility
    // =======================================
    ":addSilent": {
      security: function security(context, _textContent) {
        return isMod(context) || isBroadcaster(context);
      },
      handle: function handle(context, textContent) {
        var formattedText = formatText(textContent, context.emotes).split(config.commandNameBase + ":addSilent ")[1];
        if (formattedText && formattedText !== "") {
          return addTask(formattedText, true);
        }
      }
    },
    // =======================================
    // Command: !list:complete <itemNumber>
    // Description: completes an item in the list using its 1-based index
    // =======================================
    ":complete": {
      security: function security(context, _textContent) {
        return isMod(context) || isBroadcaster(context);
      },
      handle: function handle(context, command) {
        var itemNumber = parseInt(command.split(config.commandNameBase + ":complete ")[1]);
        if (!isNaN(itemNumber)) {
          setComplete(itemNumber);
        }
      }
    },
    // =======================================
    // Command: !list:remove <identifier>
    // Description: removes an item in the list using its identifier (see README)
    // =======================================
    ":remove": {
      security: function security(context, _textContent) {
        return isMod(context) || isBroadcaster(context);
      },
      handle: function handle(context, command) {
        var identifier = formatText(command, context.emotes).split(config.commandNameBase + ":remove ")[1];
        return removeTask(identifier);
      }
    },
    // =======================================
    // Command: !list:remove <index>
    // Description: removes an item in the list using its 1-based index
    // =======================================
    ":removeIndex": {
      security: function security(context, _textContent) {
        return isMod(context) || isBroadcaster(context);
      },
      handle: function handle(context, command) {
        var identifier = formatText(command, context.emotes).split(config.commandNameBase + ":removeIndex ")[1];
        return removeTask(identifier, true);
      }
    },
    // =======================================
    // Command: !list:clear or !list:empty
    // Description: empties a list of all items, but keeps the title
    // =======================================
    ":clear": {
      security: function security(context, _textContent) {
        return isMod(context) || isBroadcaster(context);
      },
      handle: function handle(_context, _command) {
        clearTasks();
      }
    },
    ":empty": {
      security: function security(context, _textContent) {
        return isMod(context) || isBroadcaster(context);
      },
      handle: function handle(_context, _command) {
        clearTasks();
      }
    }
  };

  var createList = function createList(title) {
    deleteOverlay();
    setTitle(title);
    if (!active) {
      maybePlaySound(config.sounds.activate);
    }
    setActive(true);
  };

  var updateTitle = function updateTitle(text) {
    setTitle(text);
    if (!active) {
      maybePlaySound(config.sounds.activate);
    }
    setActive(true);
  };

  var deleteOverlay = function deleteOverlay() {
    setActive(false);
    setTitle("");
    setItems([]);
  };

  var addTask = function addTask(text) {
    var silent = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

    var response = null;
    setItems(function (items) {
      // Only add item if it doesn't already exist
      var exists = false;
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = items[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var item = _step.value;

          if (item.text.toLowerCase() === text.toLowerCase()) {
            exists = true;
            break;
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      if (exists) {
        response = "that item already exists";
        return items;
      } else {
        if (silent) {
          response = "item silently added";
        }
        return [].concat(_toConsumableArray(items), [{ text: text, complete: false }]);
      }
    });
    if (!silent) {
      setActive(true);
      if (active) {
        maybePlaySound(config.sounds.newItem);
      } else {
        maybePlaySound(config.sounds.activate);
      }
    }
    return response;
  };

  var setComplete = function setComplete(itemNumber) {
    setItems(function (items) {
      if (typeof items[itemNumber - 1] !== "undefined") {
        if (!items[itemNumber - 1]["complete"] && active) {
          maybePlaySound(config.sounds.completeItem);
        }
        return [].concat(_toConsumableArray(items.slice(0, itemNumber - 1)), [Object.assign({}, items[itemNumber - 1], { complete: true })], _toConsumableArray(items.slice(itemNumber)));
      }
      return items;
    });
  };

  var removeTask = function removeTask(identifier, forceIndex) {
    var response = null;
    var method = config.handlerOptions.removalMethod;
    if (forceIndex) {
      method = "index";
    }
    var debounce = 3000;
    if (config.handlerOptions.removalDebounce && Number.isInteger(config.handlerOptions.removalDebounce)) {
      debounce = config.handlerOptions.removalDebounce * 1000;
    }
    if (identifier && identifier !== "") {
      if (method === "index" && removalPausedRef.current) {
        response = "you can't use this command just now, try again in " + debounce / 1000 + " seconds";
      } else {
        setItems(function (items) {
          var idx = -1;
          switch (method) {
            case "fullText":
              idx = items.findIndex(function (item) {
                return item.text.toLowerCase() === identifier.toLowerCase();
              });
              break;
            case "startsWithText":
              var found = items.filter(function (item) {
                return item.text.toLowerCase().startsWith(identifier.toLowerCase());
              });
              if (found.length === 1) {
                idx = items.findIndex(function (item) {
                  return item.text.toLowerCase().startsWith(identifier.toLowerCase());
                });
              }
              if (found.length > 1) {
                response = "there was more than one item with that text — please be more specific";
              }
              if (found.length === 0) {
                response = "no items matched that text, please try again";
              }
              break;
            case "index":
              var intId = parseInt(identifier, 10);
              if (Number.isInteger(intId)) {
                idx = intId - 1;
              }
              break;
            default:
              break;
          }
          if (idx > -1) {
            if (idx >= items.length) {
              response = "that item does not exist";
            } else {
              setRemovalPaused(true);
              setTimeout(function () {
                return setRemovalPaused(false);
              }, debounce);
              return [].concat(_toConsumableArray(items.slice(0, idx)), _toConsumableArray(items.slice(idx + 1)));
            }
          } else {
            if (!response) {
              response = "that item does not exist";
            }
          }
          return items;
        });
      }
    } else {
      response = "you didn't specify the name of an item to remove";
    }
    return response;
  };

  var clearTasks = function clearTasks() {
    setItems([]);
  };

  var onMessage = function onMessage(target, context, msg, _self) {
    // Remove whitespace from chat message
    var command = msg.trim();
    var handlerName = command.split(" ")[0].replace(config.commandNameBase, "");

    // Check all commands
    if (actionHandlers[handlerName] && actionHandlers[handlerName].security(context, command)) {
      var response = actionHandlers[handlerName].handle(context, command);
      if (response) {
        console.log("@" + context.username + " \u2014 " + response);
        client.say(target, "@" + context.username + " \u2014 " + response);
      }
    }
  };

  var onConnected = function onConnected(addr, port) {
    console.log("* Connected to " + addr + ":" + port);
  };

  // Called when component mounts
  React.useEffect(function () {
    // Register our event handlers
    client.on("message", onMessage);
    client.on("connected", onConnected);

    // Connect to Twitch:
    client.connect();
  }, []);

  // Called when 'active' changes
  React.useEffect(function () {
    localStorage.setItem("overlayListActive", JSON.stringify(active));
  }, [active]);

  // Called when 'items' changes
  React.useEffect(function () {
    localStorage.setItem("overlayListItems", JSON.stringify(items));
  }, [items]);

  // Called when 'title' changes
  React.useEffect(function () {
    localStorage.setItem("overlayListTitle", JSON.stringify(title));
  }, [title]);

  var onChange = function onChange(event) {
    return setValue(event.target.value);
  };

  return React.createElement(
    "div",
    {
      style: {
        backgroundColor: "rgba(" + config.colors.background + ", " + config.colors.backgroundOpacity + ")",
        color: "rgba(" + config.colors.foreground + ", " + config.colors.foregroundOpacity + ")",
        fontFamily: config.font.family,
        fontSize: config.font.baseSize,
        textAlign: config.font.textAlign,
        marginBottom: config.position.vMargin,
        marginTop: config.position.vMargin,
        marginLeft: config.position.hMargin,
        marginRight: config.position.hMargin,
        padding: config.position.padding,
        width: config.position.width
      },
      className: "overlayList__root overlayList__root--h-" + config.position.horizontal + " overlayList__root--v-" + config.position.fillMethod + " " + (active ? " overlayList__root--active" : "")
    },
    React.createElement("h1", {
      style: { fontSize: config.font.titleSize },
      dangerouslySetInnerHTML: { __html: title }
    }),
    React.createElement(
      "ul",
      {
        className: "overlayList__list " + (config.useListSymbols ? "overlayList__list--listSymbolsActive" : null),
        style: {
          borderTopColor: "rgba(" + config.colors.foreground + ", " + config.colors.foregroundOpacity / 2 + ")"
        }
      },
      Array.from(items).map(function (item, idx) {
        return React.createElement(
          "li",
          {
            key: "item_" + idx,
            style: {
              color: "rgba(" + config.colors.foreground + ", " + (item.complete ? config.colors.foregroundOpacity / 1.5 : config.colors.foregroundOpacity) + ")"
            },
            className: item.complete ? "overlayList__listItem overlayList__listItem--complete" : "overlayList__listItem"
          },
          config.useListSymbols ? React.createElement(
            "i",
            { className: "overlayList__listItemSymbol" },
            config.listSymbol
          ) : null,
          item.text
        );
      })
    )
  );
};

ReactDOM.render(React.createElement(
  App,
  null,
  "Hello, world!"
), document.querySelector(".overlayList__holder"));