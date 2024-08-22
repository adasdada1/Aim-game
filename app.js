import express from "express";
import { registerRecordsHelper } from "./models/RecordsHelper.mjs"; 
import { registerHeaderParital } from "./models/HeaderPartial.mjs";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { router } from "./routes/routesAll.mjs";
import compression from "compression";
dotenv.config();

const app = express();


app.use(helmet.noSniff());
app.use(helmet.frameguard({ action: "deny" }));
app.use(helmet.xssFilter());
app.use(helmet.referrerPolicy({ policy: "no-referrer" }));
app.use(helmet.dnsPrefetchControl({ allow: false }));

app.use(compression())

app.use(cookieParser());
registerRecordsHelper()
registerHeaderParital()

app.enable('view cache');
app.set("views", "./public/views");
app.set("view engine", "hbs");


const port = process.env.PORT || 3000;

app.use(express.static("public"));
app.use(express.json());
app.use(router);


app.use("/", (req, res) => {
  res.render("404", { layout: false, title: "Не найдено" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Что-то пошло не так!');
});
const MONGODB_URI = process.env.MONGODB_URI;

(async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    app.listen(port, () => console.log("Сервер запущен"));
  } catch (err) {
    return console.error(err);
  }
})();

