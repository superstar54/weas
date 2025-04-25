export class OperationSearchManager {
  constructor(weas, ops) {
    this.weas = weas;
    // change the operations to an array
    this.operations = getAllOperations(ops);
    this.overlay = this.createOverlay();
    this.bindEvents();
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
    // Stop propagation of mouse and keyboard events from the GUI container
    // e.g., when user input "r", it will not trigger the rotate event.
    const stopPropagation = (e) => e.stopPropagation();
    ["click", "keydown", "keyup", "keypress"].forEach((eventType) => {
      this.overlay.addEventListener(eventType, stopPropagation, false);
    });
    // Bind global keydown event for showing and hiding the search
    this.weas.tjs.containerElement.addEventListener("keydown", (e) => {
      if (e.ctrlKey && e.key === "f") {
        // Ctrl+F to show
        e.preventDefault();
        this.show();
      } else if (e.key === "Escape") {
        // Escape to hide
        this.hide();
      }
    });
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
      displayOperations = displayOperations.filter((op) => op.description && op.description.toLowerCase().includes(value.toLowerCase()));
    }

    // Limit the number of operations to display to 10
    displayOperations = displayOperations.slice(0, 10);

    // Make each list item focusable and display them
    displayOperations.forEach((op) => {
      if (!op.description) return;
      const listItem = document.createElement("li");
      listItem.tabIndex = 0; // Makes the element focusable
      listItem.textContent = `${op.category}: ${op.description}`;
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
    // Placeholder for operation execution logic
    // Add execution code
    const op = new operation({ weas: this.weas });
    this.weas.ops.execute(op);
    // Hide the search overlay
    this.hide();
    // refocus on the weas container
    this.weas.tjs.containerElement.focus();
  }
}

// Function to extract all operation classes into an array
function getAllOperations(ops) {
  let operations = [];
  Object.keys(ops).forEach((category) => {
    operations = operations.concat(Object.values(ops[category]));
  });
  return operations;
}
