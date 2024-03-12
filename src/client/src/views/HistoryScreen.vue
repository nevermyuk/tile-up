<template>
  <div>
    <b-modal
      size="xl"
      ref="history-modal"
      :hide-header-close="true"
      hide-footer
    >
      <div class="d-block text-center">
        <h1 class="display-1">History</h1>
        <p>F: Forward B: Backward R: Right L: Left</p>
        <div v-if="noHistory">
          <b-alert show variant="warning">
            <h4 class="alert-heading">No History found</h4>
            <hr />
            <p>
              Seems like an instruction has not been send before. Please try
              again after Sending to car.
            </p>
          </b-alert>
        </div>
        <b-table hover :items="items"></b-table>
      </div>
      <div class="text-center">
        <b-button class="mt-3" variant="outline-danger" block @click="hideModal"
          >Close Me</b-button
        >
      </div>
    </b-modal>
  </div>
</template>

<script>
import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en.json";
TimeAgo.addDefaultLocale(en);
const timeAgo = new TimeAgo("en-SG");

export default {
  data() {
    return {
      items: [],
      noHistory: true,
    };
  },
  methods: {
    showModal() {
      this.fetchHistory();
      this.$refs["history-modal"].show();
    },
    hideModal() {
      this.$refs["history-modal"].hide();
    },
    fetchHistory() {
      let history = sessionStorage.getItem("history");
      if (history !== null) {
        this.noHistory = false;
        const tmpHist = [];
        history = JSON.parse(history);
        history
          .slice()
          .reverse()
          .forEach(function (item) {
            tmpHist.push({
              time_sent: timeAgo.format(new Date(item.now)),
              sequence: item.sequence,
            });
          });
        this.items = tmpHist;
      } else {
        this.noHistory = true;
      }
    },
  },
};
</script>
