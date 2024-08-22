import { User } from "../models/User.mjs";
import { userCache } from "./userController.mjs";
async function viewRecords(req, res, next) {
  try {
    const user = req.body.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Неверно введен логин или пароль",
      });
    }

    res.json({
      records: {
        20: user.records["20"],
        40: user.records["40"],
        60: user.records["60"],
      },
    });
  } catch (error) {
    console.error("Ошибка в viewRecords:", error);
    res.status(500).json({
      success: false,
      message: "Внутренняя ошибка сервера",
    });
  }
}

async function setRecords(req, res) {
  const { user, localRecord, score, secs } = req.body;
  if (
    parseInt(user.records[secs]) === parseInt(localRecord) &&
    parseInt(score) > parseInt(localRecord)
  ) {
    const newUser = await User.findByIdAndUpdate(
      user._id,
      { [`records.${secs}`]: score },
      { new: true }
    );
    const userInfo = {
      _id: newUser._id,
      nick: newUser.nick,
      records: newUser.records,
    };
    userCache.set(user.nick, userInfo, 7200000);
    res.json({ success: true });
  }
}

const scores = {};
function updateScore(req, res) {
  const userLogin = req.body.login;
  const { action } = req.body;

  if (action === "hit") {
    scores[userLogin] = (scores[userLogin] || 0) + 1;
    res.json({ score: scores[userLogin] });
  } else if (action === "reset") {
    if (!scores[userLogin]) {
      return res.json({ score: 0 });
    }
    const oldScore = scores[userLogin];
    delete scores[userLogin];
    return res.json({ score: oldScore });
  } else {
    res.status(400).json({ error: "Неверное действие" });
  }
}

export { viewRecords, setRecords, updateScore, scores };
