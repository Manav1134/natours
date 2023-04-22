/* eslint-disable prettier/prettier */
/* eslint-disable node/no-missing-require */
/* eslint-disable prettier/prettier */
/* eslint-disable no-unused-vars */
/* eslint-disable import/no-unresolved */
const express= require("express")
const viewControllers= require("../controllers/viewsControllers")

const authController= require("../controllers/authControllers")

const router= express.Router()


router.use(authController.isLoggedIn)
router.get("/",authController.isLoggedIn,viewControllers.getOverview)

router.get("/tour/:slugify",authController.isLoggedIn,viewControllers.getTour)
  
router.get("/login",authController.isLoggedIn,viewControllers.getLoginForm)
router.get("/me",authController.protect,viewControllers.getAccount)
// router.post("/submit-user-data",authController.protect,viewControllers.updateUserData)

// router.get("/signup",viewControllers.getSignupForm)
module.exports=router;