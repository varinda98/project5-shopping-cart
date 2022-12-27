const orderModel = require('../model/orderModel')
const mongoose = require("mongoose")
const userModel = require("../model/userModel");
const cartModel = require('../model/cartModel')






const createOrder = async function (req, res){
    try {

        let userId = req.params.userId

        
        if (mongoose.Types.ObjectId.isValid(userId) == false){
            return res.status(400).send({ status : false, message : "UserId is not valid"})
        }

        let findUser = await userModel.findOne({ _id:userId})
        if(!findUser){
            return res.status(404).send({ status : false, message : "This user is not found"})
        }

        let data = req.body

        if (Object.keys(data).length == 0){
            return res.status(400).send({ status: false, message: "Body cannot be empty" });
        }

        let {cartId} = data

        if(!(cartId)){
            return res.status(400).send({ status : false, message : "cartId is mandatory"})
        }

        if (mongoose.Types.ObjectId.isValid(cartId) == false){
            return res.status(400).send({ status : false, message : "CartId is not valid"})
        }

        let findCart = await cartModel.findOne({_id:cartId })
        if (!findCart) {
            return res.status(404).send({ status: false, message: "This cartId doesn't exist" })
        }

        const cartCheck = findCart.items.length
        if (cartCheck == 0) {
            return res.status(404).send({ message: "The cart is empty please add product to proceed your order" })
        }

        let { items, totalPrice, totalItems } = findCart

        let totalQuantity = 0
        let totalItem = items.length
        for (let i = 0; i < totalItem; i++) {
            totalQuantity +=  Number(items[i].quantity)
        };

        let myOrder = { userId, items, totalPrice, totalItems, totalQuantity }

        let order = await orderModel.create(myOrder)
        await cartModel.findOneAndUpdate({ _id: cartId, userId:userId }, {$set:{ items: [], totalItems: 0, totalPrice: 0 }})

        return res.status(201).send({ status: true, message: 'Success', data: order });
    }
    catch (error) {
        res.status(500).send({ status : false, message : error.message})
    }
}



module.exports.createOrder=createOrder