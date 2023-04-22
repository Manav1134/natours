/* eslint-disable no-else-return */
/* eslint-disable no-lonely-if */
/* eslint-disable prettier/prettier */
/* eslint-disable no-undef */
/* eslint-disable prettier/prettier */
/* eslint-disable no-unused-vars */
/* eslint-disable no-unused-expressions */
/* eslint-disable prettier/prettier */
/* eslint-disable import/no-useless-path-segments */
/* eslint-disable prettier/prettier */



  
///////// This code is from video 120 and it is not working because 
// ///////// i dont get the errmsg//// property in err
// const handleDuplicateFiled=err=>{
//   const value=err.stack.match(/(["'])(?:\\.|[^\\])*?\1/)[0]
//   

//   const message=`duplicate field value=x.pls use another`
// return new AppError(message,400)
// }
// ///////////////////////////////////////////
const AppError = require("./../utils/appError");

const handleValidationDB= err=>{
const errors= Object.values(err.errors).map(el=>el.message);
  const message=`invalid input data. ${errors.join(". ")}`
  return new AppError(message,400)
}
const handleCastErrorDB=err=>{
const message= `invalid ${err.path}:${err.value}`
return  new  AppError(message,400)
}
const sendErrorDev= (err,req,res )=>{
  //A API
  if(req.originalUrl.startsWith("/api")){
  return res.status(err.statusCode).json({
    status: err.status,
    error:err,
    message: err.message,
    stack:err.stack
  });
}

  //B RENDERED WEBSITE
 return res.status(err.statusCode).render("error",{
    title:"Something went Wrong!",
    msg:err.message
  })

}   

const handleJwtError= err => new AppError(
  "invalid token!please log in agin",401)

const handleJwtExpiredError= err=> new AppError(
  "token is expired! please log in agian ",401)

const sendErrorPro=(err,req,res)=>{
  
  //A API
  if(req.originalUrl.startsWith("/api")){
    //A Operational, trusted error: send message to client
  if(err.isOperational){
  return res.status(err.statusCode).json({
    status: err.status,
    message: err.message
  });
}
  //Programming or other  unknown error: do not leak error details
  //1. log error
    console.error("ERORRRRRRRRR h babu ",err);
  //2. send generic message
  return res.status(500).json({
    status:"error",
    message:"something went very wrong"
  })

  }
    //B) RENDERED WEBSITE
    if(err.isOperational){
   return res.status(err.statusCode).render("error",{
    title:"Something went Wrong!",
    msg:err.message
  })
    }
    //1. log error
        console.error("ERORRRRRRRRR h babu ",err);
      //2. send generic message
     //RENDERED WEBSITE
 return res.status(err.statusCode).render("error",{
    title:"Something went Wrong!",
    msg:"PLS try again later"
      })
  }


module.exports=(err, req, res, next) => {

  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
if (process.env.NODE_ENV==="development"){
  sendErrorDev(err,req,res)
 
}else if(process.env.NODE_ENV==="production"){
  let error={...err}
  error.message=err.message
  if(error.name==="CastError")error= handleCastErrorDB(error)
  // if (error.code===11000)error= handleDuplicateFiled(error)
  if(error.name==="ValidationError") error= handleValidationDB(error)
  if(error.name==="JsonWebTokenError") error= handleJwtError(error)
  if(error.name==="TokenExpiredError")  error= handleJwtExpiredError(error)
sendErrorPro(error,req,res)
}
 
};
