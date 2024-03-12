const { HOSTNAME, TCP_PORT, PORT, mongoUri } = require("./config/config.js");

const TCPServer = require("./tcp");
const ExpressServer = require("./express-server");

/* 
Global variable to keep state of car connection
*/

const tcpserve = new TCPServer(HOSTNAME, TCP_PORT);
const serve = new ExpressServer(mongoUri, PORT);
