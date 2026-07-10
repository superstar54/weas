import { defaultKeyBindConfig } from "../config";
import { ShapeOperation } from "./shape";

export class OperationSearchManager {
  constructor(weas, ops, hud) {
    this.weas = weas;
    this.ops = ops;
    this.hud = hud;
    this.keybindConfig = this.weas.keybindConfig || {};
    this.operations = getAllOperations(ops, this.keybindConfig);
    this.overlay = this.createOverlay();
    this._addScrollbarStyles();
    this._addClickOutsideHandler();
    this.bindEvents();
    this.registerKeybinds();
    this.updateSearchResults("");
  }

  createOverlay() {
    const overlay = document.createElement("div");
    overlay.id = "operation-search";
    overlay.style.display = "none";
    overlay.style.width = "300px";
    overlay.style.maxHeight = "280px";
    overlay.style.backgroundColor = "rgba(20,20,28,0.92)";
    overlay.style.border = "1px solid rgba(255,255,255,0.12)";
    overlay.style.borderRadius = "6px";
    overlay.style.backdropFilter = "blur(6px)";
    overlay.style.WebkitBackdropFilter = "blur(6px)";
    overlay.style.padding = "6px";
    overlay.style.boxSizing = "border-box";
    overlay.style.pointerEvents = "auto";

    const searchBox = document.createElement("input");
    searchBox.type = "text";
    searchBox.id = "search-box";
    searchBox.placeholder = "Search operation...";
    searchBox.style.width = "100%";
    searchBox.style.boxSizing = "border-box";
    searchBox.style.padding = "6px 8px";
    searchBox.style.border = "1px solid rgba(255,255,255,0.15)";
    searchBox.style.borderRadius = "4px";
    searchBox.style.backgroundColor = "rgba(0,0,0,0.3)";
    searchBox.style.color = "rgba(255,255,255,0.85)";
    searchBox.style.fontSize = "13px";
    searchBox.style.outline = "none";
    searchBox.style.fontFamily = "sans-serif";
    searchBox.addEventListener("focus", () => {
      searchBox.style.borderColor = "rgba(255,255,255,0.35)";
    });
    searchBox.addEventListener("blur", () => {
      searchBox.style.borderColor = "rgba(255,255,255,0.15)";
    });
    searchBox.addEventListener("input", (e) =>
      this.updateSearchResults(e.target.value),
    );

    const resultsContainer = document.createElement("ul");
    resultsContainer.id = "search-results";
    resultsContainer.style.listStyle = "none";
    resultsContainer.style.margin = "6px 0 0 0";
    resultsContainer.style.padding = "0";
    resultsContainer.style.maxHeight = "230px";
    resultsContainer.style.overflowY = "auto";

    overlay.appendChild(searchBox);
    overlay.appendChild(resultsContainer);

    this.hud.addHTMLPanel("search", overlay, {
      anchor: "top-left",
      offset: { x: 20, y: 20 },
      visible: false,
    });
    return overlay;
  }

  _addClickOutsideHandler() {
    this._clickOutside = (e) => {
      if (
        this.overlay.style.display !== "none" &&
        !this.overlay.contains(e.target)
      ) {
        this.hide();
      }
    };
    document.addEventListener("click", this._clickOutside);
  }

  _addScrollbarStyles() {
    if (OperationSearchManager._scrollStylesAdded) return;
    OperationSearchManager._scrollStylesAdded = true;
    const style = document.createElement("style");
    style.textContent =
      "#search-box::placeholder { color: rgba(255,255,255,0.35); }" +
      "#search-box:focus { border-color: rgba(255,255,255,0.35); }" +
      "#search-results li:focus { background: rgba(255,255,255,0.12); outline: none; }" +
      "#search-results::-webkit-scrollbar { width: 5px; }" +
      "#search-results::-webkit-scrollbar-track { background: transparent; }" +
      "#search-results::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 3px; }" +
      "#search-results::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.25); }";
    document.head.appendChild(style);
  }

  bindEvents() {
    const stopPropagation = (e) => e.stopPropagation();
    ["click", "keydown", "keyup", "keypress"].forEach((eventType) => {
      this.overlay.addEventListener(eventType, stopPropagation, false);
    });

    this.overlay.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.hide();
        this.weas.tjs.containerElement.focus();
      }
    });
  }

  registerKeybinds() {
    const km = this.weas.keybindManager;
    if (!km) return;

    const searchCombos =
      this.keybindConfig.SearchOperation ||
      defaultKeyBindConfig.SearchOperation ||
      null;
    km.register("SearchOperation", () => this.show(), searchCombos);
  }

  show() {
    this.overlay.style.display = "block";
    this.overlay.querySelector("#search-box").focus();
  }

  hide() {
    this.overlay.style.display = "none";
  }

  updateSearchResults(value) {
    const resultsContainer = this.overlay.querySelector("#search-results");
    resultsContainer.innerHTML = ""; // Clear previous results

    // Determine the operations to display
    let displayOperations = this.operations;
    if (value) {
      displayOperations = displayOperations.filter(
        (op) =>
          op.description &&
          op.description.toLowerCase().includes(value.toLowerCase()),
      );
    }

    // Dynamic shapes
    const shapeMatches = this.weas.shapeRegistry
      .list()
      .filter((name) => name.toLowerCase().includes(value.toLowerCase()));

    shapeMatches.forEach((shapeName) => {
      // only add if not already present
      const exists = displayOperations.some(
        (op) => op.category === "Shapes" && op.name === shapeName,
      );
      if (!exists) {
        displayOperations.push({
          cls: ShapeOperation,
          name: shapeName,
          category: "Shapes",
          description: `Add ${shapeName}`,
        });
      }
    });

    if (value) {
      displayOperations = displayOperations.filter(
        (op) =>
          op.description &&
          op.description.toLowerCase().includes(value.toLowerCase()),
      );
    }

    // Limit the number of operations to display to 10
    displayOperations = displayOperations.slice(0, 10);

    const labelCounts = {};
    displayOperations.forEach((op) => {
      const base = `${op.category}: ${op.description}`;
      labelCounts[base] = (labelCounts[base] || 0) + 1;
    });

    // Make each list item focusable and display them
    displayOperations.forEach((op) => {
      if (!op.description) return;
      const listItem = document.createElement("li");
      listItem.tabIndex = 0;
      listItem.style.padding = "4px 8px";
      listItem.style.cursor = "pointer";
      listItem.style.borderRadius = "4px";
      listItem.style.color = "rgba(255,255,255,0.75)";
      listItem.style.fontSize = "12px";
      listItem.style.fontFamily = "sans-serif";
      listItem.style.transition = "background 0.15s";
      listItem.addEventListener("mouseenter", () => {
        listItem.style.backgroundColor = "rgba(255,255,255,0.08)";
      });
      listItem.addEventListener("mouseleave", () => {
        listItem.style.backgroundColor = "transparent";
      });
      const baseLabel = `${op.category}: ${op.description}`;
      const label =
        labelCounts[baseLabel] > 1 ? `${baseLabel} (${op.name})` : baseLabel;
      listItem.textContent = label;
      listItem.onclick = () => this.execute(op);
      listItem.onkeydown = (e) => {
        if (e.key === "Enter") {
          this.execute(op);
        }
      };
      resultsContainer.appendChild(listItem);
    });
  }

  execute(operation) {
    let opInstance;
    if (operation.category === "Shapes") {
      // Dynamic shape: pass WEAS and shapeName
      opInstance = new operation.cls(this.weas, operation.name, {});
      // opInstance.supportsAdjustGUI = () => false;
    } else {
      // Other ops: pass as { weas: this.weas } plus default params
      opInstance = new operation.cls({ weas: this.weas });
    }

    this.weas.ops.execute(opInstance);

    this.hide();
    this.weas.tjs.containerElement.focus();
  }
}

function AddKeyToDesc(descOrName, keybinds, opName) {
  let desc = descOrName || "Operation";
  const combos = keybinds[opName] || [];
  if (combos.length > 0 && combos[0].length > 0) {
    // Format first combo like "Ctrl+F"
    const firstComboStr = combos[0]
      .map((k) => k.charAt(0).toUpperCase() + k.slice(1))
      .join("+");
    desc += ` [${firstComboStr}]`;
  }

  return desc;
}

// Function to extract all operation classes into an array with keybind appended
function getAllOperations(ops, keybinds) {
  const operations = [];
  Object.keys(ops).forEach((category) => {
    Object.values(ops[category]).forEach((opClass) => {
      // Skip abstract classes
      if (opClass.abstract) return;

      const baseDesc = opClass.description || opClass.name || "Operation";
      operations.push({
        cls: opClass,
        name: opClass.name || "Operation",
        category: opClass.category || category,
        description: AddKeyToDesc(baseDesc, keybinds, opClass.name),
      });
    });
  });
  return operations;
}

// generic fuzzy matcher - should be maybe moved to fuse
function fuzzyMatch(str, query) {
  str = str.toLowerCase();
  query = query.toLowerCase();

  // exact substring match
  if (str.includes(query)) return true;

  // simple typo-tolerance: allow edit distance of 1
  let distance = 0;
  let i = 0,
    j = 0;
  while (i < str.length && j < query.length) {
    if (str[i] === query[j]) {
      i++;
      j++;
    } else {
      distance++;
      i++;
      if (distance > 1) return false;
    }
  }
  return true;
}
