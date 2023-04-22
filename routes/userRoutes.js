/* eslint-disable prettier/prettier */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable import/order */
/* eslint-disable prettier/prettier */
/* eslint-disable import/no-useless-path-segments */
/* eslint-disable prettier/prettier */
const express= require("express");
const userControllers= require("./../controllers/userControllers")


const authControllers= require("./../controllers/authControllers")



    const router=express.Router();//////here we make a new route object
router.post("/signup",authControllers.signup)
router.post("/login",authControllers.login)
router.get("/logout",authControllers.logout)

router.post("/forgotPassword",authControllers.forgotPassword)
router.patch("/resetpassword/:token",authControllers.resetPassword)

//protect all routes after this middleware
router.use(authControllers.protect)

router.patch("/updateMyPassword",
authControllers.updatePassword
);


router.get("/me",
userControllers.getMe,
userControllers.getOneuser)


router.patch("/updateMe",userControllers.uploadUserPhoto,
userControllers.resizeUserPhoto,
userControllers.updateMe
);
router.delete("/deleteMe",
userControllers.deleteMe);

router.use(authControllers.restrictTO("admin"))
    router.route("/")
.get(userControllers.getAllusers)
.post(userControllers.createUsers)

router.route("/:id")
.get(userControllers.getOneuser)
.patch(userControllers.updateUser)
.delete(userControllers.deleteUser)

module.exports= router;