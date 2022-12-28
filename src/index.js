const express = require('express');
const route = require('./route/route');
const mongoose = require('mongoose');
const app = express();
const multer=require("multer")


mongoose.set('strictQuery', true)

app.use(multer().any())



mongoose.connect("mongodb+srv://viHAan:vihaan@project5-of-room-27.fxww7ye.mongodb.net/group27Database", {
    useNewUrlParser: true 
})
.then( () => console.log("MongoDb connect ho chuka"))
.catch ( err => console.log(err) )


app.use('/', route);



app.use("/*", function(req, res){
    return res.status(400).send({status: false, msg: "Path not found" })
})



app.listen( 3000, function () {

    console.log('Apna server ' + 3000 + ' pe chal rha hai or')

});