const mongoose=require("mongoose")
const tokenschema=new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"UserDetails",
        required:true
    },
    token:{
        type:String,
        required:true
    },
    createdAt:{
        type:Date,
        default:Date.now,
        expires:3600
    }
})
module.exports=mongoose.model("Token",tokenschema)