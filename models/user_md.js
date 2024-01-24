const mongoose=require('mongoose')
const Schema=mongoose.Schema

//hello
const userSchema=new Schema({
    fullName:{type:String, required:true},
    phone:{type:String, required:true},
    email:{type:String, required:true, unique:true},
    userName:{type:String, required:true, unique: true},
    password:{type:String, required:true,},
    image:{type:String, required:false, default:"WhatsApp Image 2023-06-17 at 3.34.12 PM.jpeg"},
    status:{type:Boolean},
 })

const users=mongoose.model("Users", userSchema)
module.exports=users