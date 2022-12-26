const express = require("express");
const router = express.Router();
const userController = require('../controller/userController.js')
const MW = require('../middleware/MW.js')
const{createProduct,getProductsById,getProductsByFilter,updateProduct,deleteProduct}=require("../controller/productController")
const cartController = require('../controller/cartController')



 router.post('/register',userController.createUser)
 router.post('/login',userController.loginUser)
 router.get('/user/:userId/profile',MW.Authentication,userController.getUserById)
 router.put('/user/:userId/profile',MW.Authentication,MW.Authorisation,userController.updateUserProfile)


 router.post("/products",createProduct)
router.get("/products/:productId",getProductsById)
router.get("/products", getProductsByFilter)
 router.put("/products/:productId",updateProduct)
router.delete("/products/:productId",deleteProduct)



router.post("/users/:userId/cart",cartController.createCart)
router.put("/users/:userId/cart",cartController.updateCart)

router.all("/*", function(req, res){
    return res.status(400).send({status: false, msg: "Path not found" })
})









module.exports = router;