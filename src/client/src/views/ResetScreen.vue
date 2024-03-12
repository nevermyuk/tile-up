<template>
  <div>
    <b-modal ref="reset-modal" :hide-header-close="true" hide-footer>
      <div class="d-block text-center">
        <h2 class="h2 mb-3 fw-normal text-center pb-3">Reset PIN</h2>

        <form>
          <div class="text-center">
            <h3 class="h3 mb-3 fw-normal text-center">PIN</h3>
            <PincodeInput v-model="PIN" :length="4" :secure="true" />
            <h3 class="h3 mb-3 fw-normal text-center pt-3">New PIN</h3>
            <PincodeInput v-model="choosePIN" :length="4" :secure="true" />
            <h3 class="h3 mb-3 fw-normal text-center pt-3">Comfirm PIN</h3>
            <PincodeInput v-model="confirmPIN" :length="4" :secure="true" />
          </div>
          <div class="p-3 text-center">
            <b-alert variant="success" v-model="showSuccessAlert">
              {{ successAlertMessage }}
            </b-alert>
            <b-alert variant="danger" v-model="showErrorAlert">{{
              errorAlertMessage
            }}</b-alert>
          </div>
          <hr />
          <div class="p-3 text-center">
            <b-container>
              <b-row>
                <b-col>
                  <b-button
                    variant="secondary"
                    type="button"
                    class="btn btn-primary btn-lg"
                    @click="cancel"
                  >
                    Cancel
                  </b-button></b-col
                >
                <b-col>
                  <b-button
                    type="button"
                    variant="primary"
                    class="btn btn-primary btn-lg"
                    @click="resetPIN"
                  >
                    Reset
                  </b-button></b-col
                >
              </b-row>
            </b-container>
          </div>
        </form>
      </div>
    </b-modal>
    <b-modal ref="result-modal" :hide-header-close="true" hide-footer>
      <div class="d-block text-center">
        <b-alert show :variant="resultState">
          <h4 class="alert-heading" :class="resultState">{{ resultTitle }}</h4>
          <p>{{ resultMessage }}</p>
          <hr />
        </b-alert>
        <b-button
          class="mt-3"
          variant="outline-danger"
          block
          @click="hideResultModal"
          >Close Me</b-button
        >
      </div>
    </b-modal>
  </div>
</template>

<script>
import axios from "axios";
import { localhost } from "../config/config.js";

export default {
  name: "reset-screen",
  data: () => ({
    PIN: "",
    choosePIN: "",
    confirmPIN: "",
    showSuccessAlert: false,
    successAlertMessage: "Success",
    showErrorAlert: false,
    errorAlertMessage: "Something went wrong",
    resultState: "success",
    resultTitle: "Success",
    resultMessage: "PIN has been changed.",
  }),
  methods: {
    showModal() {
      this.$refs["reset-modal"].show();
    },
    hideModal() {
      this.$refs["reset-modal"].hide();
      this.hideErrorAlert();
    },
    showResultModal() {
      this.$refs["result-modal"].show();
    },
    hideResultModal() {
      this.$refs["result-modal"].hide();
    },

    displayErrorAlert() {
      this.showErrorAlert = true;
    },
    hideErrorAlert() {
      this.showErrorAlert = false;
    },
    resetField() {
      this.PIN = "";
      this.choosePIN = "";
      this.confirmPIN = "";
    },
    cancel() {
      this.hideModal();
      this.resetField();
    },
    changeResult(state, title, message) {
      if (state === true) {
        this.resultState = "success";
      } else {
        this.resultState = "danger";
      }
      this.resultTitle = title;
      this.resultMessage = message;
    },
    checkSameDigits(PIN) {
      let last_digit = PIN % 10;
      while (PIN != 0) {
        let current_digit = PIN % 10;
        PIN = parseInt(PIN / 10);
        if (current_digit != last_digit) {
          return false;
        }
      }
      return true;
    },
    resetPIN() {
      if (this.PIN === "" || this.confirmPIN === "" || this.choosePIN === "") {
        this.errorAlertMessage = "Please fill in all fields.";
        this.displayErrorAlert();
        this.resetField();
        return;
      }
      if (
        this.PIN.length != 4 ||
        this.confirmPIN.length != 4 ||
        this.choosePIN.length != 4
      ) {
        this.errorAlertMessage = "PIN must be 4 digits.";
        this.displayErrorAlert();
        this.resetField();
        return;
      }

      if (this.confirmPIN != this.choosePIN) {
        this.errorAlertMessage = "New PIN and Confirm PIN must be the same.";
        this.displayErrorAlert();
        this.resetField();
        return;
      }
      if (this.PIN === this.choosePIN) {
        this.errorAlertMessage = "New PIN and Old PIN cannot be the same.";
        this.displayErrorAlert();
        this.resetField();
        return;
      }
      if (this.checkSameDigits(this.confirmPIN)) {
        this.errorAlertMessage =
          "PIN cannot be the same digit. Please choose a stronger PIN.";
        this.displayErrorAlert();
        this.reset();
        return;
      }
      const newCreds = {
        PIN: this.PIN,
        choosePIN: this.choosePIN,
        confirmPIN: this.confirmPIN,
      };
      const token = sessionStorage.getItem("token");
      axios.defaults.headers.common["x-access-token"] = token;
      axios
        .post(`${localhost}/user/reset`, newCreds)
        .then((response) => {
          this.successAlertMessage = `${response.data.message}. Redirecting to Login in 5 seconds.`;
          this.hideModal();
          this.changeResult(true, "Success", response.data.message);
          this.showResultModal();
        })
        .catch((error) => {
          this.errorAlertMessage = error.response.data.message;
          this.hideModal();
          this.changeResult(false, "Error", error.response.data.message);
          this.showResultModal();
        });
      this.resetField();
      this.hideErrorAlert();
    },
  },
};
</script>
