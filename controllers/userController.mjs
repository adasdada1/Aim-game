import { User } from "../models/User.mjs";
import { TimedCache } from "../models/TimedCache.mjs";
const userCache = new TimedCache();
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
    if (!user) {
      return res.json({
        success: false,
        message: { error: "Неверно введен логин или пароль" },
      });
    }

    userCache.set(nick, user, 7200000);
    req.body.user = user;
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: { error: "Ошибка при получении данных" },
    });
  }
}

export { getUserFromDB, userCache };
