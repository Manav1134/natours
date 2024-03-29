/* eslint-disable prettier/prettier */
/* eslint-disable import/order */
/* eslint-disable prettier/prettier */
/* eslint-disable arrow-body-style */
/* eslint-disable no-undef */
/* eslint-disable prettier/prettier */
/* eslint-disable lines-between-class-members */
/* eslint-disable prettier/prettier */
/* eslint-disable no-unused-vars */
/* eslint-disable import/no-useless-path-segments */
/* eslint-disable no-unreachable */
/* eslint-disable prettier/prettier */

// const tourId = "5c88fa8cf4afda39709c2951\n";// Chat gpt
// const cleanedTourId = tourId.trim(); // removes the newline character//chatgpt
const Tour = require('./../models/tourModels');

const multer= require("multer")
const sharp= require("sharp")
const catchAsync= require("../utils/catchAsync");
const AppError = require('./../utils/appError');
const factory=require("./handlerFactory")


const multerStorage= multer.memoryStorage()

const multerFilter=(req,file,cb)=>{
    if(file.mimetype.startsWith("image")){
        cb(null,true)
    }else{
        cb(new AppError("Not an image!Please upload images"),404)
    }
}
const upload= multer({
    storage : multerStorage,
    filter:multerFilter
})

exports.uploadTourImages= upload.fields([
{name:"imageCover", maxCount: 1},
{name:"images", maxCount: 3},
])

//upload.single('image') 
//upload.array('images,5')

exports.resizeTourImages= catchAsync(async(req,res,next)=>{
if(!req.files.imageCover || !req.files.images ) return next()

req.body.imageCover=`tour-${req.params.id}-${Date.now()}-cover.jpeg`
await sharp(req.files.imageCover[0].buffer)
     .resize(2000,1333)
     .toFormat("jpeg")
     .jpeg({quality:90})
     .toFile(`public/img/tours/${ req.body.imageCover}`) 
//2.)) Images
req.body.images=[]

await Promise.all(
  req.files.images.map(async (file,i) => {
  const fileName=`tour-${req.params.id}-${Date.now()}-${i+1}.jpeg`

  await sharp(file.buffer)
     .resize(2000,1333)
     .toFormat("jpeg")
     .jpeg({quality:90})
     .toFile(`public/img/tours/${fileName}`) 

     req.body.images.push(fileName)
}))
next()
})

exports.aliasTopTours= (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};
exports.getAllTours=factory.getAll(Tour)
// exports.getAllTours = catchAsync(async (req, res, next) => {
//   const features = new APIFeatures(Tour.find(), req.query)
//     .filter()
//     .sort()
//     . limitFIelds()
//     .pagination();
//   const tours = await features.query;

//   // SEND RESPONSE
//   res.status(200).json({
//     status: 'success',
//     results: tours.length,
//     data: {
//       tours
//     }
//   });
// });

exports.getOnetour = factory.getOne(Tour,{path:"reviews"})

exports.createTour=factory.createOne(Tour)
// exports.createTour = catchAsync(async (req, res, next) => {
//   const newTour = await Tour.create(req.body);

//   res.status(201).json({
//     status: 'success',
//     data: {
//       tour: newTour
//     }
//   });
// });
exports.updateTours=factory.updateOne(Tour)
// exports.updateTours = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//     new: true,
//     runValidators: true
//   });

//   if (!tour) {
//     return next(new AppError('No tour found with that ID', 404));
//   }

//   res.status(200).json({
//     status: 'success',
//     data: {
//       tour
//     }
//   });
// });

exports.deleteTour=factory.deleteOne(Tour)
// exports.deleteTour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findByIdAndDelete(req.params.id);

//   if (!tour) {
//     return next(new AppError('No tour found with that ID', 404));
//   }

//   res.status(204).json({
//     status: 'success',
//     data: null
//   });
// });

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } }
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' }
      }
    },
    {
      $sort: { avgPrice: 1 }
    }
    // {
    //   $match: { _id: { $ne: 'EASY' } }
    // }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats
    }
  });
});

exports.getMonthlyPlan= catchAsync(async (req, res, next) => {
  const year = req.params.year * 1; // 2021

  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates'
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`)
        }
      }
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' }
      }
    },
    {
      $addFields: { month: '$_id' }
    },
    {
      $project: {
        _id: 0
      }
    },
    {
      $sort: { numTourStarts: -1 }
    },
    {
      $limit: 12
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      plan
    }
  });
});


//tours-within/:distance/center/:latlmg/unit/:unit
// /tours-within/223/center/34.111745,-118.113491/unit/mi
exports.getToursWithin=async (req,res,next)=>{
  const {distance,latlng,unit}=req.params
  const [lat,lng]=latlng.split(",")
  const radius=unit==="mi"? distance/3963.2 : distance / 6378.1
  if(!lat||!lng){
    next(
      new AppError(
      "please provide latitude and longitude in the format lar,lng"
      ))
  }
  const tours= await Tour.find
  ({startLocation:{$geoWithin:{$centerSphere:[[lng,lat],radius]}}
  });


  res.status(200).json({
    status:"success",
    result:tours.length,  
    data:{
      data:tours
    }
  })

}


exports.getDistances=catchAsync(async(req,res,next)=>{
  const {latlng,unit}=req.params
  const [lat,lng]=latlng.split(",")
  const multiplier=unit=== "mi"?0.000621371 :0.001;

  if(!lat||!lng){
    next(
      new AppError(
      "please provide latitude and longitude in the format lar,lng"
      ))
  }

  const distances=await Tour.aggregate([
      {
        $geoNear:{
          near:{
            type:"point",
            coordinates:[lng * 1, lat * 1]
          },
          distanceField:"distance",
          distanceMultiplier:multiplier
        }
      },
      {
      $project:{
        distance:1,
          name:1
      }
    }
  ])
  res.status(200).json({
    status:"success",  
    data:{
      data:distances
    }
  })
})