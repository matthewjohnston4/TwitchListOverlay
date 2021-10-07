const App = () => {
  // Create a client with our channel from the configLocal file
  let opts = {
    channels: [configLocal.twitchUser],
  };
  if (
    configLocal.botUsername &&
    configLocal.password &&
    configLocal.botUsername !== "" &&
    configLocal.password !== ""
  ) {
    opts["identity"] = {
      username: configLocal.botUsername,
      password: configLocal.password,
    };
  }
  let client = new tmi.client(opts);

  const [title, setTitle] = React.useState(
    maybeGetFromStorage("overlayListTitle", "")
  );
  const [items, setItems] = React.useState(
    maybeGetFromStorage("overlayListItems", [])
  );
  const [active, setActive] = React.useState(
    maybeGetFromStorage("overlayListActive", false)
  );
  const [removalPaused, _setRemovalPaused] = React.useState(false);
  const removalPausedRef = React.useRef(removalPaused);
  const setRemovalPaused = (data) => {
    removalPausedRef.current = data;
    _setRemovalPaused(data);
  };

  const formatText = (message, emotes, makeUpperCase = false) => {
    // parse the message for html and remove any tags
    if (makeUpperCase) {
      message = message.toUpperCase();
    }
    let newMessage = message.split("");
    // replace any twitch emotes in the message with img tags for those emotes
    if (config.twitchEmotes) {
      for (let emoteIndex in emotes) {
        const emote = emotes[emoteIndex];
        for (let charIndexes in emote) {
          let emoteIndexes = emote[charIndexes];
          if (typeof emoteIndexes == "string") {
            emoteIndexes = emoteIndexes.split("-");
            emoteIndexes = [
              parseInt(emoteIndexes[0]),
              parseInt(emoteIndexes[1]),
            ];
            for (let i = emoteIndexes[0]; i <= emoteIndexes[1]; ++i) {
              newMessage[i] = "";
            }
            newMessage[
              emoteIndexes[0]
            ] = `<img class="emoticon" src="https://static-cdn.jtvnw.net/emoticons/v1/${emoteIndex}/3.0"/>`;
          }
        }
      }
    }

    return newMessage.join("");
  };

  const actionHandlers = {
    // =======================================
    // Command: !list:new <text>
    // Description: Creates a new list with the specified title. Overwrites any stored list.
    // =======================================
    ":new": {
      security: (context, _textContent) => {
        return isMod(context) || isBroadcaster(context);
      },
      handle: (context, textContent) => {
        const formattedText = formatText(textContent, context.emotes).split(
          `${config.commandNameBase}:new `
        )[1];
        if (formattedText && formattedText !== "") {
          createList(formattedText);
        }
      },
    },
    // =======================================
    // Command: !list:title <text>
    // Description: sets a new title for the list
    // =======================================
    ":title": {
      security: (context, _textContent) => {
        return isMod(context) || isBroadcaster(context);
      },
      handle: (context, textContent) => {
        const formattedText = formatText(textContent, context.emotes).split(
          `${config.commandNameBase}:title `
        )[1];
        if (formattedText && formattedText !== "") {
          updateTitle(formattedText);
        }
      },
    },
    // =======================================
    // Command: !list:hide <text>
    // Description: hides the overlay without deleting any of the contents
    // =======================================
    ":hide": {
      security: (context, _textContent) => {
        return isMod(context) || isBroadcaster(context);
      },
      handle: (_context, _textContent) => {
        setActive(false);
      },
    },
    // =======================================
    // Command: !list:show <text>
    // Description: shows the overlay as it was previously set
    // =======================================
    ":show": {
      security: (context, _textContent) => {
        return isMod(context) || isBroadcaster(context);
      },
      handle: (_context, _textContent) => {
        if (!active) {
          maybePlaySound(config.sounds.activate);
        }
        setActive(true);
      },
    },
    // =======================================
    // Command: !list:delete
    // Description: hides the overlay and deletes all content
    // =======================================
    ":delete": {
      security: (context, _textContent) => {
        return isMod(context) || isBroadcaster(context);
      },
      handle: (context, textContent) => {
        deleteOverlay();
      },
    },
    // =======================================
    // Command: !list:add <text>
    // Description: adds an item to the list
    // =======================================
    ":add": {
      security: (context, _textContent) => {
        return isMod(context) || isBroadcaster(context);
      },
      handle: (context, textContent) => {
        const formattedText = formatText(textContent, context.emotes).split(
          `${config.commandNameBase}:add `
        )[1];
        if (formattedText && formattedText !== "") {
          return addTask(formattedText);
        }
      },
    },
    // =======================================
    // Command: !list:addSilent <text>
    // Description: adds an item to the list without effecting list visibility
    // =======================================
    ":addSilent": {
      security: (context, _textContent) => {
        return isMod(context) || isBroadcaster(context);
      },
      handle: (context, textContent) => {
        const formattedText = formatText(textContent, context.emotes).split(
          `${config.commandNameBase}:addSilent `
        )[1];
        if (formattedText && formattedText !== "") {
          return addTask(formattedText, true);
        }
      },
    },
    // =======================================
    // Command: !list:complete <itemNumber>
    // Description: completes an item in the list using its 1-based index
    // =======================================
    ":complete": {
      security: (context, _textContent) => {
        return isMod(context) || isBroadcaster(context);
      },
      handle: (context, command) => {
        const itemNumber = parseInt(
          command.split(`${config.commandNameBase}:complete `)[1]
        );
        if (!isNaN(itemNumber)) {
          setComplete(itemNumber);
        }
      },
    },
    // =======================================
    // Command: !list:remove <identifier>
    // Description: removes an item in the list using its identifier (see README)
    // =======================================
    ":remove": {
      security: (context, _textContent) => {
        return isMod(context) || isBroadcaster(context);
      },
      handle: (context, command) => {
        const identifier = formatText(command, context.emotes).split(
          `${config.commandNameBase}:remove `
        )[1];
        return removeTask(identifier);
      },
    },
    // =======================================
    // Command: !list:remove <index>
    // Description: removes an item in the list using its 1-based index
    // =======================================
    ":removeIndex": {
      security: (context, _textContent) => {
        return isMod(context) || isBroadcaster(context);
      },
      handle: (context, command) => {
        const identifier = formatText(command, context.emotes).split(
          `${config.commandNameBase}:removeIndex `
        )[1];
        return removeTask(identifier, true);
      },
    },
    // =======================================
    // Command: !list:clear or !list:empty
    // Description: empties a list of all items, but keeps the title
    // =======================================
    ":clear": {
      security: (context, _textContent) => {
        return isMod(context) || isBroadcaster(context);
      },
      handle: (_context, _command) => {
        clearTasks();
      },
    },
    ":empty": {
      security: (context, _textContent) => {
        return isMod(context) || isBroadcaster(context);
      },
      handle: (_context, _command) => {
        clearTasks();
      },
    },
  };

  const createList = (title) => {
    deleteOverlay();
    setTitle(title);
    if (!active) {
      maybePlaySound(config.sounds.activate);
    }
    setActive(true);
  };

  const updateTitle = (text) => {
    setTitle(text);
    if (!active) {
      maybePlaySound(config.sounds.activate);
    }
    setActive(true);
  };

  const deleteOverlay = () => {
    setActive(false);
    setTitle("");
    setItems([]);
  };

  const addTask = (text, silent = false) => {
    let response = null;
    setItems((items) => {
      // Only add item if it doesn't already exist
      let exists = false;
      for (const item of items) {
        if (item.text.toLowerCase() === text.toLowerCase()) {
          exists = true;
          break;
        }
      }
      if (exists) {
        response = "that item already exists";
        return items;
      } else {
        if (silent) {
          response = "item silently added";
        }
        return [...items, { text: text, complete: false }];
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

  const setComplete = (itemNumber) => {
    setItems((items) => {
      if (typeof items[itemNumber - 1] !== "undefined") {
        if (!items[itemNumber - 1]["complete"] && active) {
          maybePlaySound(config.sounds.completeItem);
        }
        return [
          ...items.slice(0, itemNumber - 1),
          { ...items[itemNumber - 1], complete: true },
          ...items.slice(itemNumber),
        ];
      }
      return items;
    });
  };

  const removeTask = (identifier, forceIndex) => {
    let response = null;
    let method = config.handlerOptions.removalMethod;
    if (forceIndex) {
      method = "index";
    }
    let debounce = 3000;
    if (
      config.handlerOptions.removalDebounce &&
      Number.isInteger(config.handlerOptions.removalDebounce)
    ) {
      debounce = config.handlerOptions.removalDebounce * 1000;
    }
    if (identifier && identifier !== "") {
      if (method === "index" && removalPausedRef.current) {
        response = `you can't use this command just now, try again in ${
          debounce / 1000
        } seconds`;
      } else {
        setItems((items) => {
          let idx = -1;
          switch (method) {
            case "fullText":
              idx = items.findIndex(
                (item) => item.text.toLowerCase() === identifier.toLowerCase()
              );
              break;
            case "startsWithText":
              const found = items.filter((item) =>
                item.text.toLowerCase().startsWith(identifier.toLowerCase())
              );
              if (found.length === 1) {
                idx = items.findIndex((item) =>
                  item.text.toLowerCase().startsWith(identifier.toLowerCase())
                );
              }
              if (found.length > 1) {
                response =
                  "there was more than one item with that text — please be more specific";
              }
              if (found.length === 0) {
                response = "no items matched that text, please try again";
              }
              break;
            case "index":
              const intId = parseInt(identifier, 10);
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
              setTimeout(() => setRemovalPaused(false), debounce);
              return [...items.slice(0, idx), ...items.slice(idx + 1)];
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

  const clearTasks = () => {
    setItems([]);
  };

  const onMessage = (target, context, msg, _self) => {
    // Remove whitespace from chat message
    const command = msg.trim();
    const handlerName = command
      .split(" ")[0]
      .replace(config.commandNameBase, "");

    // Check all commands
    if (
      actionHandlers[handlerName] &&
      actionHandlers[handlerName].security(context, command)
    ) {
      const response = actionHandlers[handlerName].handle(context, command);
      if (response) {
        console.log(`@${context.username} — ${response}`);
        client.say(target, `@${context.username} — ${response}`);
      }
    }
  };

  const onConnected = (addr, port) => {
    console.log(`* Connected to ${addr}:${port}`);
  };

  // Called when component mounts
  React.useEffect(() => {
    // Register our event handlers
    client.on("message", onMessage);
    client.on("connected", onConnected);

    // Connect to Twitch:
    client.connect();
  }, []);

  // Called when 'active' changes
  React.useEffect(() => {
    localStorage.setItem("overlayListActive", JSON.stringify(active));
  }, [active]);

  // Called when 'items' changes
  React.useEffect(() => {
    localStorage.setItem("overlayListItems", JSON.stringify(items));
  }, [items]);

  // Called when 'title' changes
  React.useEffect(() => {
    localStorage.setItem("overlayListTitle", JSON.stringify(title));
  }, [title]);

  const onChange = (event) => setValue(event.target.value);

  return (
    <div
      style={{
        backgroundColor: `rgba(${config.colors.background}, ${config.colors.backgroundOpacity})`,
        color: `rgba(${config.colors.foreground}, ${config.colors.foregroundOpacity})`,
        fontFamily: config.font.family,
        fontSize: config.font.baseSize,
        textAlign: config.font.textAlign,
        marginBottom: config.position.vMargin,
        marginTop: config.position.vMargin,
        marginLeft: config.position.hMargin,
        marginRight: config.position.hMargin,
        padding: config.position.padding,
        width: config.position.width,
      }}
      className={`overlayList__root overlayList__root--h-${
        config.position.horizontal
      } overlayList__root--v-${config.position.fillMethod} ${
        active ? " overlayList__root--active" : ""
      }`}
    >
      <h1
        style={{ fontSize: config.font.titleSize }}
        dangerouslySetInnerHTML={{ __html: title }}
      />
      <ul
        className={`overlayList__list ${
          config.useListSymbols ? "overlayList__list--listSymbolsActive" : null
        }`}
        style={{
          borderTopColor: `rgba(${config.colors.foreground}, ${
            config.colors.foregroundOpacity / 2
          })`,
        }}
      >
        {Array.from(items).map((item, idx) => (
          <li
            key={`item_${idx}`}
            style={{
              color: `rgba(${config.colors.foreground}, ${
                item.complete
                  ? config.colors.foregroundOpacity / 1.5
                  : config.colors.foregroundOpacity
              })`,
            }}
            className={
              item.complete
                ? "overlayList__listItem overlayList__listItem--complete"
                : "overlayList__listItem"
            }
          >{config.useListSymbols ? <i className="overlayList__listItemSymbol">{config.listSymbol}</i> : null}{ item.text }</li>
        ))}
      </ul>
    </div>
  );
};

ReactDOM.render(
  <App>Hello, world!</App>,
  document.querySelector(".overlayList__holder")
);
