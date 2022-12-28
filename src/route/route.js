const express = require("express");
const router = express.Router();
const userController = require('../controller/userController.js')
const MW = require('../middleware/MW.js')
const{createProduct,getProductsById,getProductsByFilter,updateProduct,deleteProduct}=require("../controller/productController")
const cartController = require('../controller/cartController')
const orderController = require('../controller/orderController')


//===================user==============================
 router.post('/register',userController.createUser)
 router.post('/login',userController.loginUser)
 router.get('/user/:userId/profile',MW.Authentication,userController.getUserById)
 router.put('/user/:userId/profile',MW.Authentication,MW.Authorisation,userController.updateUserProfile)

//==================product======================
 router.post("/products",createProduct)
router.get("/products/:productId",getProductsById)
router.get("/products", getProductsByFilter)
 router.put("/products/:productId",updateProduct)
router.delete("/products/:productId",deleteProduct)


//====================cart==========================
router.post("/users/:userId/cart",MW.Authentication,MW.Authorisation,cartController.createCart)
router.put("/users/:userId/cart",MW.Authentication,MW.Authorisation,cartController.updateCart)
router.get("/users/:userId/cart",MW.Authentication,MW.Authorisation,cartController.getCartById)
router.delete("/users/:userId/cart",MW.Authentication,MW.Authorisation,cartController.deleteCart)


//====================order================================
router.post("/users/:userId/orders",MW.Authentication,MW.Authorisation,orderController.createOrder)
router.put("/users/:userId/orders",MW.Authentication,MW.Authorisation,orderController.updateOrder)



module.exports = router;







