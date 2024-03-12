const { BaseController } = require("./BaseController");
const programService = require("../services/ProgramService");
const { Token } = require("../services/TokenService");

class ProgramController extends BaseController {
  constructor() {
    super();
  }
  path = "/program";
  routes = [
    {
      path: "/sendSequence",
      method: "POST",
      handler: this.handleSendSequence,
      localMiddleware: [Token.verify],
    },
    {
      path: "/sensorData",
      method: "GET",
      handler: this.handleGetSensorData,
      localMiddleware: [Token.verify],
    },
  ];

  async handleSendSequence(req, res, next) {
    try {
      const sequence = req.body.sequence;
      const result = await programService.sendSequence(sequence);
      if (result.success) {
        super.sendSuccess(res, result.message);
      } else {
        super.sendError(res, result.message);
      }
    } catch (e) {
      super.sendError(res);
    }
  }

  async handleGetSensorData(req, res, next) {
    try {
      const sequence = req.body.sequence;
      const result = await programService.getSensorData(sequence);
      if (result.success) {
        super.sendSuccess(res, result.message);
      } else {
        super.sendError(res, result.message);
      }
    } catch (e) {
      super.sendError(res);
    }
  }
}

module.exports = { ProgramController };
