const customEventEmitter = require("./event-emitter/CustomEventEmitter");

let net = require("net");

module.exports = class TCPServer {
  sequenceObject = { ready: false, data: "" };
  constructor(hostname, port) {
    this.server = net.createServer();
    this.initListener();
    this.initServer(hostname, port, this.sequenceObject);
  }
  get receivedData() {
    return this._receivedData;
  }

  set dataRead(n) {
    return (this.dataRead = n);
  }

  initListener() {
    customEventEmitter.getEventEmitter().on("SEQUENCE", ({ sequenceData }) => {
      this.sequenceObject.ready = true;
      this.sequenceObject.data = sequenceData;
    });
  }

  initServer(hostname, port, sequenceObject) {
    let server = this.server;
    //emitted when server closes ...not emitted until all connections closes.
    this.server.on("close", function () {
      console.log("Server closed !");
    });

    // emitted when new client connects
    this.server.on("connection", function (socket) {
      //this property shows the number of characters currently buffered to be written. (Number of characters is approximately equal to the number of bytes to be written, but the buffer may contain strings, and the strings are lazily encoded, so the exact number of bytes is not known.)
      //Users who experience large or growing bufferSize should attempt to "throttle" the data flows in their program with pause() and resume().
      customEventEmitter
        .getEventEmitter()
        .emit("CONNECTED", { connected: true });
      console.log("---------server details -----------------");

      let address = server.address();
      let port = address.port;
      let ipaddr = address.address;
      // console.log("Server ip :" + ipaddr + " " + port);

      let lport = socket.localPort;
      let laddr = socket.localAddress;
      console.log(`Server is listening at ${laddr}:${lport}`);

      // console.log("------------remote client info --------------");
      // let rport = socket.remotePort;
      // let raddr = socket.remoteAddress;
      // let rfamily = socket.remoteFamily;
      // console.log("REMOTE Socket is listening at port" + rport);
      // console.log("REMOTE Socket ip :" + raddr);
      // console.log("REMOTE Socket is IP4/IP6 : " + rfamily);

      console.log("--------------------------------------------");
      server.getConnections(function (error, count) {
        console.log(
          "Number of concurrent connections to the server : " + count
        );
      });

      socket.setEncoding("utf8");

      socket.setTimeout(15000, function () {
        console.log("Socket timed out, destroying socket now");
        socket.destroy();
      });

      socket.on("data", function (data) {
        customEventEmitter
          .getEventEmitter()
          .emit("CONNECTED", { connected: true });

        let bread = socket.bytesRead;
        let bwrite = socket.bytesWritten;
        let sensorData;
        console.log("Bytes read : " + bread);
        console.log("Bytes written : " + bwrite);
        console.log("Data sent to server : " + data);
        let dataLines = data.split("\n");
        // for (let i in dataLines) {
        //   //console.log(dataLines[i], "Length: ", dataLines[i].length, "\n");
        //   if (dataLines[i] != "") {
        //     try {
        //       sensorData = JSON.parse(dataLines[i]);
        //     } catch (e) {
        //       console.log("Error in >", dataLines[i]);
        //     }
        //   }
        // }
        try {
          sensorData = JSON.parse(dataLines[dataLines.length - 2]);
        } catch (e) {
          console.log("Error in >", dataLines[dataLines.length - 2]);
        }
        if (sequenceObject.ready) {
          let is_kernel_buffer_full = socket.write(
            `${sequenceObject.data}\r\n`
          );
          if (is_kernel_buffer_full) {
            console.log(`Wrote ${sequenceObject.data} to car`);
          } else {
            socket.pause();
          }
          sequenceObject.ready = false;
          sequenceObject.data = "";
        }
        customEventEmitter
          .getEventEmitter()
          .emit("DATA", { sensorData: sensorData });

        // count++;
        // if (count % 1 == 0) {
        //   let is_kernel_buffer_full = socket.write(
        //     "This is the " + count + " transmission.!\r\n"
        //   );
        //   if (is_kernel_buffer_full) {
        //     console.log("Written successfully to car!");
        //   } else {
        //     socket.pause();
        //     // }
        //   }
        // }

        //echo data
      });

      socket.on("drain", function () {
        console.log(
          "write buffer is empty now .. u can resume the writable stream"
        );
        socket.resume();
      });

      socket.on("error", function (error) {
        console.log("Error : " + error);
      });

      socket.on("end", function (data) {
        console.log("Socket ended from other end!");
      });

      socket.on("close", function (error) {
        let bread = socket.bytesRead;
        let bwrite = socket.bytesWritten;
        console.log("Bytes read : " + bread);
        console.log("Bytes written : " + bwrite);
        console.log("Socket closed!");
        customEventEmitter
          .getEventEmitter()
          .emit("CONNECTED", { connected: false });
      });
    });

    // emits when any error occurs -> calls closed event immediately after
    server.on("error", function (error) {
      console.log("Error: " + error);
    });

    //emits when server is bound with server.listen
    server.on("listening", function () {
      console.log("Server is listening!");
    });

    server.maxConnections = 2;

    //static port allocation
    server.listen(port, () => {
      console.log(`TCP Server running at http://${hostname}:${port}/`);
    });

    // setTimeout(function () {
    //   server.close();
    // }, 5000000);
  }
};
