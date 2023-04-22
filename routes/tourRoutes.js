/* eslint-disable prettier/prettier */
/* eslint-disable import/newline-after-import */
/* eslint-disable prettier/prettier */
/* eslint-disable import/no-useless-path-segments */
/* eslint-disable prettier/prettier */
const express = require('express');
// eslint-disable-next-line import/no-useless-path-segments
const tourControllers = require('./../controllers/tourControllers');
const reviewRouter = require('./../routes/reviewRoutes');
const router = express.Router(); ////here we make a new route object
const authController=require("./../controllers/authControllers")
// router.param('id',tourControllers.checkId)\

 
   // Get /tour/234hd46/reviews
   // Get /tour/2763ddh/reviews/djhwi7

  //  router
  //  .route("/:tourId/reviews")
  //  .post(
  //   authController.protect,
  //   authController.restrictTO("user"),
  //  reviewControllers.createReview
  //  );
  router.use("/:tourId/reviews",reviewRouter)
router
.route("/top-5-cheap")
.get(tourControllers.aliasTopTours,tourControllers.getAllTours);

router.route("/tour-stats").get(tourControllers.getTourStats);

router.route("/monthly-plan/:year")
.get(
  authController.protect,
  authController.restrictTO("admin","lead-guide","guide"),
  tourControllers.getMonthlyPlan
  );

  router
  .route("/tours-within/:distance/center/:latlng/unit/:unit")
  .get(tourControllers.getToursWithin)
 
router.route("/distances/:latlng/unit/:unit")
.get(tourControllers.getDistances)
router
  .route('/')
  .get(tourControllers.getAllTours)
  .post(authController.protect,
    authController.restrictTO("admin","lead-guide"),
    tourControllers.createTour);

router
  .route('/:id')
  .get(tourControllers.getOnetour)
  .patch(authController.protect,
    authController.restrictTO("admin","lead-guide"),
    tourControllers.uploadTourImages,
    tourControllers.resizeTourImages,
    tourControllers.updateTours) 
  .delete(authController.protect,
    authController.restrictTO("admin","lead-guide"),
   tourControllers.deleteTour);

  
module.exports = router;
