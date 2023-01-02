const cartModel = require('../model/cartModel')
const mongoose = require("mongoose")
const productModel = require('../model/productModel')
const userModel = require("../model/userModel");
const {
    valid,
    isValidEmail,
    isValidName,
    isValidPhone,
    isValidPassword,
    isvalidPincode,
    isValidStreet,
    isIdValid
  } = require("../validator/validations");



//____________________________________________________________________________________________________________________________
//==============================================================================================================================
//_____________________________________________________________________________________________________________________________


const createCart = async function (req, res) {
    try {
        let userId = req.params.userId
        if (!userId) {
            return res.status(400).send({ status: false, msg: "Please give UserId in Url" })
        }
        if (mongoose.Types.ObjectId.isValid(userId) == false) {
            return res.status(400).send({ status: false, msg: "Invalid User" })
        }
        let user = await userModel.findOne({ _id: userId })
        if (!user) {
            return res.status(404).send({ status: false, msg: "User not Exists" })
        }
        let data = req.body
        if (Object.keys(data).length == 0) {
            return res.status(400).send({ status: false, msg: "Data is Missing" })
        }
        let productId = req.body.productId
        if (!productId) {
            return res.status(400).send({ status: false, msg: "productId is required" })
        }
        if (mongoose.Types.ObjectId.isValid(productId) == false) {
            return res.status(400).send({ status: false, msg: "Invalid productId" })
        }
        let productExists = await productModel.findOne({ _id: productId, isDeleted: false })
        if (!productExists) {
            return res.status(404).send({ status: false, msg: "Product not Exists" })
        }
        let cartId = req.body.cartId
        if (cartId){
        if (valid(cartId)== false) {
            return res.status(400).send({ status: false, msg: "provide Cart Id" })
        }
        if (mongoose.Types.ObjectId.isValid(cartId) == false) {
            return res.status(400).send({ status: false, msg: "Invalid Cart Id" })
        }
        }
        let cartExists = await cartModel.findOne({ userId: userId })
        let price = productExists.price

        if (!cartExists) {
            let newCart = {
                userId: userId,
                items: [{
                    productId: productId,
                    quantity: 1
                }],
                totalPrice: price,
                totalItems: 1
            }
            let creatNewCart = await cartModel.create(newCart)
            return res.status(201).send({ status: true, msg: creatNewCart })
         }
            if (cartExists)
            if (!cartId) {
                return res.status(404).send({ status: false, message: "provide Cart Id for the User" })
            }
            let usersCartId = cartExists._id
            if (usersCartId !=  cartId) {
                return res.status(404).send({ status: false, message: "Cart id is not matched with this User" })
            }
       
        let allItems = cartExists.items
        for (let i = 0; i < allItems.length; i++) {
            if (allItems[i].productId == productId) {
                allItems[i].quantity = allItems[i].quantity + 1
                let updateCart = await cartModel.findOneAndUpdate({ userId: userId }, { items: allItems, totalPrice: cartExists.totalPrice + price, totalItems: allItems.length }, { new: true })
                return res.status(201).send({ status: true, message: "Success", data: updateCart })
            }
        }
        let newProductId = productExists._id
        let cartPrice = cartExists.totalPrice
        let cartItem = cartExists.totalItems
        let newItems = {
            $addToSet: { items: { productId: newProductId, quantity:1 } },
            totalPrice: price + cartPrice,
            totalItems: cartItem + 1
        }
        let updatedCart = await cartModel.findOneAndUpdate({ userId: userId }, newItems, { new: true })
        return res.status(201).send({ status: true, message: "Data Updated", data: updatedCart })
    } catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }
}


//____________________________________________________________________________________________________________________________
//==============================================================================================================================
//_____________________________________________________________________________________________________________________________



const updateCart = async function (req, res) {
    try {
        let userId = req.params.userId
        if (!userId) {
            return res.status(400).send({ status: false, msg: "Please give UserId in Url" })
        }
        if (mongoose.Types.ObjectId.isValid(userId) == false) {
            return res.status(400).send({ status: false, msg: "Invalid User" })
        }
        let user = await userModel.findOne({ _id: userId })
        if (!user) {
            return res.status(404).send({ status: false, msg: "User not Exists" })
        }
        let data = req.body
        if (Object.keys(data).length == 0) {
            return res.status(400).send({ status: false, msg: "Data is Missing" })
        }
        let cartId = req.body.cartId
        if (!cartId) {
            return res.status(400).send({ status: false, msg: "provide Cart Id" })
        }
        if (mongoose.Types.ObjectId.isValid(cartId) == false) {
            return res.status(400).send({ status: false, msg: "Invalid Cart Id" })
        }
        let cartExists = await cartModel.findOne({ _id: cartId })
        if (!cartExists) {
            return res.status(404).send({ status: false, msg: "Cart not Exists" })
        }
        if (cartExists.items.length == 0) {
            return res.status(400).send({ status: false, message: "No product found in Cart" })
        }
        let productId = req.body.productId
        if (!productId) {
            return res.status(400).send({ status: false, msg: "productId is required" })
        }
        if (mongoose.Types.ObjectId.isValid(productId) == false) {
            return res.status(400).send({ status: false, msg: "Invalid productId" })
        }
        let productExists = await productModel.findOne({ _id: productId, isDeleted: false })
        if (!productExists) {
            return res.status(404).send({ status: false, msg: "Product not Exists" })
        }
        let removeProduct = req.body.removeProduct
        if (!removeProduct) {
            return res.status(400).send({ status: false, msg: "removeProduct is required" })
        }
        if (removeProduct != 0 && removeProduct != 1) {
            return res.status(400).send({ status: false, message: " removeProduct can only be 0 or 1" })
        }
        if (removeProduct == 0) {
            for (let i = 0; i < cartExists.items.length; i++) {
                if (cartExists.items[i].productId == productId) {
                    let productPrice = productExists.price * cartExists.items[i].quantity
                    let finalprice = cartExists.totalPrice - productPrice
                    cartExists.items.splice(i, 1)
                    let totalItems = cartExists.totalItems - 1
                    let finalUpdatedPrice = await cartModel.findOneAndUpdate({ userId: userId }, { items: cartExists.items, totalPrice: finalprice, totalItems: totalItems }, { new: true })
                    return res.status(200).send({ status: true, message: "Cart Successfully Updated", data: finalUpdatedPrice })
                }
            }
        }


        else if (removeProduct == 1) {
            for (let i = 0; i < cartExists.items.length; i++) {
                if (cartExists.items[i].productId == productId) {
                    const updatedQuantity = cartExists.items[i].quantity - 1

                    if (updatedQuantity < 1) {
                        let productPrice = productExists.price * cartExists.items[i].quantity
                        let finalprice = cartExists.totalPrice - productPrice
                        cartExists.items.splice(i, 1)
                        let totalItems = cartExists.totalItems - 1
                        let finalUpdatedPrice = await cartModel.findOneAndUpdate({ userId: userId }, { items: cartExists.items, totalPrice: finalprice, totalItems: totalItems }, { new: true })
                        return res.status(200).send({ status: true, message: "Cart Successfully Updated", data: finalUpdatedPrice })

                    }else {
                        let finalprice = cartExists.totalPrice - productExists.price
                        let totalItems = cartExists.totalItems
                        cartExists.items[i].quantity = updatedQuantity

                        let finalUpdatedPrice = await cartModel.findOneAndUpdate({ userId: userId }, { items: cartExists.items, totalPrice: finalprice, totalItems: totalItems }, { new: true })
                        return res.status(200).send({ status: true, message: "Cart Successfully Updated", data: finalUpdatedPrice })

            
                    }
                }
            }

        }

    } catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }
}


//____________________________________________________________________________________________________________________________
//==============================================================================================================================
//_____________________________________________________________________________________________________________________________


const getCartById = async function (req, res) {
    try {
        let userId = req.params.userId
        if (!userId) { return res.status(400).send({ status: false, message: "userId is mandatory" }) }
        if (!isIdValid(userId)) { return res.status(400).send({ status: false, message: "userId is invalid" }) }
        let userExist = await userModel.findOne({ _id: userId, isDeleted: false })
        if (!userExist) { return res.status(400).send({ status: false, message: "user doesnot exist or deleted" }) }
        let cartExist = await cartModel.findOne({ userId: userId })
        if (!cartExist) { return res.status(400).send({ status: false, message: "cart doesnot exist" }) }
        let arr = []
        let items = cartExist['items']

        for (let i = 0; i < items.length; i++) {
            let pId = items[i]['productId']

            //console.log(pId)
            arr[i] = await productModel.findOne({ _id: pId, isDeleted: false })

        }
        res.status(200).send({ status: true, data: arr })
    }
    catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }

}


//____________________________________________________________________________________________________________________________
//==============================================================================================================================
//_____________________________________________________________________________________________________________________________

const deleteCart = async function (req, res) {
    try {
        let userId = req.params.userId

        if (!userId) { return res.status(400).send({ status: false, message: "userId is mandatory" }) }

        if (!isIdValid(userId)) { return res.status(400).send({ status: false, message: "userId is invalid" }) }

        let userExist=await userModel.findOne({_id:userId,isDeleted:false})

        if(!userExist){return res.status(404).send({ status: false, message: "No user found with this Id" })}

        let cartExist = await cartModel.findOne({ userId: userId })

        if (!cartExist) { return res.status(404).send({ status: false, message: "cart is already deleted" }) }

        let cartDelete = await cartModel.findOneAndUpdate({ userId: userId ,_id:cartExist._id}, { $set: { items: [], totalItems: 0, totalPrice: 0 } },{new:true})
        
        if (!cartDelete) { return res.status(400).send({ status: false, message: "cart doesnot exist" }) }
        res.status(201).send({ status: true, message: " cart successfully deleted " })
    }
    catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }
}

module.exports.createCart = createCart
module.exports.updateCart = updateCart
module.exports.getCartById = getCartById
module.exports.deleteCart = deleteCart
