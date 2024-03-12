<template>
  <main class="form-login">
    <div class="card">
      <div class="card-body">
        <form>
          <h2 class="h3 mb-3 fw-normal text-center">Log in</h2>
          <h3 class="h3 mb-3 fw-normal text-center">PIN</h3>
          <div class="text-center">
            <PincodeInput v-model="PIN" :length="4" :secure="true" />
          </div>
          <div class="text-center pt-3">
            <b-alert variant="danger" v-model="showAlert">{{
              alertMessage
            }}</b-alert>
          </div>
          <div class="p-3 text-center">
            <button type="button" class="btn btn-primary btn-lg" @click="login">
              Login
            </button>
          </div>
        </form>
      </div>
      <div>
        <b-modal
          size="xl"
          ref="barred-modal"
          :no-close-on-backdrop="true"
          :no-close-on-esc="true"
          :hide-header-close="true"
          hide-footer
          title="Barred"
        >
          <div class="d-block text-center">
            <h3>{{ barredMessage }}</h3>
            <div id="time" v-html="time"></div>
          </div>
        </b-modal>
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
  name: "LoginScreen",
  component: {
    PincodeInput,
  },
  data: () => {
    return {
      showAlert: false,
      PIN: "",
      alertMessage: "Something went wrong",
      barredMessage: "Barred from logging in, it will unlock in",
      lockUntilTime: undefined,
      interval: null,
      total: 0,
    };
  },
  computed: {
    time: function () {
      if (this.seconds < 10) {
        return this.minutes + ":" + 0 + this.seconds;
      }
      return this.minutes + ":" + this.seconds;
    },
    minutes: function () {
      const minutes = Math.floor((this.total / 1000 / 60) % 60);
      return minutes;
    },
    seconds: function () {
      const seconds = Math.floor((this.total / 1000) % 60);
      return seconds;
    },
  },
  watch: {
    PIN: function (val) {
      if (val.length === 4) {
        this.login();
      }
    },
  },
  methods: {
    login(e) {
      if (e) {
        e.preventDefault();
      }
      if (this.PIN.length != 4) {
        this.PIN = "";
        this.alertMessage = "Please input 4 digits";
        this.displayAlert();
        return;
      }
      const user = {
        PIN: this.PIN,
      };
      axios
        .post(`${localhost}/user/login`, user)
        .then((response) => {
          const token = response.data.data.token;
          axios.defaults.headers.common["x-access-token"] = token;
          sessionStorage.setItem("token", token);
          this.$router.push("/play");
        })
        .catch((error) => {
          const errorData = error.response.data;
          if ("data" in errorData) {
            const lockUntil = errorData.data.lockUntil;
            this.lockUntilTime = new Date(lockUntil);
            this.startTimer();
            this.showBarredModal();
          }
          this.alertMessage = errorData.message;
          this.PIN = "";
          if (errorData.message === "A user does not exist.") {
            this.$router.push("/create");
          }
          this.displayAlert();
        });
    },
    displayAlert() {
      this.showAlert = true;
    },
    hideAlert() {
      this.showAlert = false;
    },
    showBarredModal() {
      this.$refs["barred-modal"].show();
    },
    hideBarredModal() {
      this.$refs["barred-modal"].hide();
    },
    startTimer() {
      this.interval = setInterval(this.updateLockUntilTime, 1000);
    },
    updateLockUntilTime() {
      let now = new Date();
      this.total = this.lockUntilTime - Date.parse(now);
      if (this.total < 0) {
        clearInterval(this.interval);
        this.hideBarredModal();
        this.hideAlert();
      }
    },
  },
};
</script>

<style lang="css">
body {
  display: flex;
  padding-top: 60px;
  padding-bottom: 60px;
  align-items: center;
  background-color: #f6f6f6;
}
.form-login {
  width: 100%;
  max-width: 450px;
  margin: auto;
}
label {
  font-weight: 600;
}

#time {
  font-size: 70px;
  text-align: center;
}
</style>
