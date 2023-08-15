const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bodyParser = require("body-parser"); // parser middleware
// const session = require("express-session"); // session middleware
const passport = require("passport"); // authentication
const connectEnsureLogin = require("connect-ensure-login"); //authorization
const { v4: uuidv4 } = require("uuid");
const multer = require("multer");
const path = require("path");
const app = express();
const ejs = require("ejs");
const expressSession = require("express-session");
const bcrypt = require("bcryptjs");


//import files
dotenv.config({ path: "./config.env" });
require("./db/conn");
const Register = require("./models/registers");
const Doubt = require("./models/doubts");
const session = require("express-session");
//end

//localhost
const PORT = process.env.PORT;
//end

//setup
const static_path = path.join(__dirname, "../static");

app.use("/static", express.static(static_path));

const upload_path = path.join(__dirname, "../uploads");

app.use("/uploads", express.static(upload_path));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 },
  })
);
//rooting
app.use(require("./router/auth"));

app.set("views", path.join(__dirname, "../views"));
app.set("view engine", "ejs");

// passport.use(Register.createStrategy());

// passport.serializeUser(Register.serializeUser());
// passport.deserializeUser(Register.deserializeUser());
//end

//host
app.listen(PORT, () => {
  console.log(`Listening at Port ${PORT}`);
});
//end
