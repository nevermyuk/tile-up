<template>
  <main class="form-signup">
    <div class="card">
      <div class="card-body">
        <form>
          <h2 class="h2 mb-3 fw-normal text-center">Sign Up</h2>
          <div class="text-center">
            <h3 class="h3 mb-3 fw-normal text-center">Choose PIN</h3>
            <PincodeInput v-model="choosePIN" :length="4" :secure="true" />
            <h3 class="h3 mb-3 fw-normal text-center">Comfirm PIN</h3>
            <PincodeInput v-model="confirmPIN" :length="4" :secure="true" />
          </div>
          <div class="p-3 text-center">
            <button
              type="button"
              class="btn btn-primary btn-lg"
              @click="create"
            >
              Create
            </button>
          </div>
          <div class="p-3 text-center">
            <b-alert variant="success" v-model="showSuccessAlert">
              {{ successAlertMessage }}
            </b-alert>
            <b-alert variant="danger" v-model="showErrorAlert">{{
              errorAlertMessage
            }}</b-alert>
          </div>
        </form>
      </div>
    </div>
    <p class="mt-3 mb-3 text-muted text-center">© TileUp</p>
  </main>
</template>

<script>
import axios from "axios";
import PincodeInput from "vue-pincode-input";
import { localhost } from "../config/config.js";

export default {
  name: "CreateScreen",
  component: {
    PincodeInput,
  },
  data: () => ({
    choosePIN: "",
    confirmPIN: "",
    showSuccessAlert: false,
    successAlertMessage: "Success",
    showErrorAlert: false,
    errorAlertMessage: "Something went wrong",
  }),
  methods: {
    reset() {
      this.choosePIN = "";
      this.confirmPIN = "";
    },
    displayErrorAlert() {
      this.showErrorAlert = true;
    },
    displaySuccessAlert() {
      this.showSuccessAlert = true;
      setTimeout(() => {
        this.$router.push("/login");
      }, 5000);
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
    create() {
      if (this.confirmPIN === "" || this.choosePIN === "") {
        this.errorAlertMessage = "Please fill in both PIN.";
        this.displayErrorAlert();
        this.reset();
        return;
      }
      if (this.confirmPIN.length != 4 || this.choosePIN.length != 4) {
        this.errorAlertMessage = "PIN must be 4 digits.";
        this.displayErrorAlert();
        this.reset();
        return;
      }
      if (this.confirmPIN != this.choosePIN) {
        this.errorAlertMessage = "PIN must be the same.";
        this.displayErrorAlert();
        this.reset();
        return;
      }
      if (this.checkSameDigits(this.confirmPIN)) {
        this.errorAlertMessage =
          "PIN cannot be the same digit. Please choose a stronger PIN.";
        this.displayErrorAlert();
        this.reset();
        return;
      }
      const newUser = {
        choosePIN: this.choosePIN,
        confirmPIN: this.confirmPIN,
      };
      axios
        .post(`${localhost}/user/create`, newUser)
        .then((response) => {
          this.successAlertMessage = `${response.data.message}. Redirecting to Login in 5 seconds.`;
          this.showErrorAlert = false;
          this.displaySuccessAlert();
        })
        .catch((error) => {
          this.errorAlertMessage = error.response.data.message;
          this.displayErrorAlert();
          this.reset();
        });
    },
  },
};
</script>

<style lang="scss">
body {
  display: flex;
  padding-top: 60px;
  padding-bottom: 60px;
  align-items: center;
  background-color: #f6f6f6;
}
.form-signup {
  width: 100%;
  max-width: 450px;
  margin: auto;
}
label {
  font-weight: 600;
}
.monitor {
  margin: 30px auto;
  font-size: 18px;
  font-family: Arial, sans-serif;
  opacity: 0.6;
  &-label {
    margin-right: 4px;
  }
}
.reset-button {
  display: block;
  margin: 0 auto;
  border: none;
  border-radius: 3px;
  padding: 10px 30px;
  font-size: 18px;
  color: rgba(black, 0.8);
  transition: color 0.1s ease-in;
  &:hover,
  &:focus {
    cursor: pointer;
    color: rgba(black, 0.5);
  }
}
</style>
