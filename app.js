require('dotenv').config()
const express = require("express");
const mongoose = require("mongoose");
const session = require('express-session');
const societyRouter= require("./routers/societyRouter");
const employeeRouter = require("./routers/employeeRouter")

const app = express();
app.use(express.static('./publics'))
app.use(session({
    saveUninitialized: true,
    resave: true,
    secret: process.env.CRYPTSESS
}))
app.use(express.urlencoded({extended: true}))
app.use(societyRouter)
app.use(employeeRouter)

app.listen(process.env.PORT,(err)=>{
    if (err) {
        console.log(err);
    }else{
        console.log("connecté");
    }
}); 
 
mongoose.connect(process.env.MONGO);   