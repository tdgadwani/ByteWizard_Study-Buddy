const mongoose = require('mongoose')
const bcrypt=require('bcryptjs')
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
    }        
})

userSchema.pre("save",async function(next){
    if(this.isModified("password")){
        this.password=await bcrypt.hash(this.password,10);
    }
    next();
})
userSchema.pre("save",async function(next){
    if(this.isModified("password")){
        this.password=await bcrypt.hash(this.password,10);
    }
    next();
})

// Now creating collection for userSchema
const Register=new mongoose.model('Register',userSchema);
module.exports=Register;