const express = require('express');
const bodyParser = require('body-parser');
const route = require('./src/route/route');
const mongoose = require('mongoose');
const app = express();


mongoose.set('strictQuery', true)


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


mongoose.connect("mongodb+srv://viHAan:vihaan@project5-of-room-27.fxww7ye.mongodb.net/group27Database", {
    useNewUrlParser: true 
})
.then( () => console.log("MongoDb connect ho chuka"))
.catch ( err => console.log(err) )



app.use('/', route);
app.use("/*",function(req,res){

    res.status(400).send({status:false ,message:"Wrong path! "})
}
)


app.listen( 3000, function () {

    console.log('Apna server ' + 3000 + ' pe chal rha hai or')

});