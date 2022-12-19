const express = require("express");
const router = express.Router();



aws.config.update({
    accessKeyId: "AKIAY3L35MCRZNIRGT6N",
    secretAccessKey: "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",
    region: "ap-south-1"
})


let uploadFile= async ( file) =>{
    return new Promise( function(resolve, reject) {
     
     let s3= new aws.S3({apiVersion: '2006-03-01'}); 
 
     var uploadParams= {
         ACL: "public-read",
         Bucket: "classroom-training-bucket", 
         Key: "abc/" + file.originalname, 
         Body: file.buffer
     }
 
 
     s3.upload( uploadParams, function (err, data ){
         if(err) {
             return reject({"error": err})
         }
         // console.log(data)
         // console.log("file uploaded succesfully")
         return resolve(data.Location)
     })
 
     
 
    })
 }

router.all("/*", function(req, res){
    return res.status(400).send({status: false, msg: "Path not found" })
})









module.exports = router;