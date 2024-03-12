const { BaseController } = require("./BaseController");
const UserService = require("../services/UserService");
const { Token } = require("../services/TokenService");

class UserController extends BaseController {
  constructor() {
    super();
  }
  path = "/user";
  routes = [
    {
      path: "/exist",
      method: "GET",
      handler: this.handleExist,
      localMiddleware: [],
    },
    {
      path: "/create",
      method: "POST",
      handler: this.handleCreate,
      localMiddleware: [],
    },
    {
      path: "/login",
      method: "POST",
      handler: this.handleLogin,
      localMiddleware: [],
    },
    {
      path: "/reset",
      method: "POST",
      handler: this.handleResetPIN,
      localMiddleware: [Token.verify],
    },
  ];

  async handleLogin(req, res, next) {
    const { PIN } = req.body;
    const data = await UserService.login(PIN);
    if (data.success) {
      super.sendSuccess(res, { token: data.token }, data.message);
    } else {
      if (data.lockUntil) {
        super.sendError(res, { lockUntil: data.lockUntil }, data.message);
      } else {
        super.sendError(res, data.message);
      }
    }
  }
  async handleExist(req, res, next) {
    const data = await UserService.checkAUserExist();
    if (data) {
      super.sendSuccess(res, { userExists: "true" }, "A user exists");
    } else {
      super.sendError(res, "User does not exist.");
    }
  }
  async handleCreate(req, res, next) {
    const { choosePIN, confirmPIN } = req.body;
    const data = await UserService.createUser(choosePIN, confirmPIN);
    if (data.success) {
      super.sendSuccess(res, { success: data.success }, data.message);
    } else {
      super.sendError(res, data.message);
    }
  }
  async handleResetPIN(req, res, next) {
    const { PIN, choosePIN, confirmPIN } = req.body;
    const data = await UserService.resetPIN(PIN, choosePIN, confirmPIN);
    if (data.success) {
      super.sendSuccess(res, { success: data.success }, data.message);
    } else {
      super.sendError(res, data.message);
    }
  }
}

module.exports = { UserController };
