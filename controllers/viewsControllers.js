/* eslint-disable prettier/prettier */
/* eslint-disable no-undef */
/* eslint-disable prettier/prettier */
/* eslint-disable no-unused-vars */
/* eslint-disable prettier/prettier */

const Tour= require("../models/tourModels")
const catchAsync= require("../utils/catchAsync")
const AppError= require("../utils/appError")
const User=require("../models/userModels")

exports.getOverview=catchAsync(async(req,res)=>{
//1) get tour data from collection 
//2)build template
//3)Render the template using data from 1)
const tours= await Tour.find()
///Iss jgha assi template to render krde aa. Mtlb uss nu show karvande aa website de response ch
    res.status(200).render("overview",{
      title:"All Tours",
      tours:tours
    });
  })

  exports.getTour=catchAsync(async(req,res,next)=>{

    const tour= await Tour.findOne({slugify: req.params.slugify}).populate({
       path:"reviews",
       fields:"review ratings user"
  });

  if(!tour){
    return next(new AppError("there is no tour with that name",404))
  }
    // 2) Build template
  // 3) Render template using data from 1)
  ///Iss jgha assi template to render krde aa. Mtlb uss nu show karvande aa website de response ch
    res.status(200).render("tour",{
      title:`${tour.name} Tour`,
      tour
    });
  })

 exports.getLoginForm = (req, res) => {
    res.status(200)
        .set(
            'Content-Security-Policy',
            "connect-src 'self' http://127.0.0.1:3000/"
        )
        .render('login', {
            title: 'Log into your account',
        });
};

exports.getSignupForm=catchAsync(async(req,res,next)=>{

  ///Iss jgha assi template to render krde aa. Mtlb uss nu show karvande aa website de response ch
   res.status(200).render("signup",{  
    title:"signup into your Account"
   })
    })
exports.getAccount=(req,res)=>{

  ///Iss jgha assi template to render krde aa. Mtlb uss nu show karvande aa website de response ch
   res.status(200).render("account",{  
    title:"Your Account"
   })
    }

// exports.updateUserData=catchAsync(async(req,res,next)=>{
// const updatedUser= await User.findByIdAndUpdate(req.user.id,{
// name:req.body.name,
// email:req.body.email
// },
// {
//   new:true,
//   runValidators:true
// })
// res.status(200).render("account",{  
//   title:"Your Account",
//   user:updatedUser
// })
// })

