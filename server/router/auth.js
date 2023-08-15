const express = require("express");
const app = express();
const router = express.Router();
const connectEnsureLogin = require("connect-ensure-login"); //authorization
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken"); //to generate token
const ejs = require("ejs");
// const secretkey = "my secrete key ";
const multer = require("multer");
const session = require("express-session");
const path = require("path");
const sessionStorage = require("sessionstorage-for-nodejs");
const passport = require("passport");
const cookieParser=require('cookie-parser');
const config = process.env;

require("../db/conn");
const Register = require("../models/registers");
const Doubt = require("../models/doubts");
const authentication=require("../middleware/authentication");

var img = Doubt.find();

const static_path = path.join(__dirname, "../static");

const Storage = multer.diskStorage({
  destination: "../uploads",
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: Storage,
}).single("image");

router.use(express.json());

// router.use(
//   session({ secret: process.env.SECRET_KEY, resave: false, saveUninitialized: false })
// );

//routing
router.get("/", (req, res) => {
  res.render("index");
});
router.get("/index/", (req, res) => {
  res.render("index");
});
router.get("/register", (req, res) => {
  const dataObject = {
    emailInvalidVisibility: "hidden",
    emailInvalidMessage: "Valid",
  };
  // console.log(dataObject);
  res.render("register", dataObject);
  //res.render("register")
});
router.get("/dashboard", authentication, (req, res) => {
  res.cookie("StudyBuddy", "ByteWizards");
  res.render("dashboard");
});

router.get("/group", authentication ,(req, res) => {
  res.render("group");
});
router.get("/login", (req, res) => {
  res.render("login");
});
router.get("/doubt",authentication, (req, res) => {
  res.render("doubt");
});
router.get("/chatbot", (req, res) => {
  res.render("chatbot");
});
router.get("/solve", authentication, (req, res, next) => {
  img = Doubt.find();
  img.exec(function (err, data) {
    if (err) console.log(err);
    res.render("solve", { title: "upload file", records: data }); // passing images data in json form to retrive
  });
});
router.get("/community", (req, res) => {
  res.render("community");
});
router.get("/forgotpassword", (req, res) => {
  res.render("forgotpassword");
});
router.get("/leaderboard", (req, res) => {
  res.render("leaderboard");
});
router.get("/*", (req, res) => {
  res.render("error");
});
//end

// Creating new user in Database
router.post("/register", async (req, res) => {
  const orgDomain = "nitp.ac.in";
  // using a regular expression to check if the monbile no is valid
  function validateMobileNumber(mobnumber) {
    const regex = /^([6-9])([0-9]{9})$/;
    return regex.test(mobnumber);
  }

  // using a regular expression to check if the email is valid
  function validateEmail(email) {
    const regex =
      /^([a-z]+).([a-z0-9]{4}).([a-z]{2})@([a-z]{4}).([a-z]{2}).([a-z]{2})$/;
    return regex.test(email);
  }
  //to check for organization email
  function isOrgEmail(email) {
    const domain = email.split("@")[1];
    return domain === orgDomain;
  }
  try {
    // const email = req.body.email;
     const mobnumber = req.body.number;
    const { firstname, lastname, username, email, password  } = req.body;
    var emailInvalidVisibility = "hidden";
    var emailInvalidMessage = "Invalid";
    // if (!validateEmail(email)) {
    //   emailInvalidVisibility = "visible";
    //   emailInvalidMessage = "Please enter a valid email address";
    // } else if (!isOrgEmail(email)) {
    //   emailInvalidVisibility = "visible";
    //   emailInvalidMessage = "Please Enter Organization's Email ID";
    // } else if (!validateMobileNumber(mobnumber)) {
    //   emailInvalidVisibility = "visible";
    //   emailInvalidMessage = "Please enter a valid Mobile Number";
    // } else {
      //if (validateEmail(email) && validateMobileNumber(mobnumber)) {
      /*proceed with signup process
      var passwordHash;
      //var password;
      this.password=req.body.password;*/
          //  const securePassword = await bcrypt.hash(password,10);

      //check individually for each field if empty
      const userExist = await Register.findOne({ email: email });
      if (userExist) {
        //innerHTML
      }
      // else{
        const securePassword = await bcrypt.hash(password,10);
      const registerUser = await Register.create({
        firstname, 
        lastname,
        username,
        email: email.toLowerCase(),
        mobnumber,
        password: securePassword
      });
    // }
      // res.status(201).json(registerUser);
      res.status(201).render("login"); //redering login page
    // }
    const dataObject = {
      emailInvalidVisibility,
      emailInvalidMessage,
    };
    // console.log(dataObject);
    // res.render("register", dataObject);
  } catch (err) {
    console.log(err);
    res.render("error");
    // res.status(400).send(`Error at Server Side ${err}`);//for better idea will render login page
  }
});

router.post("/login",async (req, res) => {
    try {
      const email = req.body.email;
      const password = req.body.password;
      if (!email || !password) {
        //inner html please fill required fields
      }
      const user = await Register.findOne({ email: email });
      // if (!useremail) {
      // document.getElementsByClassName("email_hidden").innerHTML="The password or Email you entered is Invalid";
      // document.getElementsByClassName("email_hidden").style.visibility="visible";
      // document.getElementsByClassName("email_hidden").style.color="red";
      // }
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (user &&  passwordMatch) {
        const token = jwt.sign(
          { user_id: user._id, email,username:user.username },
          process.env.SECRET_KEY,
          {
            expiresIn: "30d",
          }
        );
        // save user token
        req.session.token = token;
        console.log(req.session);
        res.status(201).render("dashboard"); //rendering home page
      } else {
        res.status(404);
      }
    } catch (error) {
      console.log(error);
      res.render("error");
      // document.getElementsByClassName("email_hidden").innerHTML="The password or Email you entered is Invalid";
      // document.getElementsByClassName("email_hidden").style.visibility="visible";
      // document.getElementsByClassName("email_hidden").style.color="red";
      // res.send('Invalid');
    }
  }
);

router.post("/forgotpassword", async (req, res) => {
  try {
    const email = req.body.email;
    const useremail = await Register.findOne({ email: email });

    if (useremail) {
      result = await Register.findOne({ email: email });
      res.status(200).render("setpassword");
    } else {
      res.render("register");
    }
  } catch (err) {
    res.render("error");
  }
});

router.post("/setpassword", async (req, res) => {
  try {
    const password = req.body.password;
    const cpassword = req.body.cpassword;
    const passwordMatch = await bcrypt.compare(password, result.password);

    if (password === cpassword) {
      // && !passwordMatch)
      // Register.update({email:result._id},{password:cpassword});

      res.render("login");
    } else {
      //res.render('index');
      res.render("error");
      //please enter valid password
    }
  } catch (err) {
    res.render("error");
  }
});

router.post("/doubt", (req, res) => {
  upload(req, res, async (err) => {
    try {
      if (err) {
        res.render("error");
      } else {
        const token =
          req.session.token ||
          req.body.token ||
          req.query.token ||
          req.headers["x-access-token"];
        const decoded = jwt.verify(token, config.SECRET_KEY);
        const newDoubt = new Doubt({
          topic: req.body.topic,
          tags: req.body.tags,
          doubt: req.body.doubt,
          image: req.file.filename,
          username:decoded.username,
          timestamp:new Date(),
        });
        await newDoubt.save(function (err, doc) {
          if (err) 
          {
            console.log(err);  
            res.render("error");
          }
          img = Doubt.find();
          img.exec(function (err, data) {
            if (err) 
            {
              console.log(err);
              res.render("error");
            }
            res.render("solve", { title: "upload file", records: data });
          });
        });
        //res.status(201).render('index') no use for now
        //communities
      }
    } catch (err) {
      console.log(err);
      res.render("error");
    }
  });
});

module.exports = router;
