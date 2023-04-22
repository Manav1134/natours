/* eslint-disable prettier/prettier */
/* eslint-disable import/newline-after-import */
/* eslint-disable import/no-useless-path-segments */
/* eslint-disable prettier/prettier */
const express = require('express');

const reviewControllers= require("./../controllers/reviewsControllers")
const authControllers= require("./../controllers/authControllers")
const router = express.Router({mergeParams:true});

//Post /tour/6371sg/reviews
//get /tour/6371sg/reviews
// post /reviews
router.use(authControllers.protect)

router.route("/")
.get(reviewControllers.getAllReviews)
.post(
    authControllers.restrictTO("user"),
    reviewControllers.setTourUserIds,
    reviewControllers.createReview)

    router
    .route("/:id")
    .delete(authControllers.restrictTO("user","admin"),
    reviewControllers.deleteReview)
    .patch(authControllers.restrictTO("user","admin"),
    reviewControllers.updateReviews)
    .get(reviewControllers.getReview)

module.exports=router;