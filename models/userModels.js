/* eslint-disable prettier/prettier */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-unused-vars */
/* eslint-disable prettier/prettier */

const mongoose= require("mongoose")
const crypto= require("crypto")
const validator= require("validator");
const bcrypt= require("bcryptjs");

const userSchema= new mongoose.Schema({
  name:{
    type:String,
    required:[true,"You have to fill name"],
    // trim:true,
    // maxLength:[25,"name must be below 24"],
    // minLenght:[4, "name must be above 4"]
  },
email:{
    type:String,
    required:[true,"user must have an email"],
    unique:true,
    lowercase:true,// it tranfer email into lower case
    validator:[validator.isEmail,"please provide a valid email"]
},
photo:{
    type:String,
    default:"default.jpg"
},

role:{
type:String,
enum:  ["user","guide","lead-guide","admin"],
default:"user"
},
password:{
    type:String,
    required:[true,"please provide a password"],
    minLength:[8,"password must be above 8 letters"],
    select:false

},
passwordChangedAt:Date,

passwordConfirm:
{
    type:String,
required:[true,"please conform the password"],
//this only works on create and save
validate:{
  validator:function(el){
return el===this.password
  },
  message:"password does not match"
}

},
passwordResetToken:String,
passwordResetExpires: Date,

active:{
  type:Boolean,
  select:false,
  default:true
}

}) 
userSchema.pre("save", async function(next){
  //only run when password is actually modified
  if (!this.isModified("password")) return next()
/////// hash the password with the cost 12
  this.password=await bcrypt.hash(this.password, 12)

  //// delete password filed
  this.passwordConfirm=undefined;
  next();
})

userSchema.pre("save",function(next){
  if(!this.isModified("password")|| this.isNew)
  return next();
  this.passwordChangedAt=Date.now() -1000
  next();


})
userSchema.pre("/^find/",function(next){
 this.find({active:{$ne:false}})
})
userSchema.methods.correctPassword=async function(
  candidatePassword,userPassword
  ) {
return await bcrypt.compare(candidatePassword,userPassword)

}

userSchema.methods.changedPasswordAfter=function(JWTTimestamp)
{

  if(this.passwordChangedAt){
    const changedTimeStamp=parseInt(
      this.passwordChangedAt.getTime()/1000,
      10)
    console.log(changedTimeStamp,JWTTimestamp)
    return JWTTimestamp<changedTimeStamp//100<200 so here the paasowrd changed
    // now actual time after password change is 300<200 now we return false
  }
  ///False means NOT changed 
  return false
}

userSchema.methods.createPasswordResetToken=function(){
  const resetToken= crypto.randomBytes(32).toString("hex")
 this.passwordResetToken= 
 crypto.createHash("sha256").
 update(resetToken).
 digest("hex")
 console.log({resetToken},this.passwordResetToken)
    
this.passwordResetExpires=Date.now()+10 * 60 * 1000

return resetToken
}
 const User= mongoose.model("User",userSchema)

 module.exports=User;