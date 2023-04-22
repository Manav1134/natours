/* eslint-disable prettier/prettier */
/* eslint-disable import/no-useless-path-segments */
/* eslint-disable prettier/prettier */
/* eslint-disable no-unused-vars */
/* eslint-disable prettier/prettier */

const fs= require("fs");
const mongoose= require ("mongoose");
const dotenv = require('dotenv');
const Tour= require("./../../models/tourModels");
const User= require("./../../models/userModels");
const Review= require("./../../models/reviewModels");


dotenv.config({ path: './config.env' });
// here we connect mongoose to the application
const db= process.env.DATABASE.replace("<PASSWORD>",
process.env.DATABASE_PASSWORD)

mongoose.connect(db,{
  useUnifiedTopology: true ,
  useNewUrlParser:true,
  useCreateIndex: true,
  useFindAndModify:false
}).then(()=>{ 
  console.log("db connection");
});
// READING JSON FILE

const tours=JSON.parse(fs.readFileSync(`${__dirname}/tours.json`,"utf-8"))
const users=JSON.parse(fs.readFileSync(`${__dirname}/users.json`,"utf-8"))
const reviews=JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`,"utf-8"))

////IMPORTING DATA/////////////


const importData= async()=>{

    try{
        await Tour.create(tours)
        await User.create(users,{ validateBeforeSave:false })
        await Review.create(reviews)
        console.log("data successfully loaded")
    } catch (err){
      console.log(err)
    }
    process.exit();
}

const deleteData= async()=>{

    try{
        await Tour.deleteMany()
        await User.deleteMany()
        await Review.deleteMany()
        console.log("data successfully deleted")
    } catch (err){
      console.log(err)
    }
    process.exit();
}
if(process.argv[2]==="--import"){
      importData()
}else if(process.argv[2]==="--delete"){
     deleteData();
}
console.log(process.argv)