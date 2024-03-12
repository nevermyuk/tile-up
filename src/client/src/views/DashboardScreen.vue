<template>
  <div>
    <b-modal
      id="dashboardModal"
      size="xl"
      ref="dashboard-modal"
      :hide-header-close="true"
      hide-footer
    >
      <div class="d-block text-center">
        <h1 class="display-3">Dashboard</h1>
      </div>

      <BasicBoardComponent
        v-show="currentBoardComponent === 'BasicBoardComponent'"
        v-bind:sensorData="newSensorData"
        v-bind:connected="connected"
        v-bind:sequence="sequence"
        v-bind:gameStarted="gameStarted"
        ref="basicboard"
        class="board"
      >
      </BasicBoardComponent>
      <DetailedBoardComponent
        v-show="currentBoardComponent === 'DetailedBoardComponent'"
        v-bind:sensorData="newSensorData"
        v-bind:connected="connected"
        class="board"
      >
      </DetailedBoardComponent>

      <div class="text-center">
        <b-container>
          <b-row>
            <b-col>
              <b-button class="mt-3" variant="primary" v-on:click="toggleBoard">
                View {{ currentButtonText }}
              </b-button>
            </b-col>
            <b-col>
              <b-button class="mt-3" variant="danger" block @click="hideModal"
                >Close Me</b-button
              ></b-col
            >
          </b-row>
        </b-container>
      </div>
    </b-modal>
    <b-modal ref="error-modal" hide-footer :title.sync="alertTitle">
      <div class="d-block text-center">
        <p>
          {{ alertMessage }}
        </p>
        <b-button
          class="mt-3"
          variant="outline-danger"
          block
          @click="hideErrorModal"
          >Close Me</b-button
        >
      </div>
    </b-modal>
  </div>
</template>

<script>
import { localhost } from "@/config/config.js";
import axios from "axios";

import BasicBoardComponent from "@/components/BasicBoardComponent.vue";
import DetailedBoardComponent from "@/components/DetailedBoardComponent.vue";

export default {
  props: {
    sequence: String,
    gameStarted: Boolean,
  },
  components: {
    BasicBoardComponent,
    DetailedBoardComponent,
  },
  data() {
    return {
      connected: false,
      alertMessage: "Something went wrong",
      alertTitle: "Watch out!",
      currentBoardView: "Basic",
      currentButtonText: "Detailed",
      BoardViews: ["Basic", "Detailed"],
      currentExecution: [
        {
          executing: "Left",
          next: "FFFLRFF",
        },
      ],
      currentSensorData: [],
      newSensorData: {},
      interval: null,
      c: null,
      ctx: null,
    };
  },
  computed: {
    currentBoardComponent: function () {
      return this.currentBoardView + "BoardComponent";
    },
  },
  methods: {
    toggleBoard: function () {
      if (this.currentBoardView === "Basic") {
        this.currentBoardView = "Detailed";
        this.currentButtonText = "Basic";
      } else {
        this.currentBoardView = "Basic";
        this.currentButtonText = "Detailed";
      }
    },
    showModal() {
      this.getSensorData();
      this.$refs["dashboard-modal"].show();
      this.interval = setInterval(this.getSensorData, 100);
    },
    hideModal() {
      const carStatus = this.newSensorData.Status;
      if (carStatus === "W") {
        this.$refs["dashboard-modal"].hide();
        this.currentBoardView = "Basic";
        this.currentButtonText = "Detailed";
        clearInterval(this.interval);
        this.interval = null;
        this.$emit("updateGameStarted", false);
      } else {
        this.alertTitle = "Not done yet.";
        this.alertMessage = "Please wait until the car has finished execution.";
        this.showErrorModal();
      }
    },

    showErrorModal() {
      this.$refs["error-modal"].show();
    },
    hideErrorModal() {
      this.$refs["error-modal"].hide();
    },

    getSensorData() {
      const token = sessionStorage.getItem("token");
      axios.defaults.headers.common["x-access-token"] = token;
      axios
        .get(`${localhost}/program/sensorData`)
        .then((response) => {
          this.connected = true;
          const sensorData = response.data.data.sensorData;
          const dataType = {
            O: "ObstacleDistance",
            R: "Red",
            G: "Green",
            B: "Blue",
            C: "Color",
            SL: "SpeedLeft",
            SR: "SpeedRight",
            CI: "CurrentIndex",
            E: "Executing",
            M: "Status",
          };
          let tmpData = {};
          for (let k in sensorData) {
            tmpData[dataType[k]] = sensorData[k];
          }
          tmpData.time = Date.now();
          this.newSensorData = tmpData;
        })
        .catch((error) => {
          this.connected = false;
          this.alertTitle = "Error";
          this.alertMessage = error.response.data.message;
          this.hideModal();
          this.showErrorModal();
        });
    },
  },
};
</script>
<style scoped>
#chart_container {
  padding: 10px;
  margin-top: 10px;
  position: relative;
}

#cy_axis {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 40px;
}

#oy_axis {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 40px;
}

#sy_axis {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 40px;
}

.footy {
  position: relative;
  width: 100%;
  margin-top: 50px;
  height: 60px;
  opacity: 0.2;
}

.glyphicon {
  color: #8e44ad;
  font-weight: bold;
}

canvas {
  border: 1px solid black;
  margin: auto;
  flex-grow: 100;
}

#canvasParent {
  display: flex;
}

#canvasChild {
  flex-grow: 1;
}

.modal-fullscreen .modal-dialog {
  max-width: 100%;
  margin: 0;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100vh;
  display: flex;
  position: fixed;
  z-index: 100000;
}
</style>
