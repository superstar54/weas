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

  setLevel(level) {
    if (this.levels[level] !== undefined) {
      this.level = level;
    }
  }

  debug(...args) {
    if (this.levels[this.level] >= this.levels["debug"]) {
      console.log("DEBUG:", ...args);
    }
  }

  info(...args) {
    if (this.levels[this.level] >= this.levels["info"]) {
      console.info("INFO:", ...args);
    }
  }

  warn(...args) {
    if (this.levels[this.level] >= this.levels["warn"]) {
      console.warn("WARN:", ...args);
    }
  }

  error(...args) {
    if (this.levels[this.level] >= this.levels["error"]) {
      console.error("ERROR:", ...args);
    }
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
