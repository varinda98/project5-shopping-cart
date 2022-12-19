const userModel = require('../model/userModel')






const uploadFiles =  async function(req, res){

    try{
        let files= req.files
        
        if(files && files.length>0){
            let uploadedFileURL= await uploadFile( files[0] )
            res.status(201).send({msg: "file uploaded succesfully", data: uploadedFileURL})
        }
        else{
            res.status(400).send({ msg: "No file found" })
        }
        
    }
    catch(err){
        res.status(500).send({msg: err})
    }
    
}

const createUser = async function (req, res) {
    try {
        let data = req.body


    }catch(err) {
        return res.status(500).send({ msg: err.message })
    }
}