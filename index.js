const mongoose=require('mongoose');
const express =require('express');
const bodyParser = require('body-parser'); // parser middleware
const session = require('express-session');  // session middleware
const passport = require('passport');  // authentication
const connectEnsureLogin = require('connect-ensure-login'); //authorization
const { v4: uuidv4 } = require('uuid'); 
const multer=require('multer');
const path=require('path');
const app=express();
const ejs =require('ejs');
const bcrypt=require('bcryptjs');

require('./src/db/bytewizards');
const Register=require("./src/models/registers");
const Doubt=require("./src/models/doubts");

const port = process.env.PORT || 3000;

const DB='mongodb+srv://tusharg:Tushar123@cluster0.8dg2ppi.mongodb.net/ByteWizards?retryWrites=true&w=majority';

mongoose.connect(DB,{
    useNewUrlParser:true,
    useUnifiedTopology:true,
}).then(()=>{
    console.log("Connection Succcesful")
}).catch((err)=>{
    console.log('Connection Unsuccesful',err)
})

const Storage=multer.diskStorage({
    destination:'uploads',
    filename:(req,file,cb)=>{
        cb(null,file.originalname);
    },
});

const upload=multer({
    storage:Storage
}).single('image')

const static_path = path.join(__dirname, "../public");

app.use("/static",express.static("static"))
app.use(
  session({
    genid: function (req) {
      return uuidv4();
    },
    secret: "=fmLV*U@FL`N]]~/zqtFCch.pBTGoU",
    resave: false,
    saveUninitialized: true,
    cookie: {  secure: true },
  })
);
app.use(express.json())
app.use(express.urlencoded({extended:false}));
app.use(passport.initialize());
app.use(passport.session());

app.set('views',path.join(__dirname,'views'));
app.set('view engine','ejs');

passport.use(Register.createStrategy());

passport.serializeUser(Register.serializeUser());
passport.deserializeUser(Register.deserializeUser());

//Routing WebPages

app.get('/',(req,res)=>{
    res.render("index")
})
app.get('/index',(req,res)=>{
    res.render('index')
})
app.get("/register",(req,res)=>{
    res.render("register")
})
app.get('/dashboard',connectEnsureLogin.ensureLoggedIn(),(req,res)=>{
        res.render('dashboard')
        // res.render('login')    
})
app.get('/group',(req,res)=>{
    res.render('group')
})
app.get("/login",(req,res)=>{
    res.render('login')  
})
app.get('/doubt',(req,res)=>{
    res.render('doubt');
})
app.get('/solve',(req,res)=>{
    res.render('solve')
})
app.get('/community',(req,res)=>{
    res.render('community')
})
app.get("/forgotpassword",(req,res)=>{
    res.render('forgotpassword') 
})
app.get('/leaderboard',(req,res)=>{
    res.render('leaderboard')
})
// app.get("/logout", (req, res)=> {
//   req.logout()
//   res.redirect("/login")
// })
app.get("/logout", (req, res) => {
  req.logout(req.user, (err) => {
    if (err) return next(err);
    res.redirect("index");
  });
});

// Creating new user in Database
app.post("/register",async (req,res)=>{
    try{
        const orgDomain = 'nitp.ac.in';
        function validateMobileNumber(mobnumber){
            const regex = /^([6-9])([0-9]{9})$/;
            return regex.test(mobnumber);
        }
        function validateEmail(email) {
        // using a regular expression to check if the email is valid
        const regex = /^([a-z]+).([a-z0-9]{4}).([a-z]{2})@([a-z]{4}).([a-z]{2}).([a-z]{2})$/;
        return regex.test(email);
        }
        function isOrgEmail(email) {
            const domain = email.split('@')[1];
            return domain === orgDomain;
        }
        const email = req.body.email;
        const mobnumber=req.body.number;
        // if (!validateEmail(email)) {
        //     // document.getElementsByClassName("signup_email_hidden").innerHTML="Please Enter Valid Email ID";
        //     // document.getElementsByClassName("signup_email_hidden").style.visibility="visible";
        //     // document.getElementsByClassName("signup_email_hidden").style.color="red";
        // } else if (!isOrgEmail(email)) {
        //     // document.getElementsByClassName("signup_email_hidden").innerHTML="Please Enter Organization's Email ID";
        //     // document.getElementsByClassName("signup_email_hidden").style.visibility="visible";
        //     // document.getElementsByClassName("signup_email_hidden").style.color="red";
        // }else if(!validateMobileNumber(mobnumber)){
        //     // document.getElementsByClassName("signup_mobile_hidden").innerHTML="Please Enter Valid Mobile Number";
        //     // document.getElementsByClassName("signup_mobile_hidden").style.visibility="visible";
        //     // document.getElementsByClassName("signup_mobile_hidden").style.color="red";
        // } 
        // else 
        if(validateEmail(email) && validateMobileNumber(mobnumber)){
            // proceed with signup process
            // var passwordHash;
            // //var password;
            // this.password=req.body.password;
            // const securePassword=async(password) => {
            //      passwordHash = await bcrypt.hash(password,10);
            //   }
            const registerUser= new Register({
                firstname:req.body.firstname,
                lastname:req.body.lastname,
                username:req.body.username,
                email:req.body.email,
                mobnumber:req.body.number,
                password:req.body.password
            })
            // const registered=
            await registerUser.save();
            res.status(201).render('login')//redering login page
        }
}
    catch(err){
        res.status(400).send(`Error at Server Side ${err}`)
    }
})

app.post('/login',async(req,res)=>{
    try{
        const email =req.body.email;
        //const usename=req.body.email;
        const password =req.body.password;
        const useremail= await Register.findOne({email:email});
        // if (!useremail) {
            // document.getElementsByClassName("email_hidden").innerHTML="The password or Email you entered is Invalid";
            // document.getElementsByClassName("email_hidden").style.visibility="visible";
            // document.getElementsByClassName("email_hidden").style.color="red";
        // }
        const passwordMatch=await bcrypt.compare(password,useremail.password)
        // const token=await useremail.generateAuthToken();
        // res.cookie('jwt',token,{
        //     expires:new Date(Date.now()+30000),
        //     httpOnnly:true
        //     // secure:true
        // })
        if(passwordMatch){
            res.status(201).render('dashboard');//rendering home page
        }
        
    }catch(error){
        res.status(400).send(`INVALID ${error}`)
        // document.getElementsByClassName("email_hidden").innerHTML="The password or Email you entered is Invalid";
        // document.getElementsByClassName("email_hidden").style.visibility="visible";
        // document.getElementsByClassName("email_hidden").style.color="red";
        // res.send('Invalid');
    }
})

app.post("/forgotpassword",async (req,res)=>{
    try{
        const email =req.body.email;
        const useremail= await Register.findOne({email:email});
        
        if(useremail)
        {
            result=await Register.findOne({email:email});
            res.status(200).render('setpassword')
        }
        else{
            res.render('register')
        }
    }
    catch(err){
        console.log(err)
    }
})

app.post('/setpassword',async (req,res)=>{
    
    try{
        const password=req.body.password;
        const cpassword=req.body.cpassword;
        const passwordMatch= await bcrypt.compare(password,result.password)

        if(password===cpassword)// && !passwordMatch)
        {
            // Register.update({email:result._id},{password:cpassword});
    
            res.render('login');
        }
        else{
            res.render('index');
            
            //please enter valid password
        }
    }
    catch(err){
        console.log(err);
    }
})

app.post('/doubt',(req,res)=>{
    
      upload(req,res,async(err)=>{
        try{
        if(err){
        console.log(err);
        }
        else{
            const newDoubt=new Doubt({
                topic:req.body.topic,
                tags:req.body.tags,
                doubt:req.body.doubt,
                image:{
                    data:req.file.filename,
                    contentType:'image/png,image/jpg,image/jpeg'
                }
            })
            await newDoubt.save();
            res.status(201).render('index')
            //communities
        }
    }
    catch(err){
        console.log(err)
    }
      })
    })


app.listen(port,()=>{
    console.log(`Listening at Port ${port}`);
})
