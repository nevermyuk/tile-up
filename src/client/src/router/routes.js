//import Home from "../views/Home.vue";
import CreateScreen from "../views/CreateScreen.vue";
import LoginScreen from "../views/LoginScreen.vue";
import ProgramScreen from "../views/ProgramScreen.vue";
import NotFound from "../views/NotFound.vue";
import axios from "axios";
import { localhost } from "@/config/config.js";

function guardRoute(to, from, next) {
  let isAuthenticated = false;
  if (sessionStorage.getItem("token")) {
    isAuthenticated = true;
  }

  if (isAuthenticated) {
    next();
  } else {
    next("/login");
  }
}

function checkLoginStatus(to, from, next) {
  let isAuthenticated = false;
  if (sessionStorage.getItem("token")) {
    isAuthenticated = true;
  }
  if (isAuthenticated) {
    next("/play");
  } else {
    next();
  }
}

function checkAUserExist(to, from, next) {
  axios
    .get(`${localhost}/user/exist`)
    .then(() => {
      next("/login");
    })
    .catch(() => {
      next("/create");
    });
}

const routes = [
  {
    path: "/",
    beforeEnter: checkAUserExist,
  },
  {
    path: "/create",
    name: "create",
    component: CreateScreen,
    meta: { title: "Sign Up" },
  },
  {
    path: "/login",
    name: "login",
    beforeEnter: checkLoginStatus,
    component: LoginScreen,
    meta: { title: "Log In" },
  },
  {
    path: "/play",
    name: "Program",
    beforeEnter: guardRoute,
    component: ProgramScreen,
    meta: { title: "Play" },
  },
  { path: "*", component: NotFound },
];

export default routes;
