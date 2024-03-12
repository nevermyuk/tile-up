const customEventEmitter = require("../event-emitter/CustomEventEmitter");

class ProgramService {
  sensorData = {};
  connected = false;

  constructor(sequence) {
    this.sequence = sequence;
    this.initListener();
  }

  initListener() {
    customEventEmitter.getEventEmitter().on("DATA", ({ sensorData }) => {
      this.sensorData = sensorData;
    });
    customEventEmitter.getEventEmitter().on("CONNECTED", ({ connected }) => {
      this.connected = connected;
    });
  }

  async sendSequence(sequence) {
    if (this.connected) {
      customEventEmitter
        .getEventEmitter()
        .emit("SEQUENCE", { sequenceData: sequence });
      return {
        message: `${sequence} Sequence successfully send`,
        success: true,
      };
    } else {
      return {
        message: "Car is not connected. Unable to send",
        success: false,
      };
    }
  }

  async getSensorData() {
    if (this.connected) {
      return {
        message: {
          sensorData: this.sensorData,
        },
        success: true,
      };
    } else {
      return {
        message: "Car is not connected. Unable to receive data",
        success: false,
      };
    }
  }
}

module.exports = new ProgramService();
