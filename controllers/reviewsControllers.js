/* eslint-disable prettier/prettier */
/* eslint-disable import/newline-after-import */
/* eslint-disable prettier/prettier */
/* eslint-disable import/no-useless-path-segments */
/* eslint-disable prettier/prettier */
// const Tour = require('./../models/tourModels');
// // const User = require('./../models/userModels');
// const AppError = require('./../utils/appError')

const Review=require("../models/reviewModels")
const factory=require("./handlerFactory")

// exports.getAllReviews=catchAsync(async(req,res,next)=>{
//   let filter={}
//   if(req.params.tourId) filter={tour:req.params.tourId}
//     const review= await Review.find(filter)
//     res.status(200).json({
//         status: 'success',
//         results: review.length,
//         data: {
//           review
//         }
//       });
// })

exports.getAllReviews=factory.getAll(Review)

exports.setTourUserIds=(req,res,next)=>{
  if(!req.body.tour) req.body.tour=req.params.tourId
  if(!req.body.user) req.body.user= req.user.id
  next();
}

exports.createReview= factory.createOne(Review)
exports.getReview=factory.getOne(Review)
exports.deleteReview=factory.deleteOne(Review)
exports.updateReviews=factory.updateOne(Review)
