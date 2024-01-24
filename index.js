require('dotenv').config()
const express= require('express')
const app=express()
const cors=require('cors')
const bodyParser=require('body-parser')
const bcrypt =require("bcrypt")
// const conDB =require('./config/db')
const jwt = require("jsonwebtoken")
// const userModel =  require('./userModel')
const session=require('express-session')
const handleBars=require('express-handlebars')
const path=require('path')
const cookieParser =require('cookie-parser')
const mongoose=require('mongoose') 


//APP CONFIGURATIONS

app.use(cors({credentials:true, origin:`http://localhost:3000`}))
// app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

//For all Static files (Css, Imgs, Js, Fonts etc)
app.use(express.static(path.join(__dirname, 'public')));

let {HOST, PORT}=require('../Server/config/configuration')

let api_route=require('../Server/routes/api-routes');

let admin_route=require('../Server/routes/adminApi-routes')
 

//MONGODB CONNECTION

mongoose.connect('mongodb://127.0.0.1:27017/Tumblr',{
    useNewUrlParser:true,
    useUnifiedTopology:true
})

mongoose.connection.on("error", console.error.bind(console,"Connection Error"))
mongoose.connection.on("open", function () {
    console.log("Mongodb Connected")
})

 
//SET ROUTES

 app.use('/api', api_route)
 app.use('/admin', admin_route)


app.listen(PORT, () => {
    console.log(`Running on ${HOST}${PORT}`);
})