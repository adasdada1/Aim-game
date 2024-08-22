import express from "express";
import {
  clearCookie,
  registration,
  checkToken,
  joinedAccount,
  auth,
} from "../controllers/authControllers.mjs";
import { getUserFromDB } from "../controllers/userController.mjs";

const router = express.Router();
router.get("/reg", joinedAccount, (req, res) => {
  res.render("reg", { layout: false, title: "Регистрация" });
});

router.post("/reg", registration);

router.get("/auth", joinedAccount, (req, res) => {
  res.render("auth", { layout: false, title: "Авторизация" });
});

router.post("/auth", getUserFromDB, auth);

router.get("/index", checkToken, (req, res) => {
  res.render("index", { layout: false, title: "Играть" });
});



router.get("/clear-cookie", checkToken, clearCookie);

export { router };
