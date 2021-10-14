/* eslint-disable @typescript-eslint/no-unused-vars */
import React, {
  FunctionComponent,
  KeyboardEventHandler,
  useEffect,
} from "react";
import { render } from "react-dom";
import tmi, { ChatUserstate } from "tmi.js";
import { config } from "../config-general";
import { configLocal } from "../config-local";
import {
  maybeGetFromStorage,
  maybePlaySound,
  isMod,
  isBroadcaster,
  deleteIcon,
  completeIcon,
  clearIcon,
  showIcon,
  addIcon,
} from "./helpers";
import { Property } from "csstype";

export interface Item {
  text: string;
  complete: boolean;
}

interface Emotes {
  [emoteid: string]: string[];
}

interface SecurityFunc {
  (context: ChatUserstate, _textContent: string): boolean;
}

interface ActionFunc {
  (context: ChatUserstate, _textContent: string): string | null;
}

const App = () => {
  // Create a client with our channel from the configLocal file
  const opts: tmi.Options = {
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
  const client = new tmi.client(opts);

  const [title, setTitle] = React.useState(
    maybeGetFromStorage("overlayListTitle", "") as string
  );
  const [items, setItems] = React.useState(
    maybeGetFromStorage("overlayListItems", []) as Item[]
  );
  const [active, setActive] = React.useState(
    maybeGetFromStorage("overlayListActive", false) as boolean
  );
  const [removalPaused, _setRemovalPaused] = React.useState(false);
  const [connected, setConnected] = React.useState(false);
  const [adminMode, _setAdminMode] = React.useState(
    new URLSearchParams(window.location.search).has("admin")
  );

  const removalPausedRef = React.useRef(removalPaused);
  const setRemovalPaused = (data: boolean) => {
    removalPausedRef.current = data;
    _setRemovalPaused(data);
  };

  const formatText = (
    message: string,
    emotes: Emotes | undefined,
    makeUpperCase = false
  ) => {
    // parse the message for html and remove any tags
    if (makeUpperCase) {
      message = message.toUpperCase();
    }
    const newMessage = Array.from(message);
    // replace any twitch emotes in the message with img tags for those emotes
    if (config.twitchEmotes && emotes) {
      for (const emoteKey in emotes) {
        const emotePositions = emotes[emoteKey];
        emotePositions.forEach((emotePosition) => {
          const start = parseInt(emotePosition.split("-")[0]);
          const end = parseInt(emotePosition.split("-")[1]);
          for (let i = start; i <= end; ++i) {
            newMessage[i] = "";
          }
          newMessage[
            start
          ] = `<img class="emoticon" src="https://static-cdn.jtvnw.net/emoticons/v1/${emoteKey}/3.0"/>`;
        });
      }
    }
    return newMessage.join("");
  };

  const defaultSecurityCheck = (context: ChatUserstate) => {
    if (context) {
      return isMod(context) || isBroadcaster(context);
    }
    return false;
  };

  const actionHandlers: {
    [handler: string]: { security: SecurityFunc; handle: ActionFunc };
  } = {
    // =======================================
    // Command: !list:new <text>
    // Description: Creates a new list with the specified title. Overwrites any stored list.
    // =======================================
    ":new": {
      security: (context: ChatUserstate, _textContent: string) => {
        return defaultSecurityCheck(context);
      },
      handle: (context: ChatUserstate, textContent: string) => {
        const formattedText = formatText(textContent, context.emotes).split(
          `${config.commandNameBase}:new `
        )[1];
        if (formattedText && formattedText !== "") {
          createList(formattedText);
        }
        return null;
      },
    },
    // =======================================
    // Command: !list:title <text>
    // Description: sets a new title for the list
    // =======================================
    ":title": {
      security: (context: ChatUserstate, _textContent: string) => {
        return defaultSecurityCheck(context);
      },
      handle: (context: ChatUserstate, textContent: string) => {
        const formattedText = formatText(textContent, context.emotes).split(
          `${config.commandNameBase}:title `
        )[1];
        if (formattedText && formattedText !== "") {
          updateTitle(formattedText);
        }
        return null;
      },
    },
    // =======================================
    // Command: !list:hide <text>
    // Description: hides the overlay without deleting any of the contents
    // =======================================
    ":hide": {
      security: (context: ChatUserstate, _textContent: string) => {
        return defaultSecurityCheck(context);
      },
      handle: (_context: ChatUserstate, _textContent: string) => {
        setActive(false);
        return null;
      },
    },
    // =======================================
    // Command: !list:show <text>
    // Description: shows the overlay as it was previously set
    // =======================================
    ":show": {
      security: (context: ChatUserstate, _textContent: string) => {
        return defaultSecurityCheck(context);
      },
      handle: (_context: ChatUserstate, _textContent: string) => {
        if (!active) {
          maybePlaySound(config.sounds.activate);
        }
        setActive(true);
        return null;
      },
    },
    // =======================================
    // Command: !list:delete
    // Description: hides the overlay and deletes all content
    // =======================================
    ":delete": {
      security: (context: ChatUserstate, _textContent: string) => {
        return defaultSecurityCheck(context);
      },
      handle: (_context: ChatUserstate, _textContent: string) => {
        deleteOverlay();
        return null;
      },
    },
    // =======================================
    // Command: !list:add <text>
    // Description: adds an item to the list
    // =======================================
    ":add": {
      security: (context: ChatUserstate, _textContent: string) => {
        return defaultSecurityCheck(context);
      },
      handle: (context: ChatUserstate, textContent: string) => {
        const formattedText = formatText(textContent, context.emotes).split(
          `${config.commandNameBase}:add `
        )[1];
        if (formattedText && formattedText !== "") {
          return addTask(formattedText);
        } else {
          return null;
        }
      },
    },
    // =======================================
    // Command: !list:addSilent <text>
    // Description: adds an item to the list without effecting list visibility
    // =======================================
    ":addSilent": {
      security: (context: ChatUserstate, _textContent: string) => {
        return defaultSecurityCheck(context);
      },
      handle: (context: ChatUserstate, textContent: string) => {
        const formattedText = formatText(textContent, context.emotes).split(
          `${config.commandNameBase}:addSilent `
        )[1];
        if (formattedText && formattedText !== "") {
          return addTask(formattedText, true);
        } else {
          return null;
        }
      },
    },
    // =======================================
    // Command: !list:complete <itemNumber>
    // Description: completes an item in the list using its 1-based index
    // =======================================
    ":complete": {
      security: (context: ChatUserstate, _textContent: string) => {
        return defaultSecurityCheck(context);
      },
      handle: (_context: ChatUserstate, command: string) => {
        const itemNumber = parseInt(
          command.split(`${config.commandNameBase}:complete `)[1]
        );
        if (!isNaN(itemNumber)) {
          setComplete(itemNumber);
        }
        return null;
      },
    },
    // =======================================
    // Command: !list:remove <identifier>
    // Description: removes an item in the list using its identifier (see README)
    // =======================================
    ":remove": {
      security: (context: ChatUserstate, _textContent: string) => {
        return defaultSecurityCheck(context);
      },
      handle: (context: ChatUserstate, command: string) => {
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
      security: (context: ChatUserstate, _textContent: string) => {
        return defaultSecurityCheck(context);
      },
      handle: (context: ChatUserstate, command: string) => {
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
      security: (context: ChatUserstate, _textContent: string) => {
        return defaultSecurityCheck(context);
      },
      handle: (_context: ChatUserstate, _command: string) => {
        clearTasks();
        return null;
      },
    },
    ":empty": {
      security: (context: ChatUserstate, _textContent: string) => {
        return defaultSecurityCheck(context);
      },
      handle: (_context: ChatUserstate, _command: string) => {
        clearTasks();
        return null;
      },
    },
  };

  const createList = (title: string) => {
    deleteOverlay();
    setTitle(title);
    if (!active) {
      maybePlaySound(config.sounds.activate);
    }
    setActive(true);
  };

  const updateTitle = (text: string) => {
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

  const addTask = (text: string, silent = false): string | null => {
    let response = null;
    let added = false;
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
        added = false;
        return items;
      } else {
        if (silent) {
          response = "item silently added";
        }
        added = true;
        return [...items, { text: text, complete: false }];
      }
    });
    if (!silent) {
      setActive(true);
      if (active) {
        if (added) {
          maybePlaySound(config.sounds.newItem);
        }
      } else {
        maybePlaySound(config.sounds.activate);
      }
    }
    return response;
  };

  const setComplete = (itemNumber: number) => {
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

  const updateItem = (newText: string, itemNumber: number) => {
    setItems((items) => {
      if (typeof items[itemNumber - 1] !== "undefined") {
        return [
          ...items.slice(0, itemNumber - 1),
          { ...items[itemNumber - 1], text: newText },
          ...items.slice(itemNumber),
        ];
      }
      return items;
    });
  };

  const removeTask = (
    identifier: string,
    forceIndex = false,
    skipDebounce = false
  ) => {
    let response = "";
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
      if (method === "index" && removalPausedRef.current && !skipDebounce) {
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

  const onMessage = (
    target: string,
    context: ChatUserstate,
    msg: string,
    _self: boolean
  ) => {
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
      if (response && response !== "") {
        console.log(`@${context.username} — ${response}`);
        client.say(target, `@${context.username} — ${response}`).catch(() => {
          console.log("Couldn't send response messages");
        });
      }
    }
  };

  // Register our event handlers
  client.on("message", onMessage);
  client.on("connected", (addr: string, port: number) => {
    setConnected(true);
    console.log(`* Connected to ${addr}:${port}`);
  });
  client.on("disconnected", () => {
    setConnected(false);
    console.log(`* Disconnected from TMI`);
  });

  useEffect(() => {
    // Connect to Twitch:
    if (!connected) {
      client.connect();
    }
  });

  // Called when 'active' changes
  useEffect(() => {
    localStorage.setItem("overlayListActive", JSON.stringify(active));
  }, [active]);

  // Called when 'items' changes
  useEffect(() => {
    localStorage.setItem("overlayListItems", JSON.stringify(items));
  }, [items]);

  // Called when 'title' changes
  useEffect(() => {
    localStorage.setItem("overlayListTitle", JSON.stringify(title));
  }, [title]);

  useEffect(() => {
    window.addEventListener("storage", () => {
      setTitle(maybeGetFromStorage("overlayListTitle", ""));
      setItems(maybeGetFromStorage("overlayListItems", []));
      setActive(maybeGetFromStorage("overlayListActive", false));
    });
  }, []);

  const onAdminItemChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    updateItem(event.target.value, index + 1);
  };

  return (
    <div
      style={{
        backgroundColor: adminMode
          ? "#1d1c1d"
          : `rgba(${config.colors.background}, ${config.colors.backgroundOpacity})`,
        color: adminMode
          ? "#fff"
          : `rgba(${config.colors.foreground}, ${config.colors.foregroundOpacity})`,
        fontFamily: config.font.family,
        fontSize: config.font.baseSize,
        marginBottom: adminMode ? 0 : config.position.vMargin,
        marginTop: adminMode ? 0 : config.position.vMargin,
        marginLeft: adminMode ? 0 : config.position.hMargin,
        marginRight: adminMode ? 0 : config.position.hMargin,
        textAlign: config.font.textAlign as Property.TextAlign,
        padding: config.position.padding,
        width: adminMode ? "100%" : config.position.width,
      }}
      className={`overlayList__root overlayList__root--h-${
        adminMode ? "admin" : config.position.horizontal
      } overlayList__root--v-${
        adminMode ? "admin" : config.position.fillMethod
      } ${active ? " overlayList__root--active" : ""} ${
        adminMode ? " overlayList__root--active" : ""
      }`}
    >
      {/* Use dangerouslySetInnerHTML to allow emotes to work */}
      {adminMode ? (
        <div className="overlayList__adminTitle">
          <input
            type="text"
            value={title}
            onChange={(event) => {
              updateTitle(event.target.value);
            }}
          />
          <div className="overlayList__adminControls">
            <div
              className="overlayList__adminAction overlayList__adminToggle"
              onClick={() => setActive(!active)}
            >
              <img className="overlayList__adminActionIcon" src={showIcon} />
            </div>
            <div
              className="overlayList__adminAction overlayList__adminClear"
              onClick={clearTasks}
            >
              <img className="overlayList__adminActionIcon" src={clearIcon} />
            </div>
          </div>
        </div>
      ) : (
        <h1
          style={{ fontSize: config.font.titleSize }}
          dangerouslySetInnerHTML={{ __html: title }}
        />
      )}
      <ul
        className={`overlayList__list ${
          config.useListSymbols ? "overlayList__list--listSymbolsActive" : null
        }`}
        style={{
          borderTopColor: `rgba(${config.colors.foreground}, ${
            parseInt(config.colors.foregroundOpacity) / 2
          })`,
        }}
      >
        {Array.from(items).map((item, idx) => {
          return (
            <li
              key={`item_${idx}`}
              style={{
                color: `rgba(${config.colors.foreground}, ${
                  item.complete
                    ? parseInt(config.colors.foregroundOpacity) / 1.5
                    : config.colors.foregroundOpacity
                })`,
              }}
              className={
                item.complete
                  ? "overlayList__listItem overlayList__listItem--complete"
                  : "overlayList__listItem"
              }
            >
              {config.useListSymbols ? (
                <i className="overlayList__listItemSymbol">
                  {config.listSymbol}
                </i>
              ) : null}
              {/* Use dangerouslySetInnerHTML to allow emotes to work */}
              {adminMode ? (
                <input
                  className="overlayList__adminItemEdit"
                  type="text"
                  disabled={item.complete}
                  value={item.text}
                  onChange={(event) => {
                    onAdminItemChange(event, idx);
                  }}
                />
              ) : (
                <span dangerouslySetInnerHTML={{ __html: item.text }} />
              )}
              {adminMode ? (
                <div className="overlayList__adminControls">
                  <div
                    className="overlayList__adminAction overlayList__adminComplete"
                    onClick={() => {
                      setComplete(idx + 1);
                    }}
                  >
                    <img
                      className="overlayList__adminActionIcon"
                      src={completeIcon}
                    />
                  </div>
                  <div
                    className="overlayList__adminAction overlayList__adminRemove"
                    onClick={() => {
                      removeTask(`${idx + 1}`, true, true);
                    }}
                  >
                    <img
                      className="overlayList__adminActionIcon"
                      src={deleteIcon}
                    />
                  </div>
                </div>
              ) : null}
            </li>
          );
        })}
        {adminMode ? (
          <div className="overlayList__adminAdd">
            <h2>Add an item</h2>
            <InputField onAdd={addTask} />
          </div>
        ) : null}
      </ul>
    </div>
  );
};

type InputFieldProps = {
  onAdd: (text: string, silent?: boolean) => string | null;
};

const InputField: FunctionComponent<InputFieldProps> = ({ onAdd }) => {
  const [text, setText] = React.useState("");
  return (
    <div className="overlayList__adminInput">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            onAdd(text);
            setText("");
          }
        }}
      />
      <div
        style={{
          backgroundColor: `rgba(${config.colors.foreground}, ${config.colors.foregroundOpacity})`,
          color: `rgba(${config.colors.background}, ${config.colors.backgroundOpacity})`,
        }}
        className="overlayList__adminAction overlayList__adminAddButton"
        onClick={() => onAdd(text)}
      >
        <img
          className="overlayList__adminActionIcon"
          src={addIcon}
        />
      </div>
    </div>
  );
};

render(<App />, document.querySelector(".overlayList__holder"));
