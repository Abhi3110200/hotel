const express = require("express");
const app = express();
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const cors = require("cors");
const User = require("./models/User");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const CookieParser = require("cookie-parser");

const bcryptSalt = bcrypt.genSaltSync(10);
const jwtSecret = "fkjqw7ejbwwdu38hwwdkw";
app.use(express.json());
app.use(CookieParser());
app.use(
  cors({
    credentials: true,
    origin: ["http://localhost:5173"],
  })
);

mongoose.connect(process.env.MONGO_URL);

//abhijeetdrv
//h0fvpvNLorIJwwn8
//mongodb+srv://abhijeetdrv:Lvjs0nYd4vGauwXA@cluster0.lzd7x4s.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
app.get("/test", (req, res) => {
  res.json("test ok");
});

app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const userDoc = await User.create({
      name,
      email,
      password: bcrypt.hashSync(password, bcryptSalt),
    });

    res.json(userDoc);
  } catch (e) {
    res.status(422).json(e);
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const UserDoc = await User.findOne({ email });
  if (UserDoc) {
    const passOk = bcrypt.compareSync(password, UserDoc.password);
    if (passOk) {
      jwt.sign(
        { email: UserDoc.email, id: UserDoc._id},
        jwtSecret,
        {},
        (err, token) => {
          if (err) throw err;
          res.cookie("token", token).json(UserDoc);
        }
      );
    } else {
      res.status(422).json("pass not Ok");
    }
  } else {
    res.json("not found");
  }
});

app.get("/profile", (req, res) => {
  const { token } = req.cookies;
  if (token) {
    jwt.verify(token, jwtSecret, {}, async (err, UserData) => {
      if (err) throw err;
      const {name, email, _id}= await User.findById(UserData.id);
      res.json({name, email, _id});
    });
  } else {
    res.json(null);
  }
  res.json({ token });
});
app.listen(4000);
