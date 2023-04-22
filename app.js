/* eslint-disable prettier/prettier */
/* eslint-disable import/extensions */
/* eslint-disable prettier/prettier */
/* eslint-disable import/newline-after-import */
/* eslint-disable prettier/prettier */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable import/order */
/* eslint-disable prettier/prettier */
/* eslint-disable node/no-missing-require */
/* eslint-disable prettier/prettier */

// eslint-disable-next-line import/extensions, import/no-unresolved
// eslint-disable-next-line no-unused-vars
const path=require("path")
const express = require('express');
const app = express();
const morgan = require('morgan');
const AppError= require("./utils/appError.js")

const globalErrorHandlers= require("./controllers/errControllers")
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const helmet= require("helmet")
const { rateLimit } = require('express-rate-limit');
const mongoSanitize=require("express-mongo-sanitize")
const xss= require("xss-clean")
const hpp=require("hpp")
const reviewRoutes= require("./routes/reviewRoutes")
const viewRouter= require("./routes/viewRoutes")
const cookieParser= require("cookie-parser")
app.set("view engine","pug")
app.set("views",path.join(__dirname,"views"))
/////////////////////Middlewares///////we apply in to all our routes//////////////////////
///global MiddleWArres
app.use(express.static(path.join(__dirname,"public")))
//Security http headers
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'", 'https:', 'http:', 'data:', 'ws:'],
      baseUri: ["'self'"],
      fontSrc: ["'self'", 'https:', 'http:', 'data:'],
      scriptSrc: ["'self'", 'https:', 'http:', 'blob:'],
      styleSrc: ["'self'", "'unsafe-inline'", 'https:', 'http:'],
    },
  })
);
// development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
//limit request for same APi
const limiter=rateLimit({
  max:100,
  windowMs:60*60*1000,
  message:"to maany request from this ip try again later"
})
app.use(limiter)
//body parser, reading data from the body into req.body
app.use(express.json({limit:"10kb"}));//this helps to read data from req.body
app.use(cookieParser())
app.use(express.urlencoded({extended:true, limit:"10kb"}))
// Data sanitization against mongoose injection
app.use(mongoSanitize())
//Data sanitization against xss
app.use(xss())

//prevent parameter pollution
app.use(hpp({
  whitelist:["duration",
  "ratingsAverage",
  "ratingsQuantity",
  "maxGroupSize",
"difficulty",
"price"]
}))
/// Test middleware
// app.use((req, res, next) => {
//   req.requestTime = new Date().toISOString();
//   next();
// });

// app.use((req, res, next) => {
//   console.log('helo from MiddleWare');
//   next();
// })

///////////////////////////////////////////////////////////

app.use('/', viewRouter); 
app.use('/api/v1/tours', tourRouter); ///for this rote we apply tourrouter midddlewaee
app.use('/api/v1/users', userRouter);
app.use("/api/v1/reviews",reviewRoutes)

app.all("*",(req,res,next)=>{
//   // // res.status(404).json({
//   // //   status:"fail",
//   // //   message:`can not find ${req.originalUrl}on the server`
//   // const err= new Error(`can not find ${req.originalUrl}on the server`)
//   // err.statusCode=404;
//   // err.status="fail";
  next(new AppError(`can not find ${req.originalUrl}on the server`),404)
  })



app.use( globalErrorHandlers);



module.exports = app;
