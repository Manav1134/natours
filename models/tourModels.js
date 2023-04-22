/* eslint-disable prettier/prettier */
/* eslint-disable no-unused-expressions */
/* eslint-disable prettier/prettier */
/* eslint-disable prefer-arrow-callback */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-unused-vars */
/* eslint-disable prettier/prettier */
const mongoose = require('mongoose');
const validator= require("validator")
const slugify= require("slugify")
// const User= require("./userModels")

const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A tour must have name'],
    unique: true,
    trim:true,
    maxLength:[40,"tour name must be below 40"],
    minLength:[10,"tour name must be above 40"],
    // validate: [validator.isAlpha, "name only contain alphabat"]
  },
  slugify: String,
  duration:{
     type: String,
     required:[true, "A tour must have a duration"]
  },
  maxGroupSize:{
   type: String,
   required:[true,"A tour must have a group size"]
  },
  difficulty:{
    type: String,
    required:[true, "A tour must have a difficulty"],
    enum:{
      values:["easy","medium","difficult"],
      message:"difficulty must be easy,medium and difficult "
    }
  },
  ratingsAverage: {
    type: Number,
    default: 4.5,
    min:[1,"rating must be above 1.0"],
    max:[5,"rating must be below 5.0"],
    set:val=>Math.round(val*10)/10
  },
  ratingsQuantity:
  {
    type:Number,
    default:0
  },
  price: {
    type: Number,
    required: [true, 'a tour must have a price']
  },
  priceDiscount: {
    type:String,
    validate: {
      validator:function(value){
        // this only points  to current  doc on  New document  creation
      return value < this.price;
    },
    message:"discount must below the actual price"
  }
  },
   summary:{
   type:String,
   trim:true,
   required:[true,"tour  must have a summary"]
 },
 description:{
    type:String,
    trim:true
 },
 imageCover:{
    type:String,
    required:[true,"a  field must have a cover image"]
 },
 images:[String],
 createdAt:{
    type: Date,
    default:Date.now(),
    select:false
 },
 startDates:[Date],
 secretTour:{
  type:Boolean,
  default:false
},
startLocation:{
  //GeoJson
  type:{
    type:String,
    default:"Point",
    enum: ["Point"] 
  },
  coordinates:[Number],
  address:String,
  description:String
},
locations:[
  {
  //GeoJson
  type:{
    type:String,
    default:"Point",
    enum:["Point"] 
  },
  coordinates:[Number],
  address:String,
  description:String,
  day:Number
}
],
guides: [
  {
    type: mongoose.Schema.ObjectId,
    ref:"User"
  }
]
},
{
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
}
);
//here we set index for price query
// tourSchema.index({price:1})// single filed indexing
tourSchema.index({price:1, ratingsAverage:-1})//compound index
tourSchema.index({slug:1})//compound index
tourSchema.index({startLocation: " 2dsphere"})

tourSchema.virtual('durationWeeks').get(function() {
  return this.duration / 7;
  });
//virtual populate
tourSchema.virtual("reviews",{
  ref:"Review",
  foreignField:"tour",
  localField:"_id"
})
//DOCUMENT MIDDLEWARE: runs befor .save() and .create()
tourSchema.pre("save",function(next){
this.slugify= slugify(this.name,{lower:false})
  next();
});
// tourSchema.pre("save",async function(next){
//   const guidesPromises=this.guides.map(async el=>await User.findById(el))
// this.guides=await Promise.all(guidesPromises)
// next()
// })
//  tourSchema.pre("save",function(next){
//   console.log("will save document")
// next()
// })
// tourSchema.post("save",function(doc,next){// doc is a finished document 
//   // that we recetly cerated
//   console.log(doc)
// next()
// })
// eslint-disable-next-line no-unused-vars

/////////////////////////////QUERY MIDDLEWARE///////////////////////
// tourSchema.pre("find",function(next){
tourSchema.pre(/^find/,function(next){
this.find({secretTour:{$ne:true}})/// matlab jo tour true de equal ni h
// ni h oo sANu show ho jaan
this.start=Date.now();
next()
})

tourSchema.pre(/^find/,function(next){
  this.populate({
    path:"guides",
    select:"-__v -passwordChangedAt"
  });

  next();
});
// tourSchema.pre("aggregate",function(next){
// //   this.pipeline().unshift({$match:{secretTour:{$ne:true}}})
// //   next()
// // })

tourSchema.post(/^find/,function(doc,next){
console.log(`query took ${Date.now()-this.start} milliseconds` )
  console.log(doc)
    next()
  })


const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;

