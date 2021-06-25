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
    // Command: !list:remove <name>
    // Description: removes an item in the list using its name (to avoid mod collisions)
    // =======================================
    ":remove": {
      security: (context, _textContent) => {
        return isMod(context) || isBroadcaster(context);
      },
      handle: (context, command) => {
        const name = formatText(command, context.emotes).split(
          `${config.commandNameBase}:remove `
        )[1];
        return removeTask(name);
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

  const addTask = (text, place = null) => {
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
        return [...items, { text: text, complete: false }];
      }
    });
    setActive(true);
    if (active) {
      maybePlaySound(config.sounds.newItem);
    } else {
      maybePlaySound(config.sounds.activate);
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

  const removeTask = (name) => {
    let response = null;
    if (name && name !== "") {
      setItems((items) => {
        const idx = items.findIndex(
          (item) => item.text.toLowerCase() === name.toLowerCase()
        );
        if (idx !== -1) {
          return [...items.slice(0, idx), ...items.slice(idx + 1)];
        } else {
          response = "that item does not exist";
        }
        return items;
      });
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
        fontSize: config.font.baseSize,
      }}
      className={`overlayList__root${
        active ? " overlayList__root--active" : ""
      }`}
    >
      <h1
        style={{ fontSize: config.font.titleSize }}
        dangerouslySetInnerHTML={{ __html: title }}
      />
      <ul
        className="overlayList__list"
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
            dangerouslySetInnerHTML={{ __html: item.text }}
          ></li>
        ))}
      </ul>
    </div>
  );
};

ReactDOM.render(
  <App>Hello, world!</App>,
  document.querySelector(".overlayList__holder")
);
