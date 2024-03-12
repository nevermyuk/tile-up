const { EventEmitter } = require("events");

class CustomEventEmitter {
  eventEmitter;

  constructor() {
    this.eventEmitter = new EventEmitter();
    this.initialize();
  }

  getEventEmitter() {
    return this.eventEmitter;
  }

  initialize() {
    this.eventEmitter.on("DATA_RECEIVED", ({ data }) => {});
  }
}

module.exports = new CustomEventEmitter();
