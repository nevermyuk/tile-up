<template>
  <div>
    <h1>Basic</h1>
    <b-row>
      <b-col>
        <b-row align-v="baseline">
          <b-col style="font-size: 2rem">
            <b-table stacked hover :items="currentExecution"></b-table>
          </b-col>
          <div class="w-100"></div>
          <b-col style="font-size: 2rem">
            <b-table hover :items="currentSensorData"></b-table>
          </b-col>
        </b-row>
      </b-col>
      <b-col>
        <div id="canvasParent" class="w-100 h-100">
          <canvas id="map"></canvas>
        </div>
      </b-col>
    </b-row>
    <b-alert v-model="showAlert" :variant="alertVariant">
      <h4 class="alert-heading">{{ alertTitle }}</h4>
      <p>
        {{ alertMessage }}
      </p>
    </b-alert>
  </div>
</template>

<script>
export default {
  props: {
    sensorData: Object,
    canvasOrigin: Object,
    connected: Boolean,
    sequence: String,
    gameStarted: Boolean,
  },
  created() {
    window.addEventListener("unload", function () {
      sessionStorage.removeItem("mapData");
      sessionStorage.removeItem("canvasOrigin");
    });
  },
  mounted() {
    this.smallCar = new Image();
    this.smallCar.src = require("@/assets/smallcar.png");
    this.$root.$on("bv::modal::shown", (bvEvent, modalId) => {
      if (modalId === "dashboardModal") {
        this.fetchCanvasOrigin();
        this.initCanvas();
      }
    });
  },
  beforeDestroy() {
    if (this.connected) {
      //this.saveCanvasOrigin();
    }
  },
  data() {
    return {
      previous: "Nothing yet...",
      now: "Not running",
      next: "Waiting",
      renderIndex: 0,
      nextActions: "FFFF",
      currentExecution: [
        {
          previous: "Nothing yet...",
          now: "Waiting",
          next: "Waiting",
        },
      ],
      showAlert: false,
      alertVariant: "danger",
      currentSensorData: [],
      alertMessage: "",
      alertTitle: "",
      completeExecution: false,
      notAlertedYet: true,
      //Canvas stuff
      c: null,
      ctx: null,
      vueCanvas: null,
      canvasStore: null,
      colorReadyToRender: false,
      canvasTileSize: 30,
      smallCar: null,
      canvasOriginX: null,
      canvasOriginY: null,
    };
  },
  watch: {
    $props: {
      handler() {
        this.parseSensorData();
        if (this.gameStarted) {
          this.parseMovement();
        }
      },
      deep: true,
      immediate: true,
    },
  },
  methods: {
    parseSensorData() {
      const tmpStore = [];
      const latestSensorData = this.sensorData;
      const color = {
        r: "Red",
        g: "Green",
        b: "Blue",
        u: "Unknown",
      };
      const rowColor = {
        r: "danger",
        g: "success",
        b: "primary",
      };
      let dangerTrue = "";
      if (latestSensorData.ObstacleDistance < 20) {
        dangerTrue = "danger";
      }
      tmpStore.push(
        {
          type: "Speed",
          data: `${latestSensorData.SpeedLeft} rpm ⚡ ${latestSensorData.SpeedRight} rpm`,
        },
        {
          type: "Obstacle",
          data: `${latestSensorData.ObstacleDistance} cm`,
          _rowVariant: dangerTrue,
        },
        {
          type: "Color",
          data: color[latestSensorData.Color],
          _rowVariant: rowColor[latestSensorData.Color],
        }
      );
      this.currentSensorData = tmpStore;
    },
    parseMovement() {
      this.alertTitle = "Playing";
      this.alertMessage = "";
      this.alertVariant = "light";
      let currentSequence = this.sequence;
      const latestSensorData = this.sensorData;
      let executingSequence = latestSensorData.Executing;
      const currentIndex = latestSensorData.CurrentIndex;
      if (currentSequence && executingSequence) {
        if (
          executingSequence.length === currentSequence.length ||
          currentIndex >= 990
        ) {
          if (currentIndex === 990) {
            this.completeExecution = true;
            this.alertTitle = "Obstacle!";
            this.alertMessage = "Obstacle Detected within 20cm!";
            this.alertVariant = "warning";
            this.showAlert = true;
            // Ultrasonic sensor detect obstacle
          } else if (currentIndex === 998) {
            this.completeExecution = true;
            this.alertTitle = "Color!";
            this.alertMessage = "Color does not match allowable movement.";
            this.alertVariant = "danger";
            this.showAlert = true;
          } else if (currentIndex === 999) {
            // Completed
            this.completeExecution = true;
            this.alertTitle = "Success!";
            this.alertMessage = "Great job! You pass the round.";
            this.alertVariant = "success";
            this.showAlert = true;
          }
          const executingSequenceLength = executingSequence.length;
          this.previous = currentSequence.slice(0, executingSequenceLength);
          this.now = currentSequence.slice(
            executingSequenceLength,
            executingSequenceLength + 1
          );
          this.next = currentSequence.slice(executingSequenceLength + 1);
          this.currentExecution = [
            {
              previous: this.previous,
              now: this.now,
              next: this.next,
            },
          ];
        }
        if (executingSequence && this.renderIndex < executingSequence.length) {
          this.showAlert = false;
          if (currentIndex >= 990) {
            this.showAlert = true;
            if (executingSequence[0] === "X") {
              this.previous = "";
              this.now = currentSequence.slice(0, 1);
              this.next = currentSequence.slice(1);
            } else {
              this.previous = currentSequence;
              this.now = "";
              this.next = "";
            }
            this.completeExecution = true;
          } else if (executingSequence.length === 0) {
            this.previous = "Nothing yet...";
            this.now = executingSequence;
            this.move(this.now);
            this.next = currentSequence;
          } else if (executingSequence.length > 0) {
            if (executingSequence.length === currentSequence.length) {
              this.previous = currentSequence;
              this.now = "";
              this.next = "";
            }
            this.previous = currentSequence.slice(
              0,
              executingSequence.length - 1
            );
            this.now = executingSequence.slice(-1);
            this.move(this.now);
            this.next = currentSequence.slice(executingSequence.length);
          }
          this.currentExecution = [
            {
              previous: this.previous,
              now: this.now,
              next: this.next,
            },
          ];
        }
      }
    },
    initCanvas() {
      this.c = document.getElementById("map");
      this.ctx = this.c.getContext("2d");
      this.vueCanvas = this.ctx;
      this.c.style.width = "100%";
      this.c.style.height = "100%";
      this.c.width = this.c.offsetWidth;
      this.c.height = this.c.offsetHeight;
      let idt = sessionStorage.getItem("mapData") || null;
      if (idt) {
        this.getImage(idt)
          .then((successfulUrl) => {
            this.vueCanvas.drawImage(successfulUrl, 0, 0);
          })
          .catch((errorUrl) => {
            console.log(errorUrl);
          });
      } else {
        this.vueCanvas.transform(1, 0, 0, -1, 0, this.vueCanvas.height);
      }
    },
    saveCanvasOrigin() {
      let idt = this.c.toDataURL();
      sessionStorage.setItem("mapData", idt);
      sessionStorage.setItem(
        "canvasOrigin",
        JSON.stringify({
          X: this.canvasOriginX,
          Y: this.canvasOriginY,
        })
      );
    },
    fetchCanvasOrigin() {
      const canvasOrigin =
        JSON.parse(sessionStorage.getItem("canvasOrigin")) || null;
      if (canvasOrigin) {
        this.canvasOriginX = canvasOrigin.X;
        this.canvasOriginY = canvasOrigin.Y;
      } else {
        this.canvasOriginX = 100;
        this.canvasOriginY = 300;
      }
    },
    move(direction) {
      let color;
      this.renderIndex += 1;
      this.vueCanvas.beginPath();
      this.vueCanvas.rect(
        this.canvasOriginX,
        this.canvasOriginY,
        this.canvasTileSize,
        this.canvasTileSize
      );
      switch (direction) {
        case "F":
          color = "#32CD30";
          this.canvasOriginY -= 30;
          break;
        case "B":
          color = "#FF0000";
          this.canvasOriginY += 30;

          break;
        case "L":
          color = "#0047AB";
          this.canvasOriginX -= 30;

          break;
        case "R":
          color = "#0047AB";
          this.canvasOriginX += 30;
          break;
      }
      this.vueCanvas.fillStyle = color;
      this.vueCanvas.fill();
      this.vueCanvas.lineWidth = 3;
      this.vueCanvas.strokeStyle = "black";
      this.vueCanvas.stroke();
      this.vueCanvas.drawImage(
        this.smallCar,
        this.canvasOriginX,
        this.canvasOriginY
      );
    },
    moveForward() {
      this.vueCanvas.beginPath();
      this.vueCanvas.rect(
        this.canvasOriginX,
        this.canvasOriginY,
        this.canvasTileSize,
        this.canvasTileSize
      );
      this.vueCanvas.fillStyle = "#32CD30";
      this.vueCanvas.fill();
      this.vueCanvas.lineWidth = 3;
      this.vueCanvas.strokeStyle = "black";
      this.vueCanvas.stroke();
      this.canvasOriginY -= 30;
      this.vueCanvas.drawImage(
        this.smallCar,
        this.canvasOriginX,
        this.canvasOriginY
      );
    },
    moveBack() {
      this.vueCanvas.beginPath();
      this.vueCanvas.rect(
        this.canvasOriginX,
        this.canvasOriginY,
        this.canvasTileSize,
        this.canvasTileSize
      );
      this.vueCanvas.fillStyle = "#FF0000";
      this.vueCanvas.fill();
      this.vueCanvas.lineWidth = 3;
      this.vueCanvas.strokeStyle = "black";
      this.vueCanvas.stroke();
      this.canvasOriginY += 30;
      this.vueCanvas.drawImage(
        this.smallCar,
        this.canvasOriginX,
        this.canvasOriginY
      );
    },
    moveLeft() {
      this.vueCanvas.beginPath();
      this.vueCanvas.rect(
        this.canvasOriginX,
        this.canvasOriginY,
        this.canvasTileSize,
        this.canvasTileSize
      );
      this.vueCanvas.fillStyle = "#0047AB";
      this.vueCanvas.fill();
      this.vueCanvas.lineWidth = 3;
      this.vueCanvas.strokeStyle = "black";
      this.vueCanvas.stroke();
      this.canvasOriginX -= 30;
      this.vueCanvas.drawImage(
        this.smallCar,
        this.canvasOriginX,
        this.canvasOriginY
      );
    },
    moveRight() {
      this.vueCanvas.beginPath();
      this.vueCanvas.rect(
        this.canvasOriginX,
        this.canvasOriginY,
        this.canvasTileSize,
        this.canvasTileSize
      );
      this.vueCanvas.fillStyle = "#0047AB";
      this.vueCanvas.fill();
      this.vueCanvas.lineWidth = 3;
      this.vueCanvas.strokeStyle = "black";
      this.vueCanvas.stroke();
      this.canvasOriginX += 30;
      this.vueCanvas.drawImage(
        this.smallCar,
        this.canvasOriginX,
        this.canvasOriginY
      );
    },

    getImage(url) {
      return new Promise(function (resolve, reject) {
        var img = new Image();
        img.onload = function () {
          resolve(img);
        };
        img.onerror = function () {
          reject(url);
        };
        img.src = url;
      });
    },
  },
};
</script>

<style scoped>
canvas {
  border: 1px solid black;
  margin: auto;
}
</style>
