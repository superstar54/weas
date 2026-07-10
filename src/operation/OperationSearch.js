import { defaultKeyBindConfig } from "../config";
import { ShapeOperation } from "./shape";

export class OperationSearchManager {
  constructor(weas, ops) {
    this.weas = weas;
    this.ops = ops;
    this.keybindConfig = this.weas.keybindConfig || {};
    this.operations = getAllOperations(ops, this.keybindConfig);
    this.overlay = this.createOverlay();
    this.bindEvents();
    this.registerKeybinds();
    this.updateSearchResults("");
  }

  createOverlay() {
    // Create the overlay div
    const overlay = document.createElement("div");
    overlay.id = "operation-search";
    overlay.className = "search-overlay";
    overlay.style.display = "none";
    // Center overlay inside the containerElement
    overlay.style.position = "absolute";
    overlay.style.top = "20%";
    overlay.style.left = "70%";
    overlay.style.width = "300px"; // Set a fixed width for the overlay
    overlay.style.height = "200px"; // Set a fixed height for the overlay
    // overlay.style.overflow = 'hidden'; // Prevent overflow

    // Create the search input
    const searchBox = document.createElement("input");
    searchBox.type = "text";
    searchBox.id = "search-box";
    searchBox.placeholder = "Search operation...";
    searchBox.addEventListener("input", (e) => this.updateSearchResults(e.target.value));

    // Create the results container
    const resultsContainer = document.createElement("ul");
    resultsContainer.id = "search-results";

    // Append children to overlay
    overlay.appendChild(searchBox);
    overlay.appendChild(resultsContainer);

    // Append overlay to the weas's container element
    this.weas.tjs.containerElement.appendChild(overlay);
    return overlay;
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
      this.keybindConfig.SearchOperation || defaultKeyBindConfig.SearchOperation || null;
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
      displayOperations = displayOperations.filter((op) => op.description && op.description.toLowerCase().includes(value.toLowerCase()));
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
      listItem.tabIndex = 0; // Makes the element focusable
      const baseLabel = `${op.category}: ${op.description}`;
      const label = labelCounts[baseLabel] > 1 ? `${baseLabel} (${op.name})` : baseLabel;
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
