const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const customEventEmitter = require("./event-emitter/CustomEventEmitter");
const { UserController } = require("./controllers/UserController");
const { ProgramController } = require("./controllers/ProgramController");

const controllers = [new UserController(), new ProgramController()];
const path = __dirname + "/views/";

module.exports = class Server {
  app = express();
  server;

  constructor(mongoUri, PORT) {
    this.initDB(mongoUri);
    this.initExpressMiddleWare();
    this.initControllers();
    this.initEventListener();
    this.start(PORT);
  }

  initDB(mongoUri) {
    mongoose
      .connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      .then(() => console.log("MongoDB database Connected..."))
      .catch((err) => console.log(err));
  }
  initExpressMiddleWare() {
    this.app.use(express.static(path));
    this.app.use(cors());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(express.json());
  }
  initControllers() {
    this.app.get("/", function (req, res) {
      res.sendFile(path + "index.html");
    });
    controllers.forEach((controller) => {
      this.app.use(controller.path, controller.setRoutes());
    });
  }
  start(PORT) {
    this.server = this.app.listen(PORT, () => {
      console.log(`App listening at http://localhost:${PORT}`);
    });
  }
  close() {
    this.server.close();
  }
  initEventListener() {
    // customEventEmitter.getEventEmitter().on("DATA", ({ sensorData }) => {
    //   console.log(sensorData);
    // });
  }
};
