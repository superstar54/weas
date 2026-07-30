const KEY = "bond:popover";
const MAX_BOND_LENGTH = 5;

export class BondPopover {
  constructor(viewer) {
    this.viewer = viewer;
    this.hud = viewer.tjs.hud;
    this.bondManager = viewer.bondManager;
    this.el = null;
    this._searchInput = null;
    this._listEl = null;
    this._rowEls = [];
    this._createOverlay();
    this._registerKeybind();
  }

  _createOverlay() {
    const el = document.createElement("div");
    el.style.display = "none";
    el.style.width = "400px";
    el.style.maxHeight = "440px";
    el.style.overflow = "hidden";
    el.style.flexDirection = "column";
    el.style.backgroundColor = "rgba(24, 26, 32, 0.95)";
    el.style.border = "1px solid rgba(255, 255, 255, 0.08)";
    el.style.borderRadius = "10px";
    el.style.backdropFilter = "blur(10px)";
    el.style.boxShadow = "0 8px 32px rgba(0, 0, 0, 0.4)";
    el.style.padding = "0";
    el.style.boxSizing = "border-box";
    el.style.pointerEvents = "auto";
    el.style.color = "rgba(255, 255, 255, 0.9)";
    el.style.fontFamily =
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    el.style.fontSize = "12px";

    const header = document.createElement("div");
    header.style.display = "flex";
    header.style.justifyContent = "space-between";
    header.style.alignItems = "center";
    header.style.padding = "10px 14px 8px";
    header.style.fontWeight = "600";
    header.style.fontSize = "13px";
    header.style.letterSpacing = "0.01em";
    header.textContent = "Bond Lengths";

    const refreshBtn = document.createElement("button");
    refreshBtn.textContent = "\u21BB";
    refreshBtn.title = "Refresh";
    refreshBtn.style.background = "none";
    refreshBtn.style.border = "none";
    refreshBtn.style.color = "rgba(255, 255, 255, 0.35)";
    refreshBtn.style.cursor = "pointer";
    refreshBtn.style.fontSize = "16px";
    refreshBtn.style.padding = "0 4px";
    refreshBtn.style.lineHeight = "1";
    refreshBtn.style.borderRadius = "4px";
    refreshBtn.style.marginLeft = "auto";
    refreshBtn.style.marginRight = "6px";
    refreshBtn.style.transition = "color 0.15s";
    refreshBtn.onmouseenter = () => {
      refreshBtn.style.color = "rgba(255, 255, 255, 0.8)";
    };
    refreshBtn.onmouseleave = () => {
      refreshBtn.style.color = "rgba(255, 255, 255, 0.35)";
    };
    refreshBtn.onclick = () => this.refresh();
    header.appendChild(refreshBtn);

    const closeBtn = document.createElement("button");
    closeBtn.textContent = "✕";
    closeBtn.style.background = "none";
    closeBtn.style.border = "none";
    closeBtn.style.color = "rgba(255, 255, 255, 0.35)";
    closeBtn.style.cursor = "pointer";
    closeBtn.style.fontSize = "15px";
    closeBtn.style.padding = "0 4px";
    closeBtn.style.lineHeight = "1";
    closeBtn.style.borderRadius = "4px";
    closeBtn.style.transition = "color 0.15s";
    closeBtn.onmouseenter = () => {
      closeBtn.style.color = "rgba(255, 255, 255, 0.8)";
    };
    closeBtn.onmouseleave = () => {
      closeBtn.style.color = "rgba(255, 255, 255, 0.35)";
    };
    closeBtn.onclick = () => this.hide();
    header.appendChild(closeBtn);
    el.appendChild(header);

    const searchInput = document.createElement("input");
    searchInput.type = "text";
    searchInput.placeholder = "Filter pairs...";
    searchInput.style.display = "block";
    searchInput.style.width = "calc(100% - 28px)";
    searchInput.style.margin = "0 14px 8px";
    searchInput.style.padding = "6px 10px";
    searchInput.style.boxSizing = "border-box";
    searchInput.style.border = "1px solid rgba(255, 255, 255, 0.08)";
    searchInput.style.borderRadius = "6px";
    searchInput.style.background = "rgba(255, 255, 255, 0.05)";
    searchInput.style.color = "rgba(255, 255, 255, 0.85)";
    searchInput.style.outline = "none";
    searchInput.style.fontSize = "12px";
    searchInput.style.fontFamily = "inherit";
    searchInput.style.transition = "border-color 0.15s";
    searchInput.onfocus = () => {
      searchInput.style.borderColor = "rgba(76, 201, 240, 0.4)";
    };
    searchInput.onblur = () => {
      searchInput.style.borderColor = "rgba(255, 255, 255, 0.08)";
    };
    searchInput.addEventListener("input", () => this._filter());
    el.appendChild(searchInput);
    this._searchInput = searchInput;

    const scrollEl = document.createElement("div");
    scrollEl.style.overflowY = "auto";
    scrollEl.style.maxHeight = "340px";
    scrollEl.style.padding = "0 14px 8px";

    const table = document.createElement("div");
    table.style.display = "table";
    table.style.width = "100%";
    table.style.borderCollapse = "collapse";

    const headerRow = document.createElement("div");
    headerRow.style.display = "table-row";
    headerRow.style.fontSize = "10px";
    headerRow.style.fontWeight = "600";
    headerRow.style.color = "rgba(255, 255, 255, 0.35)";
    headerRow.style.textTransform = "uppercase";
    headerRow.style.letterSpacing = "0.06em";

    const makeHeaderCell = (text, width) => {
      const cell = document.createElement("div");
      cell.style.display = "table-cell";
      cell.style.padding = "2px 6px 4px";
      cell.style.width = width;
      cell.style.whiteSpace = "nowrap";
      cell.textContent = text;
      return cell;
    };

    headerRow.appendChild(makeHeaderCell("Pair", "92px"));
    headerRow.appendChild(makeHeaderCell("Min (\u00C5)", "92px"));
    headerRow.appendChild(makeHeaderCell("Max (\u00C5)", "92px"));
    headerRow.appendChild(makeHeaderCell("", "28px"));
    table.appendChild(headerRow);
    scrollEl.appendChild(table);
    this._listEl = table;

    el.appendChild(scrollEl);

    const stopPropagation = (e) => e.stopPropagation();
    ["click", "keydown", "keyup", "keypress"].forEach((eventType) => {
      el.addEventListener(eventType, stopPropagation, false);
    });
    el.addEventListener("keydown", (e) => {
      if (e.key === "Escape") this.hide();
    });

    this.el = el;
    this.hud.addHTMLPanel(KEY, el, {
      anchor: "top-right",
      offset: { x: 1, y: 8 },
      visible: false,
    });
  }

  _buildRows() {
    while (this._listEl.children.length > 1) {
      this._listEl.removeChild(this._listEl.lastChild);
    }
    this._rowEls = [];
    const pairs = this.bondManager.getAllBondLengths();
    pairs.forEach((setting) => {
      const row = this._createRow(setting);
      this._listEl.appendChild(row);
      this._rowEls.push(row);
    });
  }

  _createRow(setting) {
    const row = document.createElement("div");
    row.dataset.key = setting.specie1 + "-" + setting.specie2;
    row.style.display = "table-row";
    row.style.transition = "background 0.1s";
    row.onmouseenter = () => {
      row.style.background = "rgba(255,255,255,0.03)";
    };
    row.onmouseleave = () => {
      row.style.background = "";
    };

    const label = document.createElement("div");
    label.style.display = "table-cell";
    label.style.padding = "3px 6px";
    label.style.verticalAlign = "middle";
    label.style.fontSize = "12px";
    label.style.fontWeight = "500";
    label.style.color = "rgba(255, 255, 255, 0.8)";
    label.style.whiteSpace = "nowrap";
    label.textContent = setting.specie1 + "\u2013" + setting.specie2;
    row.appendChild(label);

    const makeInputCell = (key, value) => {
      const cell = document.createElement("div");
      cell.style.display = "table-cell";
      cell.style.padding = "2px 4px";
      cell.style.verticalAlign = "middle";

      const inp = document.createElement("input");
      inp.type = "number";
      inp.value = Math.round(value * 100) / 100 || 0;
      inp.step = "0.01";
      inp.min = "0";
      inp.max = String(MAX_BOND_LENGTH);
      inp.style.width = "100%";
      inp.style.boxSizing = "border-box";
      inp.style.padding = "3px 6px";
      inp.style.border = "1px solid rgba(255, 255, 255, 0.08)";
      inp.style.borderRadius = "5px";
      inp.style.background = "rgba(255, 255, 255, 0.04)";
      inp.style.color = "rgba(255, 255, 255, 0.85)";
      inp.style.outline = "none";
      inp.style.fontSize = "12px";
      inp.style.fontFamily =
        "ui-monospace, 'SF Mono', 'Cascadia Code', 'Consolas', monospace";
      inp.style.transition = "border-color 0.15s, background 0.15s";
      inp.onfocus = () => {
        inp.style.borderColor = "rgba(76, 201, 240, 0.4)";
        inp.style.background = "rgba(76, 201, 240, 0.06)";
      };
      inp.onblur = () => {
        inp.style.borderColor = "rgba(255, 255, 255, 0.08)";
        inp.style.background = "rgba(255, 255, 255, 0.04)";
      };
      inp.addEventListener("input", () => {
        const val = Math.min(
          Math.max(parseFloat(inp.value) || 0, 0),
          MAX_BOND_LENGTH,
        );
        inp.value = Math.round(val * 100) / 100 || 0;
        const update = {};
        update[key] = val;
        this.bondManager.setBondLength(
          setting.specie1,
          setting.specie2,
          update,
        );
        this.viewer.requestRedraw?.("full");
      });
      cell.appendChild(inp);
      return cell;
    };

    row.appendChild(makeInputCell("min", setting.min));
    row.appendChild(makeInputCell("max", setting.max));

    const resetCell = document.createElement("div");
    resetCell.style.display = "table-cell";
    resetCell.style.padding = "2px 0 2px 4px";
    resetCell.style.verticalAlign = "middle";
    resetCell.style.width = "28px";

    const resetBtn = document.createElement("button");
    resetBtn.textContent = "\u21BA";
    resetBtn.title = "Reset to default";
    resetBtn.style.display = "flex";
    resetBtn.style.alignItems = "center";
    resetBtn.style.justifyContent = "center";
    resetBtn.style.width = "24px";
    resetBtn.style.height = "24px";
    resetBtn.style.background = "none";
    resetBtn.style.border = "1px solid rgba(255, 255, 255, 0.08)";
    resetBtn.style.borderRadius = "5px";
    resetBtn.style.color = "rgba(255, 255, 255, 0.3)";
    resetBtn.style.cursor = "pointer";
    resetBtn.style.padding = "0";
    resetBtn.style.fontSize = "14px";
    resetBtn.style.lineHeight = "1";
    resetBtn.style.transition = "all 0.15s";
    resetBtn.onmouseenter = () => {
      resetBtn.style.color = "rgba(255, 255, 255, 0.8)";
      resetBtn.style.borderColor = "rgba(255, 255, 255, 0.2)";
      resetBtn.style.background = "rgba(255, 255, 255, 0.06)";
    };
    resetBtn.onmouseleave = () => {
      resetBtn.style.color = "rgba(255, 255, 255, 0.3)";
      resetBtn.style.borderColor = "rgba(255, 255, 255, 0.08)";
      resetBtn.style.background = "none";
    };
    resetBtn.onclick = () => {
      this.bondManager.resetBondLength(
        setting.specie1,
        setting.specie2,
      );
      const def = this.bondManager.getBondLength(
        setting.specie1,
        setting.specie2,
      );
      if (def) {
        const inputs = row.querySelectorAll("input");
        if (inputs[0]) inputs[0].value = Math.round(def.min * 100) / 100 || 0;
        if (inputs[1]) inputs[1].value = Math.round(def.max * 100) / 100 || 0;
      }
      this.viewer.requestRedraw?.("full");
    };
    resetCell.appendChild(resetBtn);
    row.appendChild(resetCell);

    return row;
  }

  _filter() {
    const q = (this._searchInput.value || "").toLowerCase();
    this._rowEls.forEach((row) => {
      const key = row.dataset.key || "";
      row.style.display =
        !q || key.toLowerCase().includes(q) ? "table-row" : "none";
    });
  }

  refresh() {
    this._buildRows();
    this._filter();
  }

  show() {
    this.refresh();
    this.hud.setHTMLPanelVisible(KEY, true);
  }

  hide() {
    this.hud.setHTMLPanelVisible(KEY, false);
  }

  toggle() {
    const panel = this.hud.htmlElements.get(KEY);
    if (panel && panel.visible) {
      this.hide();
    } else {
      this.show();
    }
  }

  _registerKeybind() {
    const km = this.viewer.weas.keybindManager;
    if (!km) return;
    km.register("bondPopover", () => this.toggle(), [["b"]]);
  }
}
