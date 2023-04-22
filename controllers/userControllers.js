/* eslint-disable prettier/prettier */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable import/order */
/* eslint-disable no-unused-vars */
/* eslint-disable prettier/prettier */
/* eslint-disable import/no-useless-path-segments */
/* eslint-disable prettier/prettier */

const User = require('./../models/userModels');
const catchAsync= require("./../utils/catchAsync");
const AppError = require('./../utils/appError');
const multer= require("multer")
const factory=require("./handlerFactory")
const sharp= require("sharp")


// const multerStorage=multer.diskStorage({
//     destination:(req,file,cb)=>{
//         cb(null,"public/img/users")
//     },
//      filename:(req,file,cb)=>{
//         const ext=file.mimetype.split("/")[1];
//       cb(null,`user-${req.user.id}-${Date.now()}.${ext}`)
//      }
// });
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

exports.uploadUserPhoto=upload.single("photo")

exports.resizeUserPhoto= catchAsync(async (req,res,next)=>{
    if(!req.file) return  next()

    req.file.filename=`user-${req.user.id}-${Date.now()}.jpeg`;

    await sharp(req.file.buffer)
     .resize(500,500)
     .toFormat("jpeg")
     .jpeg({quality:90})
     .toFile(`public/img/users/${ req.file.filename}`)

    next()
}
)
const filterObj=(obj, ...allowedFields)=>{
    const newObj={};
    Object.keys(obj).forEach(el=>{
        if(allowedFields.includes(el)) newObj[el]=obj[el]
    })
    return newObj;
}
exports.getMe=(req,res,next)=>{
    req.params.id=req.user.id
    next()
}
// exports.getAllusers=catchAsync(async (req,res)=>{
//     const users= await User.find();
//   res.status(200).json({
//     status: 'success',
//    results:users.length,
//     data:{
//       tour:users
//     }
// })
// })
exports.getAllusers=factory.getAll(User)

exports.updateMe=catchAsync(async (req,res,next)=>{
//1.))create error if user posts password Data
if(req.body.password||req.body.passwordConfirm){
    return next(new AppError
        ("This route is not for password.Please USe /updateMypassword",
        400
        )
        );
}
//2.)filtered out unwamted fields names that are not allowed to be updated
const filteredBody=filterObj(req.body,"name","email")
if(req.file) filteredBody.photo = req.file.filename

//3.))update user document
const updateUser= await User.findByIdAndUpdate(req.user.id, filteredBody,{
    new:true,
    runValidators:true,
})
res.status(200).json({
    status:"success",
    data:{
        user: updateUser
    }
})
})

exports.deleteMe=catchAsync(async(req,res,next)=>{
    console.log(req.file)
    console.log(req.body)
    await User.findByIdAndUpdate(req.user.id,{active:false});

    res.status(204).json({
        status:"success",
        data:null
    })
})
    exports.createUsers=(req,res)=>{
    res.status(500).json({
        status:"error",
        message:"this is not defined. please use /signup insted"
    });
    };
    exports.getOneuser=factory.getOne(User)

    //Do not update password with this
    exports.updateUser=factory.updateOne(User)
    exports.deleteUser=factory.deleteOne(User)