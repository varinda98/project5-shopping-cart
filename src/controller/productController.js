const productModel = require('../model/productModel')
const userModel = require("../model/userModel");
const jwt = require("jsonwebtoken")
const mongoose = require("mongoose")
const bcrypt = require("bcrypt");
const urlValid = require("is-valid-http-url");
const { uploadFile } = require("../aws/aws");
const { valid, isValidName } = require("../validator/validations");



const createProduct = async function (req, res) {
    try {
        let files=req.files
        let data= req.body
        let { title, description, price, currencyId, currencyFormat,isFreeShipping, productImage,style,availableSizes,installments,isDeleted} =data
        
        if(Object.keys(data).length==0){
            return res.status(400).send({status:false,message:"body is blank"})
        }
        //---------------------------checkpresence-----------------------------
        if(!title) {return res.status(400).send({ status: "false", message: "title is mandatory" })};
        if(!description) {return res.status(400).send({ status: "false", message: "description is mandatory" })};
        if(!price) {return res.status(400).send({ status: "false", message: "price is mandatory " })};
        if(!currencyId) {return res.status(400).send({ status: "false", message: "currencyId is mandatory" })};
        if(!currencyFormat) {return res.status(400).send({ status: "false", message: "currencyFormat is mandatory" })};
        if(!availableSizes) {return res.status(400).send({ status: "false", message: "availableSizes is mandatory" })};
        //----------------------checkvalidation--------------------------------
        if (!valid(title)) {
            return res.status(400).send({ status: "false", message: "title must be present" });
          }

        if (!isValidName(title)) {
            return res.status(400).send({ status: "false", message: " title name must be in alphabetical order" });
          }
       
        let checktitle = await productModel.findOne({title:title})
         
        if(checktitle){
          return res.status(400).send({ status: false, message:"Please provide unqiue title" })
        }
        
        if (!valid(description)) {
            return res.status(400).send({ status: "false", message: "description must be present" });
        }
        if (!isValidName(description)) {
            return res.status(400).send({ status: "false", message: " description must be in string" });
        }

        if (!valid(currencyId)) {
            return res.status(400).send({ status: "false", message: "currencyId must be present" });
        }

        if (!isValidName(currencyId)) {
            return res.status(400).send({ status: "false", message: " currencyId must be in string" });
        }

        if (!valid(currencyFormat)) {
            return res.status(400).send({ status: "false", message: "currencyFormat must be present" });
        }
        // console.log(price)
        if(price){
            price = parseInt(price)
            console.log(price)
            console.log(typeof price)
            if(typeof price != 'number')
            return res.status(400).send({status:false, message:"Invalid Price"})
        }
        if (currencyFormat != "₹") {
            return res.status(400).send({ status: "false", message: "currencyFormat must be in string ₹" });
        }
        
        if (isFreeShipping) {
            if (!(isFreeShipping == "true" || isFreeShipping == "false"))
                return res.status(400).send({ status: false, message: "Please enter a boolean value for isFreeShipping" })
        }
        
        if (style) {
            if (!isValidStyle(style)) return res.status(400).send({ status: false, msg: "enter valid style" })
        }
       
        if (!isValidSize(availableSizes)) {
            return res.status(400).send({ status: false, msg: "Please select from the available sizes- S, XS, M, X, L, XXL, XL " })
        }
        if (installments) {
            if (!(/^[0-9]+$/.test(installments.trim()))) return res.status(400).send({ status: false, message: "Invalid value for installments" })
        }
        if (isDeleted) {
            if (!(isDeleted == "true" || isDeleted == "false"))
                return res.status(400).send({ status: false, message: "Please enter a boolean value for isDeleted" })
        }
         if (files && files.length > 0) {
            let uploadedFileURL = await uploadFile(files[0]);
            data.productImage = uploadedFileURL
          }else {
           return res.status(400).send({ msg: "ProductImage is Mandatory" });
    }
    
       let createProd = await productModel.create(data);
       return res.status(201).send({status:true,data:createProd});
        
    }
    catch (error) {
        // console.log("This is the error :", error.message)
        res.status(500).send({ status: false, data: error.message })
    }
}
const getProductsById = async function (req, res) {
    try{
    let ProductId = req.params.productId;
  
  if (!ProductId) {
    return res.status(400).send({ status: false, message:"Please provide Productid" })
      }
  if (isIdValid(ProductId)==false) {
  return res.status(400).send({ status: false, message: "Invalid ProductId" });
  }
    let ProductDetails = await productModel.findOne({_id:ProductId, isDeleted:false});
       if (!ProductDetails){
       return res.status(404).send({ status: false, msg: "No such Product exists" });
       }
      
     res.status(200).send({ status: true,message:"Product details", data:ProductDetails });
    }
    catch(err){
      return res.status(500).send({status:false,message:err.message})
      }
    };



const getProductsByFilter=async function(req,res){
       try{
        const {size,name,priceGreaterThan,priceLessThan,priceSort }=req.query
        let data = {isDeleted:false}
        if(size){
            data['availableSizes']= {$in: size}
        } 
        if(name){
            
            data['title']= name
        }
        if(priceGreaterThan){
            data['price']= {$gt:priceGreaterThan}
        }
        if(priceLessThan){
            data['price']= {$lt:priceLessThan}
        }
        if(priceSort){
            if(!(priceSort==1 || priceSort==-1)){
                return res.status(400).send({status:false,message:"price sort can have only two values 1 or -1"})
            }
        }
        let filteredData=await productModel.find(data).sort({price:priceSort})

        
        if(filteredData.length==0){return res.status(404).send({status:false,message:"data is not present"})}
        res.send(filteredData)
}
       catch(err){
          res.status(500).send({status:false,msg:err.message})
       }
    }
    //------------------------updateproduct---------------------------------------------
    const updateProduct=async function(req,res){
        try {
            let productId = req.params.productId
            if (!isIdValid(productId)) return res.status(400).send({ status: false, msg: `${productId} is not valid productId` })
    
            let updateData = req.body
            let files = req.files
            // console.log(files)
            if (!(valid(updateData) || files)) return res.status(400).send({ status: false, msg: "please input some data to update" })
            console.log(files[0])
            if(files.length>0){
            if (!isValidImg(files[0].originalname)) { return res.status(400).send({ status: false, message: "Image Should be of JPEG/ JPG/ PNG" }); }
            }
            let findProductData = await productModel.findById({ _id: productId })
            if (!findProductData) return res.status(404).send({ status: false, msg: `no data found by this ${productId} productId` })
            if (findProductData.isDeleted == true) return res.status(400).send({ status: false, msg: "this product is deleted so you can't update it" })
    
            let { title, description, price, currencyId, currencyFormat, isFreeShipping, style, availableSizes, installments, productImage, deletedAt, isDeleted } = updateData
    
            for(let key in req.body){
                if(req.body[key].trim().length==0){
                    return res.status(400).send({status:false, message:`${key} can't be empty`})//anything
                }
            }
             if (title) {
               if (findProductData.title == title) return res.status(400).send({ status: false, msg: "title should be unique" })
            }
             if (description) {
                if (!description) return res.status(400).send({ status: false, msg: "enter valid description" })
            }
    
            if (price) {
                price = parseInt(price)
                if (typeof price !== "number") return res.status(400).send({ status: false, message: "Enter a proper price" })
            }
    
            if (currencyId) {
                if (currencyId !== "INR") return res.status(400).send({ status: false, msg: "enter valid currencyId in that formate INR" })
            }
    
            if (currencyFormat) {
                if (currencyFormat != '₹') return res.status(400).send({ status: false, message: "Please enter a valid currencyFormat in ₹ " })
            }
    
            if (isFreeShipping) {
                if (!(isFreeShipping == "true" || isFreeShipping == "false"))
                    return res.status(400).send({ status: false, message: "Please enter a boolean value for isFreeShipping" })
            }
             
            
             let uploadedFileURL = await uploadFile(files[0]);
              updateData.productImage= uploadedFileURL
           
    
            if (style) {
                if (!isValidStyle(style)) return res.status(400).send({ status: false, msg: "enter valid style" })
            }
    
            if (availableSizes) {
                if (!isValidSize(availableSizes.trim())) return res.status(400).send({ status: false, msg: "enter valid availableSizes from 'S', 'XS', 'M', 'X', 'L', 'XXL', 'XL'" })
            }
    
            if (installments) {
                if (!(/^[0-9]+$/.test(installments.trim()))) return res.status(400).send({ status: false, message: "Invalid value for installments" })
            }
    
            if (isDeleted) {
                if (!(isDeleted == "true" || isDeleted == "false"))
                    return res.status(400).send({ status: false, message: "Please enter a boolean value for isDeleted" })
            }
    
            let updatedProductData = await productModel.findOneAndUpdate({ _id: productId, isDeleted: false }, { $set: { ...updateData} }, { new: true })
    
            return res.status(200).send({ status: true, message: "Success", data: updatedProductData })
        } catch (err) {
            return res.status(500).send({ status: false, message: err.message })
        }
    }
    
    //-----------------------delete product------------------------------
    const deleteProduct=async function(req,res){
        try{
        let productId=req.params.productId
        if(!isIdValid(productId)){return res.status(400).send({status:false,msg:"Invalid productId"})}
        let deleteProduct=await productModel.findOneAndUpdate({_id:productId,isDeleted:false},{isDeleted:true,deletedAt:Date.now()},{new:true})
        if(!deleteProduct){return res.status(400).send({status:false,msg:"product is already deleted"})}
        res.status(200).send({status:true,msg:"product is successfully deleted"})
        }
        catch(err){
            res.status(500).send({status:false,msg:err.message})
        }
    }





    module.exports.createProduct=createProduct
    module.exports.getProductsById=getProductsById
    module.exports.getProductsByFilter=getProductsByFilter
    module.exports.updateProduct=updateProduct
    module.exports.deleteProduct=deleteProduct