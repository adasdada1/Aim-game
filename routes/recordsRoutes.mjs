import express from "express";
import  { viewRecords, setRecords, updateScore } from "../controllers/recordsControllers.mjs"
import { checkToken } from "../controllers/authControllers.mjs";
import { getUserFromDB } from "../controllers/userController.mjs";

const router = express.Router();

router.post("/set-records", checkToken, getUserFromDB, setRecords);

router.get("/get-scores", checkToken, getUserFromDB, viewRecords);

router.get("/records", checkToken, getUserFromDB, (req, res) => {
  const user = req.body.user;
  res.render("records", {
    layout: false,
    title: "Рекорды",
    records: user.records,
  });
});

router.post("/update-score", checkToken, updateScore);

export {router}