const express = require('express');
const app = express();

const mongoose = require('mongoose');
const jwt = require("jsonwebtoken");

//import schemas
const UserSchema = require('./schemas/userSchema');

//import controller
const controller = require('./contollers/controller');

const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.set('view engine', 'ejs');

//all routes
app.use('/api', controller);

//mongodb connection
mongoose.connect('mongodb+srv://petrushenkoe6:GhqR11xAnkaXTbpa@cluster0.bhdqycu.mongodb.net/')


app.listen(port, () => {
    console.log(`server runing on localhost:${port}`)
})