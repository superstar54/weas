const COMBO_SEPARATOR = "+";

function formatCombo(combo) {
  return combo
    .map((key) => {
      if (key === "ctrl") return "Ctrl";
      if (key === "shift") return "Shift";
      if (key === "alt") return "Alt";
      if (key === "meta") return "Meta";
      return key.charAt(0).toUpperCase() + key.slice(1);
    })
    .join(COMBO_SEPARATOR);
}

function style(el, styles) {
  Object.assign(el.style, styles);
}

class KeybindHUD {
  constructor(keybindManager, hud) {
    this._km = keybindManager;
    this._hud = hud;
    this._visible = false;

    this._build();
    this._registerToggle();
  }

  _build() {
    this._container = document.createElement("div");
    style(this._container, {
      position: "relative",
      fontFamily: "sans-serif",
      fontSize: "13px",
      color: "#ccc",
      userSelect: "none",
      pointerEvents: "auto",
    });

    this._badge = document.createElement("div");
    style(this._badge, {
      width: "28px",
      height: "28px",
      borderRadius: "50%",
      background: "rgba(30,30,40,0.75)",
      border: "1px solid rgba(255,255,255,0.35)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      fontSize: "15px",
      fontWeight: "700",
      lineHeight: "1",
      color: "#eee",
      transition: "background 0.15s",
    });
    this._badge.textContent = "?";
    this._badge.addEventListener("mouseenter", () => {
      this._badge.style.background = "rgba(60,60,80,0.85)";
    });
    this._badge.addEventListener("mouseleave", () => {
      this._badge.style.background = "rgba(30,30,40,0.75)";
    });
    this._badge.addEventListener("click", (e) => {
      e.stopPropagation();
      this.toggle();
    });

    this._panel = document.createElement("div");
    style(this._panel, {
      position: "absolute",
      top: "32px",
      right: "0",
      background: "rgba(20,20,28,0.92)",
      border: "1px solid rgba(255,255,255,0.15)",
      borderRadius: "6px",
      padding: "8px 12px",
      minWidth: "200px",
      display: "none",
      backdropFilter: "blur(6px)",
      pointerEvents: "auto",
    });

    const header = document.createElement("div");
    style(header, {
      fontSize: "11px",
      fontWeight: "600",
      textTransform: "uppercase",
      letterSpacing: "0.5px",
      color: "rgba(255,255,255,0.6)",
      marginBottom: "6px",
      paddingBottom: "4px",
      borderBottom: "1px solid rgba(255,255,255,0.15)",
    });
    header.textContent = "Keybinds";
    this._panel.appendChild(header);

    const actions = this._km
      .listActions()
      .filter((a) => a.combos && a.combos.length > 0);
    actions.sort((a, b) => a.name.localeCompare(b.name));

    for (const action of actions) {
      const row = document.createElement("div");
      style(row, {
        display: "flex",
        justifyContent: "space-between",
        gap: "16px",
        padding: "2px 0",
        lineHeight: "1.6",
      });

      const nameEl = document.createElement("span");
      nameEl.textContent = this._friendlyName(action.name);
      style(nameEl, { color: "rgba(255,255,255,0.85)" });

      const comboEl = document.createElement("span");
      comboEl.textContent = action.combos.map(formatCombo).join(", ");
      style(comboEl, {
        color: "rgba(255,255,255,0.55)",
        fontFamily: "monospace",
        fontSize: "12px",
        textAlign: "right",
        whiteSpace: "nowrap",
      });

      row.appendChild(nameEl);
      row.appendChild(comboEl);
      this._panel.appendChild(row);
    }

    if (actions.length === 0) {
      const empty = document.createElement("div");
      empty.textContent = "No keybinds registered";
      style(empty, { color: "rgba(255,255,255,0.3)", fontStyle: "italic" });
      this._panel.appendChild(empty);
    }

    this._container.appendChild(this._badge);
    this._container.appendChild(this._panel);

    this._hud.addHTMLPanel("keybinds", this._container, {
      anchor: "top-right",
      offset: { x: 25, y: 0 },
    });
  }

  _friendlyName(name) {
    return (
      name
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (s) => s.toUpperCase())
        .trim() || name
    );
  }

  _registerToggle() {
    this._km.register("toggleKeybinds", () => this.toggle(), [["?"]]);
    this._clickOutside = (e) => {
      if (this._visible && !this._container.contains(e.target)) {
        this.hide();
      }
    };
    document.addEventListener("click", this._clickOutside);
  }

  toggle() {
    this._visible = !this._visible;
    this._panel.style.display = this._visible ? "block" : "none";
  }

  show() {
    this._visible = true;
    this._panel.style.display = "block";
  }

  hide() {
    this._visible = false;
    this._panel.style.display = "none";
  }

  destroy() {
    this._km.unregister("toggleKeybinds");
    document.removeEventListener("click", this._clickOutside);
  }
}

export { KeybindHUD };
