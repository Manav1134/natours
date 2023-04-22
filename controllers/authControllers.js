/*eslint-disable*/
const crypto= require("crypto")
const User= require("./../models/userModels")
const { promisify }= require("util")
const jwt= require("jsonwebtoken")
const AppError = require('./../utils/appError');
const Email = require('./../utils/email');

const catchAsync= require("./../utils/catchAsync");
const { json } = require("express");

const signToken=id=>{
  return jwt.sign({id},process.env.JWT_SECRET,{
      // expiresIn: process.env.JWT_EXPIRES_IN
      expiresIn:"90d"
   });
}

const createSendToken=(user,statusCode,res)=>{
   
   const token=signToken(user._id)
   const cookieOptions={
      expires: new Date(
         Date.now()+ 90 * 24 * 60 * 60 * 1000
         ),
         httpOnly:true
   };
   if(process.env.NODE_ENV==="production") cookieOptions.secure=true;
   res.cookie("jwt",token,cookieOptions) 
   //Removes the password from output
   user.password=undefined
   res.status(statusCode).json({
      status:"success",
      token,
      data:{
       user
      }
  
     })
}
exports.signup= catchAsync(async(req,res,next)=>{

   const newUser= await User.create({
      name:req.body.name,
      email:req.body.email,
      password:req.body.password,
      passwordConfirm:req.body.passwordConfirm,
      passwordChangedAt:req.body.passwordChangedAt,
      role:req.body.role,
      passwordResetToken:req.body.passwordResetToken,
      passwordResetExpires: req.body.passwordResetExpires
   })
   const url=`${req.protocol}://${req.get("host")}/me`
  await new Email(newUser,url).sendWelcome()

createSendToken(newUser,201,res)

})

exports.login=catchAsync(async (req,res,next)=>{
   const {email,password}= req.body

//1) check if email and password exist

if(!email || !password){
 return  next( (new AppError("please provide email and password", 400)))
}

//2) check if user exist and password is correct

 const user=  await User.findOne({ email }).select("+password")

 if(!user||! await user.correctPassword(password,user.password)){
   return next(new AppError("incorrect emial and password",401));
 }
//3) if everthing ok, send  token  to client
createSendToken(user,200,res)


})

exports.logout=(req,res)=>{
   res.cookie("jwt","loggedout",{
      expires: new Date(Date.now()+ 10 * 1000),
      httpOnly: true
   })
   res.status(200).json({
      status:"success"
   })
}


exports.protect=catchAsync(async(req,res,next)=>{
   //1.) getting token and check if it is there
   let token;
   if(req.headers.authorization && 
      req.headers.authorization.startsWith("Bearer"))
      {
         token= req.headers.authorization.split(" ")[1]
      }else if(req.cookies.jwt){
         token=req.cookies.jwt
      }

    

      if (!token){
         return next(new AppError("you are not logged in! please log in to get access"
         ,401))
      }
      //2.)verification token
    const decoded=await promisify(jwt.verify)(token,process.env.JWT_SECRET)
    //3.) check if user still exists
      
const currentUser= await User.findById(decoded.id)
    if(!currentUser){
      return next(new AppError("the user belongs to this token no longer exists"
      ,401))
     }
//4.)
   if(currentUser.changedPasswordAfter(decoded.iat)){
       return next(new AppError("user recently changed password! please log in again")
      , 401)
   }
   // grant access to protected route
   req.user= currentUser
   res.locals.user= currentUser;
next()
})

// only for rendered pages, and there will be no error
exports.isLoggedIn=async(req,res,next)=>{
   //1). verify token
       if(req.cookies.jwt){
         try{
    const decoded=await promisify(jwt.verify)(req.cookies.jwt,process.env.JWT_SECRET)
    //2) check if user still exists 
const currentUser= await User.findById(decoded.id)
    if(!currentUser){
      return next()
     }
//3.) check if  user changed  password after the token is issued
   if(currentUser.changedPasswordAfter(decoded.iat)){
       return next()
   }

   // There is a Logged in User
   res.locals.user= currentUser;
   return next()
}catch(err){
   return next()
}
}
 next()
}

exports.restrictTO=(...roles)=>{
   return(req,res,next)=>{
   // roles ["admin","lead-guid"] roles=user
   if(!roles.includes(req.user.role)){
      return next (new AppError ("you do not have permission to do this",403))
   }
   next();
   };
};

exports.forgotPassword=catchAsync(async(req,res,next)=>{
//1.) get user based  on posted email
const  user= await User.findOne({email:req.body.email})
if(!user){
   return next(new AppError("there is no  user with email address"),404)
}
//2.) generate the random reset token
const resetToken= user.createPasswordResetToken();
await user.save({validateBeforeSave:false })

//3.)send it to user's email
 const resetURL=`${req.protocol}://${req.get(
   "host"
   )}/api/v1/users/resetpassword/${resetToken}`;
   
   // eslint-disable-next-line no-var
   const message=`forgot your password?submit patch request with new password
   and conform password to ${resetURL}`
   try{
      // await sendEmail({
      //    email:user.email,
      //    subject:"your password  reset token (valid for 10 min)",
      //    text:message
      // })
      res.status(200).json({
         status:"success",
         message:"token sent to email"
      })
   }catch (err){
      user.passwordResetToken=undefined;
      user.passwordResetExpires=undefined;
      await user.save({validateBeforeSave:false })
      // console.log(err)
      return next(
         new AppError("there was an error sending this mail")
      ,500)
   }
})

exports.resetPassword=catchAsync (async(req,res,next)=>{
   //1.)get user  based on the token
   const hashedToken=crypto
   .createHash("sha256")
   .update(req.params.token)
   .digest("hex");

   const user= await User.findOne({passwordResetToken:hashedToken,
       passwordResetExpires:{$gt:Date.now()}})
//2.)) IF token has not expired, amd  there is user, set the new password
if(!user){
   return next(new AppError("token is invalid or has expired",400))
}
user.password=req.body.password;
user.passwordConfirm=req.body.passwordConfirm
user.passwordResetToken=undefined;
user.passwordResetExpires =undefined;
await user.save()

//4.)log the user in, send jwt
createSendToken(user,200,res)
})

exports.updatePassword= catchAsync (async (req,res,next)=>{
//1. get user from collection
const user= await User.findById(req.user.id).select("+password")
//2. check if posted current password is correct
 if (!(await user.correctPassword(req.body.user.password)))
 {
   return next( new AppError("invalid"))
}
//.3)if so,update password
user.password=req.body.password;
user.passwordConfirm=req.body.passwordConfirm;
await user.save();
//User.findByIdAndUpdate will not work as intended

//4.)log user in. send JWT
createSendToken(user,200,res)
})