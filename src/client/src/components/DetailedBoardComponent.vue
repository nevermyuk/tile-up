<template>
  <div>
    <h1>Detailed</h1>
    <b-container>
      <b-row>
        <b-col>
          <!-- Panel div start -->
          <div class="panel panel-primary">
            <div class="panel-heading text-center">
              <h3 class="panel-title">Color Intensity</h3>
            </div>
            <div class="panel-body">
              <!-- Chart container -->
              <div id="chart_container">
                <div id="cy_axis" class="y_axis"></div>
                <div class="demo_chart" ref="colorpanel"></div>
              </div>
              <!-- End of chart container -->
            </div>
            <div class="panel-footer">
              <p v-if="displayedColorValues.length > 0">
                <small>
                  <span v-bind:style="{ color: dvColors.Red }"
                    >Red: {{ displayedColorValues[0].Red }}
                  </span>

                  <span v-bind:style="{ color: dvColors.Green }">
                    Green: {{ displayedColorValues[0].Green }}
                  </span>

                  <span v-bind:style="{ color: dvColors.Blue }">
                    Blue: {{ displayedColorValues[0].Blue }}
                  </span>
                </small>
              </p>
            </div>
          </div>
          <!-- Panel div end --></b-col
        >
        <b-col>
          <!-- Panel div start -->
          <div class="panel panel-primary">
            <div class="panel-heading text-center">
              <h3 class="panel-title">Obstacle Distance</h3>
            </div>
            <div class="panel-body">
              <!-- Chart container -->
              <div id="chart_container">
                <div id="oy_axis" class="y_axis"></div>
                <div class="demo_chart" ref="obstaclepanel"></div>
              </div>
              <!-- End of chart container -->
            </div>
            <div class="panel-footer">
              <p v-if="displayedObstacleValues.length > 0">
                <small>
                  <span v-bind:style="{ color: dvColors.Obstacle }"
                    >Distance:
                    {{ displayedObstacleValues[0].ObstacleDistance }} cm
                  </span>
                </small>
              </p>
            </div>
          </div>
          <!-- Panel div end --></b-col
        >
        <div class="w-100"></div>
        <b-col
          ><!-- Panel div start -->
          <div class="panel panel-primary">
            <div class="panel-heading text-center">
              <h3 class="panel-title">Speed</h3>
            </div>
            <div class="panel-body">
              <!-- Chart container -->
              <div id="chart_container">
                <div id="sy_axis" class="y_axis"></div>
                <div class="demo_chart" ref="speedpanel"></div>
              </div>
              <!-- End of chart container -->
            </div>
            <div class="panel-footer">
              <p v-if="displayedSpeedValues.length > 0">
                <small>
                  <span v-bind:style="{ color: dvColors.SpeedLeft }"
                    >Left: {{ displayedSpeedValues[0].SpeedLeft }} RPM
                  </span>

                  <span v-bind:style="{ color: dvColors.SpeedRight }">
                    Right: {{ displayedSpeedValues[0].SpeedRight }} RPM
                  </span>
                </small>
              </p>
            </div>
          </div>
          <!-- Panel div end --></b-col
        >
        <b-col></b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>
import Rickshaw from "rickshaw";
import "rickshaw/rickshaw.min.css";

let colorChart;
let obstacleChart;
let speedChart;

export default {
  props: {
    sensorData: Object,
  },
  data() {
    return {
      //graph stuff,
      colorSeries: [],
      obstacleSeries: [],
      speedSeries: [],
      chartReadyToRender: false,
      renderEveryNth: 1,
      updateInterval: 1,
      streamFrequency: 1,
      messageIndex: 0,
      displayedColorValues: [],
      displayedObstacleValues: [],
      displayedSpeedValues: [],
      dvColors: {
        Red: "#cb503a",
        Green: "#72c039",
        Blue: "#0047AB",
        Obstacle: "5C5553",
        SpeedLeft: "#cb503a",
        SpeedRight: "#72c039",
      },
    };
  },
  watch: {
    $props: {
      handler() {
        this.parseSensorData();
        this.updateChartDisplayedValue();

        this.updateChart();
      },
      deep: true,
      immediate: true,
    },
  },
  mounted() {
    this.initChart();
  },
  methods: {
    /* Rickshaw.js initialization */
    updateDisplayedValues() {
      this.updateDisplayedColorValues();
      this.updateDisplayedObstacleValues();
      this.updateDisplayedSpeedValues();
    },
    parseSensorData() {
      // const dataType = {
      //   O: "ObstacleDistance",
      //   R: "Red",
      //   G: "Green",
      //   B: "Blue",
      //   C: "Color",
      //   SL: "SpeedLeft",
      //   SR: "SpeedRight",
      // };
      let tmpData = {};
      for (let k in this.sensorData) {
        tmpData[k] = this.sensorData[k];
      }
      this.colorSeries.push({
        Red: tmpData.Red,
        Green: tmpData.Green,
        Blue: tmpData.Blue,
      });
      this.obstacleSeries.push({
        ObstacleDistance: tmpData.ObstacleDistance,
      });
      this.speedSeries.push({
        SpeedLeft: tmpData.SpeedLeft,
        SpeedRight: tmpData.SpeedRight,
      });
    },

    initChart() {
      colorChart = new Rickshaw.Graph({
        element: this.$refs.colorpanel,
        width: "500",
        height: "300",
        renderer: "line",
        min: -10,
        max: 100,
        series: new Rickshaw.Series.FixedDuration(
          [
            {
              name: "Red",
              color: "#EC644B",
            },
            {
              name: "Blue",
              color: "#446CB3",
            },
            {
              name: "Green",
              color: "#44B355",
            },
          ],
          undefined,
          {
            timeInterval: this.updateInterval,
            maxDataPoints: 100,
            timeBase: new Date().getTime() / 1000,
          }
        ),
      });
      new Rickshaw.Graph.Axis.Y({
        graph: colorChart,
        orientation: "left",
        tickFormat: function (y) {
          return y.toFixed(1);
        },
        ticks: 5,
        element: document.getElementById("cy_axis"),
      });

      obstacleChart = new Rickshaw.Graph({
        element: this.$refs.obstaclepanel,
        width: "500",
        height: "300",
        renderer: "line",
        min: -10,
        max: 200,
        series: new Rickshaw.Series.FixedDuration(
          [
            {
              name: "ObstacleDistance",
              color: "#EC644B",
            },
          ],
          undefined,
          {
            timeInterval: this.updateInterval,
            maxDataPoints: 100,
            timeBase: new Date().getTime() / 1000,
          }
        ),
      });
      new Rickshaw.Graph.Axis.Y({
        graph: obstacleChart,
        orientation: "left",
        tickFormat: function (y) {
          return y.toFixed(1);
        },
        ticks: 5,
        element: document.getElementById("oy_axis"),
      });
      speedChart = new Rickshaw.Graph({
        element: this.$refs.speedpanel,
        width: "500",
        height: "300",
        renderer: "line",
        min: -10,
        max: 200,
        series: new Rickshaw.Series.FixedDuration(
          [
            {
              name: "SpeedLeft",
              color: "#EC644B",
            },
            {
              name: "SpeedRight",
              color: "#446CB3",
            },
          ],
          undefined,
          {
            timeInterval: this.updateInterval,
            maxDataPoints: 100,
            timeBase: new Date().getTime() / 1000,
          }
        ),
      });
      new Rickshaw.Graph.Axis.Y({
        graph: speedChart,
        orientation: "left",
        tickFormat: function (y) {
          return y.toFixed(1);
        },
        ticks: 5,
        element: document.getElementById("sy_axis"),
      });
      this.resizeChart(colorChart);
      this.resizeChart(obstacleChart);
      this.resizeChart(speedChart);

      window.addEventListener("resize", () => {
        this.resizeChart(colorChart);
        this.resizeChart(obstacleChart);
        this.resizeChart(speedChart);
      });
      this.chartReadyToRender = true;
    },
    resizeChart(chart) {
      if (this.$refs.colorpanel.clientWidth) {
        chart.configure({
          width: this.$refs.colorpanel.clientWidth,
        });
      }
      chart.render();
    },
    updateChart() {
      /* Render-time! */
      if (this.chartReadyToRender) {
        this.insertDatapoints(this.colorSeries, colorChart);
        this.insertDatapoints(this.obstacleSeries, obstacleChart);
        this.insertDatapoints(this.speedSeries, speedChart);
        this.colorSeries = [];
        this.obstacleSeries = [];
        this.speedSeries = [];
      }
    },
    /* Insert received datapoints into the chart */
    insertDatapoints(messages, chart) {
      for (let i = 0; i < messages.length; i++) {
        const data = {};
        for (const k in messages[i]) {
          data[k] = messages[i][k];
        }
        chart.series.addData(data);
      }
      chart.render();
    },
    updateChartDisplayedValue() {
      if (this.messageIndex == this.streamFrequency) {
        this.messageIndex = 0;
      } else if (this.messageIndex == 0) {
        this.messageIndex++;
      } else {
        this.messageIndex++;
      }
      this.displayedColorValues = this.colorSeries;
      this.displayedObstacleValues = this.obstacleSeries;
      this.displayedSpeedValues = this.speedSeries;
    },
  },
};
</script>

<style scoped>
#chart_container {
  position: relative;
}

.y_axis {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 40px;
}

.demo_chart {
  position: relative;
  left: 40px;
}
</style>
