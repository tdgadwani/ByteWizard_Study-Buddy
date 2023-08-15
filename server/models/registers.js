const mongoose = require('mongoose')
const passportLocalMongoose = require("passport-local-mongoose")
const bcrypt=require('bcryptjs')
const jwt=require('jsonwebtoken');
const userSchema=new mongoose.Schema({
    firstname:{
        type:String,
        required:true,
        max:20
    },
    lastname:{
        type:String,
        required:true,
        max:20
    },
    username:{
        type:String,
        required:true,
        max:20,
        unique:true
        },
    email:{
        type:String,
        required:true,
        unique:true
        },
    mobnumber:{
            type:Number,
            required:true,
            min:10,
            unique:true
        },
    password:{
        type:String,
        min:8,
        required:true,
        max:16
    }, 
})

// userSchema.pre("save",async function(next){
//     if(this.isModified("password")){
//         this.password=await bcrypt.hash(this.password,10);
//     }
//     next();
// })
// userSchema.pre("save",async function(next){
//     if(this.isModified("password")){
//         this.password=await bcrypt.hash(this.password,10);
//     }
//     next();
// })
// userSchema.methods.generateAuthToken = async function (){
//     try{
//         let tokenBuddy=jwt.sign({_id:this._id},process.env.SECRET_KEY);
//         this.tokens=this.tokens.concat( { token : tokenBuddy } );
//         await this.save();
//         return tokenBuddy;
//     }
//     catch(err){
//         console.log(err);
//     }
// }
// Now creating collection for userSchema
// userSchema.plugin(passportLocalMongoose);

const Register=new mongoose.model('Register',userSchema);


module.exports=Register;