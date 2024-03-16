export class BaseOperation {
  constructor(weas) {
    this.weas = weas;
  }

  execute() {
    throw new Error("Method 'execute()' must be implemented.");
  }

  undo() {
    throw new Error("Method 'undo()' must be implemented.");
  }

  redo() {
    this.execute();
  }

  adjust(params) {
    throw new Error("Method 'adjust()' must be implemented.");
  }
}

export function renameFolder(folder, newName) {
  // dat.GUI stores the name of the folder in the DOM, inside an element with class 'title'
  const folderTitleElement = folder.domElement.querySelector(".title");
  if (folderTitleElement) {
    folderTitleElement.textContent = newName;
  }
}
