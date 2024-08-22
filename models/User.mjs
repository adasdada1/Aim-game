import { Schema } from "./mongoose.mjs";
import mongoose from "mongoose";
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
 
const User = mongoose.model("User", userScheme, "users");
export {User}