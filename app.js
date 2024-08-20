import express from "express";
import hbs from "hbs";
import mongoose from "mongoose";
import validator from "validator";
import xss from "xss";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import bcrypt from "bcrypt";
import { TimedCache } from "./lib/TimedCache.mjs";
dotenv.config();

const app = express();

const userCache = new TimedCache();
hbs.registerHelper("createStringRecords", (obj) => {
  if (Object.keys(obj).length === 0) {
    return new Handlebars.SafeString("<p>Нет рекордов</p>");
  }
  let result = "";
  Object.keys(obj).forEach((key) => {
    result += `<li>${hbs.Utils.escapeExpression(
      key
    )}:${hbs.Utils.escapeExpression(obj[key])}</li>`;
  });
  return new hbs.SafeString(`<ul class = "records__list">${result}</ul>`);
});

app.set("views", "./public/views");
app.set("view engine", "hbs");

const port = process.env.PORT || 3000;

app.use(express.static("public"));
app.use(express.json());
app.use(cookieParser());

const MONGODB_URI = process.env.MONGODB_URI;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const Schema = mongoose.Schema;

const userScheme = new Schema(
  {
    nick: {
      type: String,
      required: [true, "Требуется ник"],
      unique: [true, "Ник занят"],
      minlength: [4, "Ник должен быть не менее 4 символов"],
      maxlength: [12, "Ник должен быть не более 12 символов"],
      match: [
        /^[A-Za-zА-Яа-яёЁ\-_]+$/,
        "Разрешены только символы латиницы, кириллицы, знаки дефиса и нижнего подчеркивания.",
      ],
    },

    password: {
      type: String,
      required: [true, "Требуется пароль"],
      minlength: 60,
      maxlength: 60,
    },
    records: {
      20: {
        type: Number,
        default: 0,
      },
      40: {
        type: Number,
        default: 0,
      },
      60: {
        type: Number,
        default: 0,
      },
    },
  },
  { versionKey: false }
);

const User = mongoose.model("User", userScheme, "users");
(async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    app.listen(port, () => console.log("Сервер запущен"));
  } catch (err) {
    return console.error(err);
  }
})();

userScheme.pre("save", function (next) {
  if (this.isNew || !this.records) {
    this.records = {
      20: 0,
      40: 0,
      60: 0,
    };
  }
  next();
});

const obj = {
  cleanLogin: "adasdad",
  password: 1622225235252,
  records: { 20: 111, 40: 412414, 60: 4124214214 },
};

async function registration(req, res) {
  try {
    const newData = clearData(req.body);
    const { nick, password, records } = newData;
    if (!nick || !password) {
      return res.json({
        success: false,
        message: { error: "Введите данные." },
      });
    }
    if (String(password.length) < 8) {
      return res.json({
        success: false,
        message: { password: "Пароль должен быть не менее 8 символов" },
      });
    } else if (String(password.length) > 15) {
      return res.json({
        success: false,
        message: { password: "Пароль должен быть не более 15 символов" },
      });
    }

    const hash = await bcrypt.hash(password, 10);
    const user = new User({ nick: nick, password: hash, records: records });
    await user.save();
    const token = jwt.sign({ login: nick }, PRIVATE_KEY);
    res.cookie("authcookie", token, {
      maxAge: 7200000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });
    return res.json({ success: true });
  } catch (e) {
    if (e.code === 11000) {
      console.error("Ник уже занят");
      res.json({ success: false, message: { nick: "Ник уже занят" } });
    } else if (e.name === "ValidationError") {
      let fullError = {};
      for (let field in e.errors) {
        console.error(e.errors[field].message);
        fullError[e.errors[field].path] = e.errors[field].message;
      }

      return res.json({ success: false, message: fullError });
    } else {
      console.error("Ошибка при сохранении", e);
      res.json({ success: false, message: { error: "Ошибка при сохранении" } });
    }
  }
}

app.get("/reg", joinedAccount, (req, res) => {
  res.render("reg", { layout: false, title: "Регистрация" });
});

app.post("/reg", registration);

function clearData(data) {
  try {
    const { cleanLogin: nick, password } = data;

    let sanitizedNick = validator.escape(nick);
    sanitizedNick = xss(sanitizedNick);
    return { nick: sanitizedNick, password: String(password) };
  } catch (e) {
    console.error("Ошибка", e);
    return false;
  }
}

app.get("/auth", joinedAccount, (req, res) => {
  res.render("auth", { layout: false, title: "Авторизация" });
});

app.post("/auth", getUserFromDB, auth);

async function auth(req, res) {
  try {
    const user = req.body.user;
    if (!user)
      return res.json({
        success: false,
        message: { error: "Неверно введен логин или пароль" },
      });
    const result = await bcrypt.compare(req.body.password, user.password);
    if (!result)
      return res.json({
        success: false,
        message: { error: "Неверно введен логин или пароль" },
      });
    const token = jwt.sign({ login: req.body.login }, PRIVATE_KEY);
    res.cookie("authcookie", token, {
      maxAge: 7200000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });
    return res.json({ success: true });
  } catch (error) {
    console.error(error);
    return res.json({ success: false, message: { error: "Ошибка." } });
  }
}

function checkToken(req, res, next) {
  const authcookie = req.cookies.authcookie;
  jwt.verify(authcookie, PRIVATE_KEY, (err, data) => {
    if (err) {
      return res.render("reg", { layout: false, title: "Регистрация" });
    } else if (data.login) {
      req.body.login = data.login;
      next();
    }
  });
}

function joinedAccount(req, res, next) {
  try {
    const authcookie = req.cookies.authcookie;
    jwt.verify(authcookie, PRIVATE_KEY, (err, data) => {
      if (err) {
        next();
      } else if (data.login) {
        req.body.login = data.login;
        res.render("index", { layout: false, title: "Играть" });
      }
    });
  } catch (error) {
    return console.error(error);
  }
}

app.get("/index", checkToken, (req, res) => {
  res.render("index", { layout: false, title: "Играть" });
});

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

app.post("/set-records", checkToken, getUserFromDB, async (req, res) => {
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
});

async function getUserFromDB(req, res, next) {
  const nick = req.body.login;

  const haveUser = userCache.get(nick);
  if (haveUser) {
    req.body.user = haveUser;
    return next();
  }

  try {
    const user = await User.findOne({
      nick: nick,
    }).lean();
    if (user) {
      const userInfo = {
        _id: user._id,
        nick: user.nick,
        records: user.records,
      };
      userCache.set(user.nick, userInfo, 7200000);
      userCache.set(nick, user, 7200000);
      req.body.user = user;
      next();
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: { error: "Ошибка при получении данных" },
    });
  }
}

app.get("/clear-cookie", checkToken, (req, res) => {
  try {
    res.cookie("authcookie", 0, { maxAge: 0, httpOnly: true });
    userCache.delete(req.body.login);
    if (scores[req.body.login]) {
      delete scores[req.body.login];
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Ошибка при очистке куки и удалении из кэша:", error);
    res.status(500).json({
      success: false,
      message: "Ошибка при очистке куки и удалении из кэша.",
    });
  }
});
app.get("/get-scores", checkToken, getUserFromDB, viewRecords);

app.get("/records", checkToken, getUserFromDB, (req, res) => {
  const user = req.body.user;
  res.render("records", {
    layout: false,
    title: "Рекорды",
    records: user.records,
  });
});

const scores = {};
app.post("/update-score", checkToken, (req, res) => {
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
});

app.use("/", (req, res) => {
  res.render("404", { layout: false, title: "Не найдено" });
});
