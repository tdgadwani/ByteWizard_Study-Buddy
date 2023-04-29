const mongoose=require('mongoose');

const doubtSchema=new mongoose.Schema({
    topic:{
        type:String,
        max:25,
    },
    tags:{
        type:[String],
        required:true,
    },
    doubt:{
        type:String,
        max:20
    },
    image:{
        data:Buffer,
        contentType:String
    }
})

// Now creating collection for userSchema
const Doubt=new mongoose.model('Doubt',doubtSchema);
module.exports=Doubt;