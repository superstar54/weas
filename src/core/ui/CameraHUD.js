import { toolbarIcons } from "./Icons";

const PANEL_KEY = "camera";
const ACCENT = "rgba(76, 201, 240, 0.7)";
const ACCENT_BG = "rgba(76, 201, 240, 0.18)";

function formatValue(v) {
  return (Math.round(v * 100) / 100).toString();
}

class CameraHUD {
  constructor(weas, hud) {
    this.weas = weas;
    this.hud = hud;
    this.controller = weas.tjs.cameraController;

    this.el = null;
    this._bodyEl = null;
    this._savedViewsEl = null;
    this._collapseBtn = null;
    this._viewButtons = new Map();
    this._controls = {};
    this._collapsed = false;

    this._build();
    this._registerKeybind();
    this._addToolbarButton();

    this._unsubChange = this.controller?.onChange?.(() =>
      this._refreshSavedViews(),
    );
  }

  _build() {
    const el = document.createElement("div");
    el.style.display = "none";
    el.style.width = "248px";
    el.style.flexDirection = "column";
    el.style.backgroundColor = "rgba(24, 26, 32, 0.95)";
    el.style.border = "1px solid rgba(255, 255, 255, 0.08)";
    el.style.borderRadius = "10px";
    el.style.backdropFilter = "blur(10px)";
    el.style.boxShadow = "0 8px 32px rgba(0, 0, 0, 0.4)";
    el.style.boxSizing = "border-box";
    el.style.pointerEvents = "auto";
    el.style.color = "rgba(255, 255, 255, 0.9)";
    el.style.fontFamily =
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    el.style.fontSize = "12px";
    el.style.overflow = "hidden";
    this.el = el;

    const header = document.createElement("div");
    header.style.display = "flex";
    header.style.alignItems = "center";
    header.style.padding = "10px 10px 8px 14px";
    header.style.gap = "4px";

    const title = document.createElement("div");
    title.textContent = "Camera";
    title.style.fontWeight = "600";
    title.style.fontSize = "13px";
    title.style.letterSpacing = "0.01em";
    title.style.marginRight = "auto";
    header.appendChild(title);

    this._collapseBtn = this._makeHeaderBtn("\u25BE", "Collapse");
    this._collapseBtn.onclick = () => this._toggleCollapse();
    header.appendChild(this._collapseBtn);

    const closeBtn = this._makeHeaderBtn("\u2715", "Close");
    closeBtn.onclick = () => this.hide();
    header.appendChild(closeBtn);

    el.appendChild(header);

    const body = document.createElement("div");
    body.style.display = "flex";
    body.style.flexDirection = "column";
    body.style.gap = "2px";
    body.style.padding = "0 14px 12px";
    this._bodyEl = body;
    el.appendChild(body);

    body.appendChild(this._makeSectionHeading("Views"));
    body.appendChild(this._buildViewsGrid());

    body.appendChild(this._makeSectionHeading("Saved Views"));

    const savedViews = document.createElement("div");
    savedViews.style.display = "flex";
    savedViews.style.flexDirection = "column";
    savedViews.style.gap = "3px";
    this._savedViewsEl = savedViews;
    body.appendChild(savedViews);

    const saveBtn = this._makeGhostButton("+ Save Current View");
    saveBtn.onclick = () => this._saveCurrentView();
    body.appendChild(saveBtn);

    body.appendChild(this._makeSectionHeading("Controls"));

    this._buildControls(body);

    this.hud.addHTMLPanel(PANEL_KEY, el, {
      anchor: "center-right",
      offset: { x: 1, y: 0 },
      visible: false,
    });

    ["click", "pointerdown", "pointerup", "keydown", "keyup", "keypress"].forEach(
      (eventType) => {
        el.addEventListener(eventType, (e) => e.stopPropagation(), false);
      },
    );
    el.addEventListener("keydown", (e) => {
      if (e.key === "Escape") this.hide();
    });
  }

  _makeHeaderBtn(text, title) {
    const btn = document.createElement("button");
    btn.textContent = text;
    btn.title = title;
    Object.assign(btn.style, {
      background: "none",
      border: "none",
      color: "rgba(255, 255, 255, 0.4)",
      cursor: "pointer",
      fontSize: "13px",
      padding: "0 4px",
      lineHeight: "1",
      borderRadius: "4px",
      transition: "color 0.15s",
    });
    btn.onmouseenter = () => {
      btn.style.color = "rgba(255, 255, 255, 0.9)";
    };
    btn.onmouseleave = () => {
      btn.style.color = "rgba(255, 255, 255, 0.4)";
    };
    return btn;
  }

  _makeSectionHeading(text) {
    const h = document.createElement("div");
    h.textContent = text;
    Object.assign(h.style, {
      fontSize: "10px",
      fontWeight: "600",
      textTransform: "uppercase",
      letterSpacing: "0.06em",
      color: "rgba(255, 255, 255, 0.35)",
      marginTop: "10px",
      marginBottom: "3px",
    });
    return h;
  }

  _makeViewButton(label) {
    const btn = document.createElement("button");
    btn.textContent = label;
    Object.assign(btn.style, {
      padding: "6px 4px",
      border: "1px solid rgba(255, 255, 255, 0.08)",
      borderRadius: "6px",
      background: "rgba(255, 255, 255, 0.04)",
      color: "rgba(255, 255, 255, 0.8)",
      cursor: "pointer",
      fontSize: "11px",
      fontWeight: "500",
      fontFamily: "inherit",
      transition: "background 0.15s, border-color 0.15s, color 0.15s",
      textTransform: "capitalize",
      userSelect: "none",
    });
    btn.onmouseenter = () => {
      btn.style.background = "rgba(255, 255, 255, 0.09)";
    };
    btn.onmouseleave = () => {
      btn.style.background = btn.dataset.active
        ? ACCENT_BG
        : "rgba(255, 255, 255, 0.04)";
    };
    return btn;
  }

  _makeGhostButton(label) {
    const btn = document.createElement("button");
    btn.textContent = label;
    Object.assign(btn.style, {
      width: "100%",
      padding: "6px 8px",
      border: "1px solid rgba(255, 255, 255, 0.12)",
      borderRadius: "6px",
      background: "rgba(255, 255, 255, 0.04)",
      color: "rgba(255, 255, 255, 0.85)",
      cursor: "pointer",
      fontSize: "11px",
      fontWeight: "500",
      fontFamily: "inherit",
      transition: "background 0.15s, border-color 0.15s",
      userSelect: "none",
    });
    btn.onmouseenter = () => {
      btn.style.background = "rgba(255, 255, 255, 0.09)";
      btn.style.borderColor = "rgba(255, 255, 255, 0.22)";
    };
    btn.onmouseleave = () => {
      btn.style.background = "rgba(255, 255, 255, 0.04)";
      btn.style.borderColor = "rgba(255, 255, 255, 0.12)";
    };
    return btn;
  }

  _setActiveView(name) {
    this._activeView = name;
    this._viewButtons.forEach((btn, key) => {
      const active = key === name;
      btn.dataset.active = active ? "1" : "";
      btn.style.borderColor = active ? ACCENT : "rgba(255, 255, 255, 0.08)";
      btn.style.background = active ? ACCENT_BG : "rgba(255, 255, 255, 0.04)";
      btn.style.color = active ? "#ffffff" : "rgba(255, 255, 255, 0.8)";
    });
  }

  _buildViewsGrid() {
    const grid = document.createElement("div");
    grid.style.display = "grid";
    grid.style.gridTemplateColumns = "repeat(3, 1fr)";
    grid.style.gap = "4px";

    const details = this.controller.listDetails?.() || [];
    const builtInViews = details.filter((v) => v.builtIn);

    builtInViews.forEach(({ name }) => {
      const btn = this._makeViewButton(name);
      btn.onclick = () => {
        this._setActiveView(name);
        this.controller.view(name);
        this.weas.requestRedraw?.("render");
      };
      grid.appendChild(btn);
      this._viewButtons.set(name, btn);
    });

    if (builtInViews.length === 0) {
      const empty = document.createElement("div");
      empty.textContent = "No built-in views";
      empty.style.gridColumn = "span 3";
      empty.style.color = "rgba(255, 255, 255, 0.3)";
      empty.style.fontStyle = "italic";
      empty.style.padding = "4px 0";
      empty.style.textAlign = "center";
      grid.appendChild(empty);
    }

    const fitBtn = this._makeViewButton("Fit");
    fitBtn.style.gridColumn = "span 3";
    fitBtn.onclick = () => {
      this._setActiveView(null);
      this.controller.fitToScene(this.weas.tjs.scene);
      this.weas.requestRedraw?.("render");
    };
    grid.appendChild(fitBtn);

    return grid;
  }

  _refreshSavedViews() {
    if (!this._savedViewsEl) return;
    while (this._savedViewsEl.firstChild) {
      this._savedViewsEl.removeChild(this._savedViewsEl.firstChild);
    }

    const userViews = (this.controller.listDetails?.() || []).filter(
      (v) => !v.builtIn,
    );

    if (userViews.length === 0) {
      const empty = document.createElement("div");
      empty.textContent = "No saved views yet";
      empty.style.color = "rgba(255, 255, 255, 0.3)";
      empty.style.fontStyle = "italic";
      empty.style.padding = "2px 0";
      this._savedViewsEl.appendChild(empty);
      return;
    }

    userViews.forEach(({ name }) => {
      this._savedViewsEl.appendChild(this._makeSavedViewRow(name));
    });
  }

  _makeSavedViewRow(name) {
    const row = document.createElement("div");
    row.style.display = "flex";
    row.style.alignItems = "center";
    row.style.gap = "4px";

    const loadBtn = document.createElement("button");
    loadBtn.textContent = name;
    loadBtn.title = "Load view";
    Object.assign(loadBtn.style, {
      flex: "1",
      minWidth: "0",
      textAlign: "left",
      padding: "4px 8px",
      border: "1px solid rgba(255, 255, 255, 0.08)",
      borderRadius: "6px",
      background: "rgba(255, 255, 255, 0.03)",
      color: "rgba(255, 255, 255, 0.85)",
      cursor: "pointer",
      fontSize: "11px",
      fontFamily: "inherit",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
      transition: "background 0.15s, border-color 0.15s",
      userSelect: "none",
    });
    loadBtn.onmouseenter = () => {
      loadBtn.style.background = "rgba(255, 255, 255, 0.08)";
    };
    loadBtn.onmouseleave = () => {
      loadBtn.style.background = "rgba(255, 255, 255, 0.03)";
    };
    loadBtn.onclick = () => {
      this.controller.view(name);
      this.weas.requestRedraw?.("render");
    };
    row.appendChild(loadBtn);

    const delBtn = document.createElement("button");
    delBtn.textContent = "\u2715";
    delBtn.title = "Delete view";
    delBtn.style.width = "24px";
    delBtn.style.height = "24px";
    delBtn.style.display = "flex";
    delBtn.style.alignItems = "center";
    delBtn.style.justifyContent = "center";
    delBtn.style.border = "1px solid rgba(255, 255, 255, 0.08)";
    delBtn.style.borderRadius = "6px";
    delBtn.style.background = "rgba(255, 255, 255, 0.03)";
    delBtn.style.color = "rgba(255, 255, 255, 0.3)";
    delBtn.style.cursor = "pointer";
    delBtn.style.padding = "0";
    delBtn.style.fontSize = "11px";
    delBtn.style.lineHeight = "1";
    delBtn.style.transition = "all 0.15s";
    delBtn.onmouseenter = () => {
      delBtn.style.color = "rgba(255, 255, 255, 0.9)";
      delBtn.style.borderColor = "rgba(255, 255, 255, 0.2)";
      delBtn.style.background = "rgba(255, 60, 60, 0.25)";
    };
    delBtn.onmouseleave = () => {
      delBtn.style.color = "rgba(255, 255, 255, 0.3)";
      delBtn.style.borderColor = "rgba(255, 255, 255, 0.08)";
      delBtn.style.background = "rgba(255, 255, 255, 0.03)";
    };
    delBtn.onclick = () => this.controller.removeView(name);
    row.appendChild(delBtn);

    return row;
  }

  _saveCurrentView() {
    const name = prompt("Name of new camera view:");
    if (!name) return;
    this.controller.saveView(name);
  }

  _buildControls(body) {
    const schema = this.controller.paramSchema || {};
    Object.entries(schema).forEach(([key, info]) => {
      if (info.gui === false) return;
      if (info.type === "number") {
        body.appendChild(this._makeSliderRow(key, info));
      } else if (info.type === "boolean") {
        body.appendChild(this._makeToggleRow(key, info));
      }
    });

    const resetBtn = this._makeGhostButton("Reset Settings");
    resetBtn.style.marginTop = "6px";
    resetBtn.onclick = () => {
      this.controller.resetSettings();
      this._syncControls();
    };
    body.appendChild(resetBtn);
  }

  _makeSliderRow(key, info) {
    const row = document.createElement("div");
    row.style.display = "flex";
    row.style.alignItems = "center";
    row.style.gap = "8px";

    const label = document.createElement("div");
    label.textContent = info.label || key;
    label.style.flex = "1";
    label.style.color = "rgba(255, 255, 255, 0.75)";
    label.style.fontSize = "11px";
    row.appendChild(label);

    const slider = document.createElement("input");
    slider.type = "range";
    slider.min = String(info.min ?? 0);
    slider.max = String(info.max ?? 1);
    slider.step = String(info.step ?? 0.01);
    slider.value = String(this.controller[key]);
    slider.style.flex = "1";
    slider.style.accentColor = "#4cc9f0";
    row.appendChild(slider);

    const valueEl = document.createElement("div");
    valueEl.style.width = "34px";
    valueEl.style.textAlign = "right";
    valueEl.style.fontFamily =
      "ui-monospace, 'SF Mono', 'Cascadia Code', 'Consolas', monospace";
    valueEl.style.fontSize = "10px";
    valueEl.style.color = "rgba(255, 255, 255, 0.55)";
    valueEl.textContent = formatValue(this.controller[key]);
    row.appendChild(valueEl);

    slider.addEventListener("input", () => {
      const v = parseFloat(slider.value);
      valueEl.textContent = formatValue(v);
      this._applyParam(key, v);
    });

    this._controls[key] = { slider, valueEl };
    return row;
  }

  _makeToggleRow(key, info) {
    const row = document.createElement("div");
    row.style.display = "flex";
    row.style.alignItems = "center";
    row.style.gap = "8px";

    const label = document.createElement("div");
    label.textContent = info.label || key;
    label.style.flex = "1";
    label.style.color = "rgba(255, 255, 255, 0.75)";
    label.style.fontSize = "11px";
    row.appendChild(label);

    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.checked = !!this.controller[key];
    cb.style.accentColor = "#4cc9f0";
    cb.style.cursor = "pointer";
    cb.addEventListener("change", () => this._applyParam(key, cb.checked));
    row.appendChild(cb);

    this._controls[key] = { checkbox: cb };
    return row;
  }

  _applyParam(key, value) {
    this.controller[key] = value;
    this.controller.update?.();
    this.controller._emitChange?.();
  }

  _syncControls() {
    Object.entries(this._controls).forEach(([key, c]) => {
      const v = this.controller[key];
      if (c.slider) {
        c.slider.value = String(v);
        c.valueEl.textContent = formatValue(v);
      } else if (c.checkbox) {
        c.checkbox.checked = !!v;
      }
    });
  }

  _toggleCollapse() {
    this._collapsed = !this._collapsed;
    this._bodyEl.style.display = this._collapsed ? "none" : "flex";
    this._collapseBtn.textContent = this._collapsed ? "\u25B8" : "\u25BE";
    this._collapseBtn.title = this._collapsed ? "Expand" : "Collapse";
  }

  _addToolbarButton() {
    if (!this.hud?.ToolbarHUD) return;
    this.hud.ToolbarHUD.addButton("camera", {
      hint: "Toggle camera panel",
      icon: toolbarIcons.camera,
      onClick: (e) => {
        e.stopPropagation();
        this.toggle();
      },
    });
  }

  _registerKeybind() {
    const km = this.weas?.keybindManager;
    if (!km) return;
    km.register("cameraHUD", () => this.toggle(), [["v"]]);
  }

  refresh() {
    this._refreshSavedViews();
    this._syncControls();
  }

  show() {
    this.refresh();
    this.hud.setHTMLPanelVisible(PANEL_KEY, true);
  }

  hide() {
    this.hud.setHTMLPanelVisible(PANEL_KEY, false);
  }

  toggle() {
    const panel = this.hud.htmlElements.get(PANEL_KEY);
    if (panel && panel.visible) {
      this.hide();
    } else {
      this.show();
    }
  }

  destroy() {
    this._unsubChange?.();
    const km = this.weas?.keybindManager;
    km?.unregister?.("cameraHUD");
    this.hud?.ToolbarHUD?.removeButton?.("camera");
  }
}

export { CameraHUD };
