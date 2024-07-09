export class Logger {
  constructor(level = "warn") {
    this.level = level;
    this.levels = {
      none: 0,
      error: 1,
      warn: 2,
      info: 3,
      debug: 4,
    };
    this.timers = {}; // For storing timer data
  }

  getCallerInfo() {
    const e = new Error();
    const stack = e.stack.split("\n")[4]; // Adjust this number as needed
    // Match the pattern to find the correct line
    const match = stack.match(/at (.*?) \((.*?):(\d+):(\d+)\)/) || stack.match(/at (.*?):(\d+):(\d+)/);
    if (match) {
      return `${match[1]}`;
    }
    return "Unknown location";
  }

  log(level, ...args) {
    if (this.levels[this.level] >= this.levels[level]) {
      console.log(`${level.toUpperCase()}: ${this.getCallerInfo()}:`, ...args);
    }
  }

  setLevel(level) {
    if (this.levels[level] !== undefined) {
      this.level = level;
    }
  }

  debug(...args) {
    this.log("debug", ...args);
  }

  info(...args) {
    this.log("info", ...args);
  }

  warn(...args) {
    this.log("warn", ...args);
  }

  error(...args) {
    this.log("error", ...args);
  }

  time(label) {
    if (this.levels[this.level] >= this.levels["info"]) {
      this.timers[label] = Date.now();
    }
  }

  timeEnd(label) {
    if (this.levels[this.level] >= this.levels["info"] && this.timers[label] !== undefined) {
      const timeTaken = Date.now() - this.timers[label];
      console.info(`INFO: ${label}: ${timeTaken}ms`);
      delete this.timers[label];
    }
  }
}
