import validator from "validator";
import xss from "xss";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { User } from "../models/User.mjs";
import { userCache } from "./userController.mjs";
import { scores } from "./recordsControllers.mjs";

dotenv.config();

const PRIVATE_KEY = process.env.PRIVATE_KEY;

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

function clearCookie(req, res) {
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
}

export {
  clearCookie,
  registration,
  checkToken,
  joinedAccount,
  auth,
};
